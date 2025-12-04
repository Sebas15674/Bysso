import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Injectable()
export class WorkersService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkerDto: CreateWorkerDto) {
    const existingWorker = await this.prisma.worker.findUnique({
      where: { nombre: createWorkerDto.nombre },
    });

    if (existingWorker) {
      throw new ConflictException(
        `Ya existe un trabajador con el nombre "${createWorkerDto.nombre}".`,
      );
    }

    return this.prisma.worker.create({
      data: {
        ...createWorkerDto,
        activo: true, // Por defecto, un nuevo trabajador siempre está activo.
      },
    });
  }

  findAll(activo?: boolean, search?: string) {
    const where: Prisma.WorkerWhereInput = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    if (search) {
      where.nombre = {
        contains: search,
        mode: 'insensitive', // Case-insensitive search
      };
    }

    return this.prisma.worker.findMany({
      where,
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { id },
    });

    if (!worker) {
      throw new NotFoundException(`Trabajador con ID "${id}" no encontrado.`);
    }

    return worker;
  }

  async update(id: string, updateWorkerDto: UpdateWorkerDto) {
    await this.findOne(id); // Asegura que el trabajador exista

    if (updateWorkerDto.nombre) {
      const existingWorker = await this.prisma.worker.findUnique({
        where: { nombre: updateWorkerDto.nombre },
      });
      if (existingWorker && existingWorker.id !== id) {
        throw new ConflictException(
          `Ya existe otro trabajador con el nombre "${updateWorkerDto.nombre}".`,
        );
      }
    }

    return this.prisma.worker.update({
      where: { id },
      data: updateWorkerDto,
    });
  }

  async remove(id: string) {
    const worker = await this.findOne(id); // Asegura que el trabajador exista

    const assignedOrdersCount = await this.prisma.order.count({
      where: { trabajadorId: id },
    });

    if (assignedOrdersCount > 0) {
      throw new ConflictException(
        `El trabajador "${worker.nombre}" no puede ser eliminado porque tiene ${assignedOrdersCount} pedido(s) asignado(s).`,
      );
    }

    return this.prisma.worker.delete({
      where: { id },
    });
  }
}
