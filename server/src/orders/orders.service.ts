import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { CancelOrdersDto } from './dto/cancel-orders.dto';
import { Order, OrderStatus, BagStatus, Prisma, OrderType } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { Decimal } from '@prisma/client/runtime/library';
import { UpdateClientDto } from '../clientes/dto/update-client.dto';
import { ClientsService } from '../clientes/clients.service'; // Novedad: Importamos ClientsService

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads');

  // ======================================================================
  // MEJORA: Lógica de Transición de Estados Centralizada
  // ======================================================================
  private readonly validTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
    PENDIENTE: [OrderStatus.EN_PRODUCCION, OrderStatus.CANCELADO],
    EN_PRODUCCION: [OrderStatus.EN_PROCESO, OrderStatus.CANCELADO],
    EN_PROCESO: [OrderStatus.LISTO_PARA_ENTREGA, OrderStatus.CANCELADO],
    LISTO_PARA_ENTREGA: [OrderStatus.ENTREGADO, OrderStatus.CANCELADO],
  };

  constructor(
    private prisma: PrismaService,
    private clientsService: ClientsService, // Novedad: Inyectamos ClientsService
  ) {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }
  }

  // ======================================================================
  // MEJORA: Método auxiliar para validar transiciones
  // ======================================================================
  private async validateTransition(
    orderId: string,
    nextStatus: OrderStatus,
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Pedido con ID "${orderId}" no encontrado.`);
    }

    const currentStatus = order.estado;
    const allowedNextStates = this.validTransitions[currentStatus];

    if (!allowedNextStates || !allowedNextStates.includes(nextStatus)) {
      throw new ForbiddenException(
        `Transición de estado de '${currentStatus}' a '${nextStatus}' no es válida.`,
      );
    }

    return order;
  }

  // ======================================================================
  // 3.1. Endpoint: Creación de Pedido (POST /pedidos) - MODIFICADO
  // ======================================================================
  async create(
    createOrderDto: CreateOrderDto,
    imageFile?: Express.Multer.File,
  ): Promise<Order> {
    const {
      bagId,
      clienteNombre,
      clienteCedula,
      clienteCelular,
      trabajadorId, // Extraemos trabajadorId
      ...orderData // El resto de los datos del pedido (tipo, descripcion, abono, etc.)
    } = createOrderDto;

    // Novedad: Primero, buscamos o creamos el cliente
    const client = await this.clientsService.findOrCreate({
      nombre: clienteNombre,
      cedula: clienteCedula,
      celular: clienteCelular,
    });

    const newOrder = await this.prisma.$transaction(async (tx) => {
      const bag = await tx.bag.findUnique({ where: { id: bagId } });

      if (!bag) {
        throw new NotFoundException(`Bolsa con ID "${bagId}" no encontrada.`);
      }
      if (bag.status === BagStatus.OCUPADA) {
        throw new ConflictException(
          `Bolsa con ID "${bagId}" ya está ocupada.`,
        );
      }

      // Novedad: Verificar que el trabajador existe
      const workerExists = await tx.worker.findUnique({ where: { id: trabajadorId } });
      if (!workerExists) {
        throw new NotFoundException(`Trabajador con ID "${trabajadorId}" no encontrado.`);
      }

      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await this.saveImageFile(imageFile);
      }

      const order = await tx.order.create({
        data: {
          ...orderData,
          abono: new Decimal(orderData.abono),
          total: new Decimal(orderData.total),
          fechaEntrega: new Date(orderData.fechaEntrega),
          
          bag: { connect: { id: bagId } },
          cliente: {
            connectOrCreate: {
              where: { cedula: clienteCedula },
              create: {
                nombre: clienteNombre,
                cedula: clienteCedula,
                celular: clienteCelular,
              },
            },
          },
          trabajador: { connect: { id: trabajadorId } },
          
          estado: OrderStatus.PENDIENTE,
          imagenUrl: imageUrl,
        },
      });

      await tx.bag.update({
        where: { id: bagId },
        data: { status: BagStatus.OCUPADA },
      });

      return order;
    });

    return newOrder;
  }

  // ======================================================================
  // 3.3. Endpoint: Obtención de Pedidos (GET /pedidos) - MODIFICADO
  // ======================================================================
  async findAll(query: OrderQueryDto): Promise<{ data: Order[]; total: number; page: number; pageSize: number; lastPage: number }> {
    const { search, estado } = query;
    const orderBy = query.orderBy ?? 'createdAt';
    const orderDirection = query.orderDirection ?? 'asc';
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (estado && estado.length > 0) {
      where.estado = { in: estado };
    }

    if (search) {
      const searchLower = search.toLowerCase();
      const searchUpper = search.toUpperCase(); // Añadido para la validación del enum

      where.OR = [
        // El tipo es un enum y no soporta 'contains'.
        // Solo se añade al OR si el término de búsqueda coincide exactamente con un OrderType.
        ...(Object.values(OrderType).includes(searchUpper as OrderType)
          ? [{ tipo: { equals: searchUpper as OrderType } }]
          : []),
        { descripcion: { contains: search, mode: 'insensitive' } },
        { bagId: { contains: search, mode: 'insensitive' } },
        {
          cliente: { // Búsqueda en los campos del cliente relacionado
            OR: [
              { nombre: { contains: search, mode: 'insensitive' } },
              { cedula: { contains: search, mode: 'insensitive' } },
              { celular: { contains: search, mode: 'insensitive' } },
            ]
          }
        },
        {
          trabajador: { // Búsqueda en los campos del trabajador relacionado
            nombre: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }
    
    // Novedad: Incluimos el cliente y trabajador en la respuesta por defecto
    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDirection },
        include: { // Novedad: Incluimos datos relacionados
          cliente: true,
          trabajador: true,
          bag: true, // Asumo que ya la incluías o la necesitarás
        }
      }),
      this.prisma.order.count({ where }),
    ]);

    const lastPage = Math.ceil(total / limit);

    return { data, total, page, pageSize: limit, lastPage };
  }

  // ======================================================================
  // 3.2. Endpoint: Obtención de Pedido por ID (GET /pedidos/:id) - MODIFICADO
  // ======================================================================
  async findOne(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { // Novedad: Incluimos datos relacionados
        cliente: true,
        trabajador: true,
        bag: true,
      }
    });
    if (!order) {
      throw new NotFoundException(`Pedido con ID "${id}" no encontrado.`);
    }
    return order;
  }

  // ======================================================================
  // 3.4. Endpoint: Actualización de Pedido (PUT/PATCH /pedidos/:id) - Sin cambios sustanciales, pero requiere revisión
  // ======================================================================
  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    imageFile?: Express.Multer.File,
  ): Promise<Order> {
    const existingOrder = await this.findOne(id);
    if (existingOrder.estado !== OrderStatus.PENDIENTE) {
      throw new ForbiddenException(
        `El pedido con ID "${id}" solo puede ser actualizado si su estado es PENDIENTE. Estado actual: ${existingOrder.estado}.`,
      );
    }

    // Novedad: Separar datos del cliente y del pedido
    const { clienteNombre, clienteCelular, ...orderSpecificUpdates } = updateOrderDto;

    // Novedad: Actualizar datos del cliente si se proporcionan
    if (clienteNombre || clienteCelular) {
      if (!existingOrder.clienteId) {
        throw new BadRequestException(
          'El pedido no tiene un cliente asociado para actualizar.',
        );
      }
      
      // Novedad: Construir objeto de actualización solo con campos definidos
      const clientUpdateData: UpdateClientDto = {};
      if (clienteNombre) {
        clientUpdateData.nombre = clienteNombre;
      }
      if (clienteCelular) {
        clientUpdateData.celular = clienteCelular;
      }

      await this.clientsService.update(existingOrder.clienteId, clientUpdateData);
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      let newImageUrl: string | undefined | null = existingOrder.imagenUrl;
      if (imageFile) {
        if (existingOrder.imagenUrl)
          await this.deleteImageFile(existingOrder.imagenUrl);
        newImageUrl = await this.saveImageFile(imageFile);
      } else if (orderSpecificUpdates.imagenUrl === null) {
        if (existingOrder.imagenUrl)
          await this.deleteImageFile(existingOrder.imagenUrl);
        newImageUrl = null;
      }

      const dataToUpdate: Prisma.OrderUpdateInput = {
        ...orderSpecificUpdates,
        abono:
          orderSpecificUpdates.abono !== undefined
            ? new Decimal(orderSpecificUpdates.abono)
            : undefined,
        total:
          orderSpecificUpdates.total !== undefined
            ? new Decimal(orderSpecificUpdates.total)
            : undefined,
        fechaEntrega:
          orderSpecificUpdates.fechaEntrega !== undefined
            ? new Date(orderSpecificUpdates.fechaEntrega)
            : undefined,
        imagenUrl: newImageUrl,
      };

      // Novedad: Nos aseguramos de no pasar campos de relaciones directamente
      delete (dataToUpdate as any).bagId;
      delete (dataToUpdate as any).clienteId;
      delete (dataToUpdate as any).trabajadorId;
      delete (dataToUpdate as any).clienteNombre;
      delete (dataToUpdate as any).clienteCelular;
      delete (dataToUpdate as any).clienteCedula;


      return tx.order.update({ where: { id }, data: dataToUpdate });
    });

    // Novedad: Devolver el pedido actualizado con toda la información
    return this.findOne(id);
  }

  // ======================================================================
  // MEJORA: Métodos de transición usando el validador central
  // ======================================================================
  async updateStatusEnProduccion(id: string): Promise<Order> {
    await this.validateTransition(id, OrderStatus.EN_PRODUCCION);
    return this.prisma.order.update({
      where: { id },
      data: { estado: OrderStatus.EN_PRODUCCION },
      include: { cliente: true, trabajador: true, bag: true }
    });
  }

  async updateStatusEnProceso(id: string): Promise<Order> {
    await this.validateTransition(id, OrderStatus.EN_PROCESO);
    return this.prisma.order.update({
      where: { id },
      data: { estado: OrderStatus.EN_PROCESO },
      include: { cliente: true, trabajador: true, bag: true }
    });
  }

  async updateStatusListoParaEntrega(id: string): Promise<Order> {
    await this.validateTransition(id, OrderStatus.LISTO_PARA_ENTREGA);
    return this.prisma.order.update({
      where: { id },
      data: { estado: OrderStatus.LISTO_PARA_ENTREGA, fechaFinalizacion: new Date() },
      include: { cliente: true, trabajador: true, bag: true }
    });
  }

  async updateStatusEntregado(id: string): Promise<Order> {
    const order = await this.validateTransition(id, OrderStatus.ENTREGADO);
    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { estado: OrderStatus.ENTREGADO, fechaEntregaReal: new Date() },
        include: { cliente: true, trabajador: true, bag: true }
      });
      await tx.bag.update({
        where: { id: order.bagId },
        data: { status: BagStatus.DISPONIBLE },
      });
      return updatedOrder;
    });
  }

  async cancelOrder(id: string): Promise<Order> {
    const order = await this.validateTransition(id, OrderStatus.CANCELADO);
    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { estado: OrderStatus.CANCELADO, fechaCancelacion: new Date() },
        include: { cliente: true, trabajador: true, bag: true }
      });
      await tx.bag.update({
        where: { id: order.bagId },
        data: { status: BagStatus.DISPONIBLE },
      });
      return updatedOrder;
    });
  }

  // ======================================================================
  // OTROS MÉTODOS - Sin cambios
  // ======================================================================
  async cancelMultipleOrders(cancelDto: CancelOrdersDto): Promise<Order[]> {
    const { bagIds } = cancelDto;
    const canceledOrders = await this.prisma.$transaction(async (tx) => {
      const ordersToCancel = await tx.order.findMany({
        where: {
          bagId: { in: bagIds },
          NOT: { estado: { in: [OrderStatus.ENTREGADO, OrderStatus.CANCELADO] } },
        },
      });
      if (ordersToCancel.length !== bagIds.length) {
        const foundBagIds = ordersToCancel.map(o => o.bagId);
        const notFoundBagIds = bagIds.filter(id => !foundBagIds.includes(id));
        throw new NotFoundException(
          `No se pudieron encontrar o cancelar todos los pedidos. Bolsas no válidas o ya en estado final: ${notFoundBagIds.join(', ')}.`,
        );
      }
      await tx.order.updateMany({
        where: { id: { in: ordersToCancel.map(o => o.id) } },
        data: { estado: OrderStatus.CANCELADO, fechaCancelacion: new Date() },
      });
      await tx.bag.updateMany({
        where: { id: { in: bagIds } },
        data: { status: BagStatus.DISPONIBLE },
      });
      // Novedad: Incluir cliente y trabajador en las órdenes devueltas
      return tx.order.findMany({
        where: { id: { in: ordersToCancel.map(o => o.id) } },
        include: { cliente: true, trabajador: true, bag: true }
      });
    });
    return canceledOrders;
  }

  async resetSystem(): Promise<void> {
    this.logger.warn('⚠️ Initiating full system reset...');
    await this.prisma.$transaction(async (tx) => {
      await tx.order.deleteMany({});
      this.logger.log('All orders deleted.');
      await tx.bag.updateMany({ where: {}, data: { status: BagStatus.DISPONIBLE } });
      this.logger.log('All bags reset to DISPONIBLE.');
    });
    this.logger.warn('✅ System reset completed successfully.');
  }

  private async saveImageFile(file: Express.Multer.File): Promise<string> {
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.UPLOAD_DIR, filename);
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, file.buffer, (err) => {
        if (err) {
          this.logger.error(`Error saving image file: ${err.message}`);
          return reject(new BadRequestException('Error al guardar el archivo de imagen.'));
        }
        resolve(`/uploads/${filename}`);
      });
    });
  }

  private async deleteImageFile(imageUrl: string): Promise<void> {
    const filename = path.basename(imageUrl);
    const filePath = path.join(this.UPLOAD_DIR, filename);
    return new Promise((resolve) => {
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            this.logger.error(`Error deleting image file: ${err.message}`);
          } else {
            this.logger.log(`Image file deleted: ${filePath}`);
          }
          resolve();
        });
      } else {
        this.logger.warn(`Attempted to delete non-existent image file: ${filePath}`);
        resolve();
      }
    });
  }
}