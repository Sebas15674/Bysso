import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { Pedido } from '@prisma/client';

@Injectable()
export class OrdenPedidoService {
  constructor(private prisma: PrismaService) {}

  async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    const { ...dto } = createPedidoDto;

    return this.prisma.pedido.create({
      data: {
        nombreCompleto: dto.nombreCompleto,
        numeroTelefono: dto.numeroTelefono,
        cedula: dto.cedula,
        numeroPrendas: dto.numeroPrendas,
        elegirDiseno: dto.elegirDiseno,
        numeroBolsa: dto.numeroBolsa,
        descripcion: dto.descripcion,
        abono: dto.abono,
        totalPagar: dto.totalPagar,
        posibleFechaEntrega: dto.posibleFechaEntrega,
        creadoPor: dto.creadoPor,
        estado: dto.estado,
      },
    });
  }

  async findAll(): Promise<Pedido[]> {
    return this.prisma.pedido.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Pedido> {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con ID "${id}" no encontrado.`);
    }
    return pedido;
  }

  async update(id: string, updatePedidoDto: UpdatePedidoDto): Promise<Pedido> {
    // Primero, verifica si el pedido existe
    await this.findOne(id);
    
    return this.prisma.pedido.update({
      where: { id },
      data: updatePedidoDto, // PartialType DTO is safe to pass directly
    });
  }

  async remove(id: string): Promise<Pedido> {
    // Primero, verifica si el pedido existe
    await this.findOne(id);

    return this.prisma.pedido.delete({
      where: { id },
    });
  }
}