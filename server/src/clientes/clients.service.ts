// server/src/clientes/clients.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { UpdateClientDto } from './dto/update-client.dto'; // Novedad: Importamos UpdateClientDto
import { Client, Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Busca un cliente por cédula. Si no existe, lo crea.
   * Esto es clave para la creación implícita del cliente desde el pedido.
   * @param createClientDto Datos del cliente a buscar o crear.
   * @returns El cliente encontrado o recién creado.
   */
  async findOrCreate(createClientDto: CreateClientDto): Promise<Client> {
    const { cedula, nombre, celular } = createClientDto;

    // Usamos upsert para encontrar o crear el cliente de forma atómica.
    // Si el cliente existe (por cédula), actualiza sus datos (nombre, celular).
    // Si no existe, lo crea.
    return this.prisma.client.upsert({
      where: { cedula: cedula },
      update: { nombre: nombre, celular: celular }, // Actualiza si ya existe
      create: { nombre: nombre, cedula: cedula, celular: celular },
    });
  }

  /**
   * Obtiene una lista de clientes, con posibilidad de filtrar por un término de búsqueda.
   * Si no se proporciona un término de búsqueda, devuelve todos los clientes.
   * @param query Objeto de consulta que puede contener un término de búsqueda.
   * @returns Lista de clientes que coinciden con la búsqueda o todos los clientes.
   */
  async findAll(query?: QueryClientDto): Promise<Client[]> {
    const where: Prisma.ClientWhereInput = {};
    if (query?.search) {
      const searchLower = query.search.toLowerCase();
      where.OR = [
        { nombre: { contains: searchLower, mode: 'insensitive' } },
        { cedula: { contains: searchLower, mode: 'insensitive' } },
        { celular: { contains: searchLower, mode: 'insensitive' } },
      ];
    }
    // Aquí se pueden añadir filtros adicionales o lógica de paginación si QueryClientDto la soporta.
    return this.prisma.client.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Busca clientes para el autocompletado por nombre, cédula o celular.
   * Si no hay término de búsqueda, devuelve un array vacío.
   * @param query Objeto de consulta con el término de búsqueda.
   * @returns Lista de clientes que coinciden (limitada a 10 resultados).
   */
  async autocompleteSearch(query: QueryClientDto): Promise<Client[]> {
    const { search } = query;
    if (!search) {
      return []; // Devolver vacío si no hay búsqueda para autocompletado
    }
    const searchLower = search.toLowerCase();
    return this.prisma.client.findMany({
      where: {
        OR: [
          { nombre: { contains: searchLower, mode: 'insensitive' } },
          { cedula: { contains: searchLower, mode: 'insensitive' } },
          { celular: { contains: searchLower, mode: 'insensitive' } },
        ],
      },
      take: 10, // Limitar los resultados para el autocompletado
      orderBy: { nombre: 'asc' },
    });
  }

  async findOneByCedula(cedula: string): Promise<Client | null> {
    return this.prisma.client.findUnique({
      where: { cedula },
    });
  }

  /**
   * Obtiene un cliente por su ID.
   * @param id ID del cliente.
   * @returns El cliente.
   */
  async findOne(id: string): Promise<Client> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID "${id}" no encontrado.`);
    }
    return client;
  }

  // Novedad: Método para actualizar un cliente
  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    await this.findOne(id); // Verifica si el cliente existe

    return this.prisma.client.update({
      where: { id },
      data: {
        nombre: updateClientDto.nombre,
        cedula: updateClientDto.cedula,
        celular: updateClientDto.celular,
      },
    });
  }

  // Novedad: Método para eliminar un cliente
  async remove(id: string): Promise<Client> {
    const client = await this.findOne(id); // Asegura que el cliente exista

    const assignedOrdersCount = await this.prisma.order.count({
      where: { clienteId: id },
    });

    if (assignedOrdersCount > 0) {
      throw new ConflictException(
        `El cliente "${client.nombre}" no puede ser eliminado porque tiene ${assignedOrdersCount} pedido(s) asignado(s).`,
      );
    }

    return this.prisma.client.delete({
      where: { id },
    });
  }
}
