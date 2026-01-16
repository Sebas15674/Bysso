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
import {
  Order,
  OrderStatus,
  BagStatus,
  Prisma,
  OrderType,
} from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { Decimal } from '@prisma/client/runtime/library';
import { UpdateClientDto } from '../clientes/dto/update-client.dto';
import { ClientsService } from '../clientes/clients.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads');

  private readonly validTransitions: Partial<
    Record<OrderStatus, OrderStatus[]>
  > = {
    PENDIENTE: [OrderStatus.EN_PRODUCCION, OrderStatus.CANCELADO],
    EN_PRODUCCION: [OrderStatus.EN_PROCESO, OrderStatus.CANCELADO],
    EN_PROCESO: [OrderStatus.LISTO_PARA_ENTREGA, OrderStatus.CANCELADO],
    LISTO_PARA_ENTREGA: [OrderStatus.ENTREGADO, OrderStatus.CANCELADO],
  };

  constructor(
    private prisma: PrismaService,
    private clientsService: ClientsService,
  ) {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }
  }

  private async validateTransition(
    orderId: string,
    nextStatus: OrderStatus,
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

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

  async create(
    createOrderDto: CreateOrderDto,
    imageFile?: Express.Multer.File,
  ): Promise<Order> {
    const {
      bagId,
      clienteNombre,
      clienteCedula,
      clienteCelular,
      trabajadorId,
      ...orderData
    } = createOrderDto;

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
        throw new ConflictException(`Bolsa con ID "${bagId}" ya está ocupada.`);
      }

      const workerExists = await tx.worker.findUnique({
        where: { id: trabajadorId },
      });
      if (!workerExists) {
        throw new NotFoundException(
          `Trabajador con ID "${trabajadorId}" no encontrado.`,
        );
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
                              fechaEntrega: new Date(`${orderData.fechaEntrega}T00:00:00`),
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

  async findAll(query: OrderQueryDto): Promise<{
    data: Order[];
    total: number;
    page: number;
    pageSize: number;
    lastPage: number;
  }> {
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
      const searchUpper = search.toUpperCase();

      where.OR = [
        ...(Object.values(OrderType).includes(searchUpper as OrderType)
          ? [{ tipo: { equals: searchUpper as OrderType } }]
          : []),
        { descripcion: { contains: search, mode: 'insensitive' } },
        { bagId: { contains: search, mode: 'insensitive' } },
        {
          cliente: {
            OR: [
              { nombre: { contains: search, mode: 'insensitive' } },
              { cedula: { contains: search, mode: 'insensitive' } },
              { celular: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          trabajador: {
            nombre: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDirection },
        include: {
          cliente: true,
          trabajador: true,
          bag: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const lastPage = Math.ceil(total / limit);

    return { data, total, page, pageSize: limit, lastPage };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        cliente: true,
        trabajador: true,
        bag: true,
      },
    });
    if (!order) {
      throw new NotFoundException(`Pedido con ID "${id}" no encontrado.`);
    }
    return order;
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    imageFile?: Express.Multer.File,
  ): Promise<Order> {
    const existingOrder = await this.findOne(id);
    if (
      existingOrder.estado !== OrderStatus.PENDIENTE &&
      existingOrder.estado !== OrderStatus.EN_PRODUCCION &&
      existingOrder.estado !== OrderStatus.EN_PROCESO
    ) {
      throw new ForbiddenException(
        `El pedido con ID "${id}" no puede ser actualizado en su estado actual (${existingOrder.estado}). Solo se permite la edición en los estados: PENDIENTE, EN_PRODUCCION, EN_PROCESO.`,
      );
    }

    const { clienteNombre, clienteCelular, ...orderSpecificUpdates } =
      updateOrderDto;

    if (clienteNombre || clienteCelular) {
      if (!existingOrder.clienteId) {
        throw new BadRequestException(
          'El pedido no tiene un cliente asociado para actualizar.',
        );
      }

      const clientUpdateData: UpdateClientDto = {};
      if (clienteNombre) {
        clientUpdateData.nombre = clienteNombre;
      }
      if (clienteCelular) {
        clientUpdateData.celular = clienteCelular;
      }

      await this.clientsService.update(
        existingOrder.clienteId,
        clientUpdateData,
      );
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
            ? new Date(`${orderSpecificUpdates.fechaEntrega}T00:00:00`)
            : undefined,
        imagenUrl: newImageUrl,
      };

      delete (dataToUpdate as any).bagId;
      delete (dataToUpdate as any).clienteId;
      delete (dataToUpdate as any).clienteNombre;
      delete (dataToUpdate as any).clienteCelular;
      delete (dataToUpdate as any).clienteCedula;

      return tx.order.update({ where: { id }, data: dataToUpdate });
    });

    return this.findOne(id);
  }

  async updateStatusEnProduccion(id: string): Promise<Order> {
    await this.validateTransition(id, OrderStatus.EN_PRODUCCION);
    return this.prisma.order.update({
      where: { id },
      data: { estado: OrderStatus.EN_PRODUCCION },
      include: { cliente: true, trabajador: true, bag: true },
    });
  }

  async updateStatusEnProceso(id: string): Promise<Order> {
    await this.validateTransition(id, OrderStatus.EN_PROCESO);
    return this.prisma.order.update({
      where: { id },
      data: { estado: OrderStatus.EN_PROCESO },
      include: { cliente: true, trabajador: true, bag: true },
    });
  }

  async updateStatusListoParaEntrega(id: string): Promise<Order> {
    await this.validateTransition(id, OrderStatus.LISTO_PARA_ENTREGA);
    return this.prisma.order.update({
      where: { id },
      data: {
        estado: OrderStatus.LISTO_PARA_ENTREGA,
        fechaFinalizacion: new Date(),
      },
      include: { cliente: true, trabajador: true, bag: true },
    });
  }

  async updateStatusEntregado(id: string): Promise<Order> {
    const order = await this.validateTransition(id, OrderStatus.ENTREGADO);
    return this.prisma.$transaction(async (tx) => {
      if (order.imagenUrl) {
        await this.deleteImageFile(order.imagenUrl);
      }
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { estado: OrderStatus.ENTREGADO, fechaEntregaReal: new Date(), imagenUrl: null },
        include: { cliente: true, trabajador: true, bag: true },
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
      if (order.imagenUrl) {
        await this.deleteImageFile(order.imagenUrl);
      }
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { estado: OrderStatus.CANCELADO, fechaCancelacion: new Date(), imagenUrl: null },
        include: { cliente: true, trabajador: true, bag: true },
      });
      await tx.bag.update({
        where: { id: order.bagId },
        data: { status: BagStatus.DISPONIBLE },
      });
      return updatedOrder;
    });
  }

  async cancelMultipleOrders(cancelDto: CancelOrdersDto): Promise<Order[]> {
    const { bagIds } = cancelDto;

    if (bagIds.length === 0) {
        return [];
    }

    const canceledOrders = await this.prisma.$transaction(async (tx) => {
      const ordersToCancel = await tx.order.findMany({
        where: {
          bagId: { in: bagIds },
          NOT: {
            estado: { in: [OrderStatus.ENTREGADO, OrderStatus.CANCELADO] },
          },
        },
      });

      if (ordersToCancel.length === 0) {
          throw new NotFoundException(`No se encontraron pedidos válidos para cancelar con las bolsas: ${bagIds.join(', ')}. Pueden estar ya en estado final o no existir.`);
      }

      const orderIdsToUpdate = ordersToCancel.map((o) => o.id);

      if (ordersToCancel.length !== bagIds.length) {
        const foundBagIds = ordersToCancel.map((o) => o.bagId);
        const notFoundBagIds = bagIds.filter((id) => !foundBagIds.includes(id));
        throw new NotFoundException(
          `No se pudieron encontrar o cancelar todos los pedidos. Bolsas no válidas o ya en estado final: ${notFoundBagIds.join(', ')}.`,
        );
      }
      // Delete associated images before updating the database
      for (const order of ordersToCancel) {
        if (order.imagenUrl) {
          // No need to await here, let them run in parallel
          this.deleteImageFile(order.imagenUrl);
        }
      }

      await tx.order.updateMany({
        where: { id: { in: orderIdsToUpdate } },
        data: { estado: OrderStatus.CANCELADO, fechaCancelacion: new Date(), imagenUrl: null },
      });
      await tx.bag.updateMany({
        where: { id: { in: bagIds } },
        data: { status: BagStatus.DISPONIBLE },
      });
      return tx.order.findMany({
        where: { id: { in: orderIdsToUpdate } },
        include: { cliente: true, trabajador: true, bag: true },
      });
    });
    return canceledOrders;
  }

  async deleteMultipleOrders(orderIds: string[]): Promise<void> {
    this.logger.log(`Attempting to delete ${orderIds.length} orders.`);

    if (orderIds.length === 0) {
      this.logger.log('No order IDs provided for deletion.');
      return;
    }

    const ordersToDelete = await this.prisma.order.findMany({
      where: {
        id: { in: orderIds },
        estado: { in: [OrderStatus.ENTREGADO, OrderStatus.CANCELADO] },
      },
      select: {
        id: true,
        imagenUrl: true,
      },
    });

    if (ordersToDelete.length !== orderIds.length) {
      const foundIds = ordersToDelete.map(o => o.id);
      const notFoundIds = orderIds.filter(id => !foundIds.includes(id));
      this.logger.warn(`Some orders were not found or not in a deletable state (ENTREGADO, CANCELADO): ${notFoundIds.join(', ')}`);
      
      if (ordersToDelete.length === 0) {
        throw new NotFoundException('No valid orders found to delete.');
      }
    }
    
    const idsToDelete = ordersToDelete.map(order => order.id);

    await this.prisma.$transaction(async (tx) => {
      // Delete orders
      const deleteResult = await tx.order.deleteMany({
        where: {
          id: { in: idsToDelete },
        },
      });

      this.logger.log(`${deleteResult.count} orders deleted from database.`);

      // Delete associated images
      for (const order of ordersToDelete) {
        if (order.imagenUrl) {
          await this.deleteImageFile(order.imagenUrl);
        }
      }
    });

    this.logger.log('Deletion process completed.');
  }

  async resetSystem(): Promise<void> {
    this.logger.warn('⚠️ Initiating full system reset...');
    await this.prisma.$transaction(async (tx) => {
      await tx.order.deleteMany({});
      this.logger.log('All orders deleted.');
      await tx.bag.updateMany({
        where: {},
        data: { status: BagStatus.DISPONIBLE },
      });
      this.logger.log('All bags reset to DISPONIBLE.');
    });
    this.logger.warn('✅ System reset completed successfully.');
  }

  private async saveImageFile(file: Express.Multer.File): Promise<string> {
    // Sanitize the filename by replacing spaces with hyphens
    const sanitizedOriginalName = file.originalname.replace(/\s+/g, '-');
    const filename = `${Date.now()}-${sanitizedOriginalName}`;
    const filePath = path.join(this.UPLOAD_DIR, filename);

    try {
      await fsPromises.writeFile(filePath, file.buffer);
      return `/uploads/${filename}`;
    } catch (err) {
      this.logger.error(`Error saving image file: ${err.message}`, err.stack);
      throw new BadRequestException('Error al guardar el archivo de imagen.');
    }
  }

  private async deleteImageFile(imageUrl: string): Promise<void> {
    if (!imageUrl) return;
    const filename = path.basename(imageUrl);
    const filePath = path.join(this.UPLOAD_DIR, filename);

    try {
      // Check if file exists before trying to delete
      await fsPromises.access(filePath);
      await fsPromises.unlink(filePath);
      this.logger.log(`Image file deleted: ${filePath}`);
    } catch (error) {
      // If error is ENOENT, file didn't exist, which is fine. Log other errors.
      if (error.code !== 'ENOENT') {
        this.logger.error(`Error deleting image file: ${error.message}`, error.stack);
      }
    }
  }
}
