// server/src/clientes/clients.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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
   * Busca clientes para el autocompletado por nombre, cédula o celular.
   * @param query Objeto de consulta con el término de búsqueda.
   * @returns Lista de clientes que coinciden.
   */
  async search(query: QueryClientDto): Promise<Client[]> {
    const { search } = query;
    if (!search) {
      // Si no hay término de búsqueda, podríamos devolver un límite o nada.
      // Para autocompletado, lo ideal es devolver un array vacío o un límite pequeño.
      return []; // Devolver vacío si no hay búsqueda
      // O, para un comportamiento más "fuzzy":
      // return this.prisma.client.findMany({ take: 10 }); // Devolver los primeros 10 si no hay búsqueda
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
    await this.findOne(id); // Verifica si el cliente existe

    // Considerar verificar si el cliente tiene pedidos asociados antes de eliminarlo
    // Si tiene pedidos, se podría optar por un "soft delete" o lanzar una excepción
    // Por ahora, implementamos una eliminación directa.
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
