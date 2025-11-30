import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BagStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBagDto } from './dto/create-bag.dto';

@Injectable()
export class BagsService {
  constructor(private prisma: PrismaService) {}

  async create(createBagDto: CreateBagDto) {
    const existingBag = await this.prisma.bag.findUnique({
      where: { id: createBagDto.id },
    });

    if (existingBag) {
      throw new ConflictException(
        `La bolsa con ID "${createBagDto.id}" ya existe.`,
      );
    }

    return this.prisma.bag.create({
      data: {
        id: createBagDto.id,
        status: BagStatus.DISPONIBLE, // Todas las bolsas nuevas están disponibles por defecto
      },
    });
  }

  findAll(status?: BagStatus) {
    const where: Prisma.BagWhereInput = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.bag.findMany({
      where,
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const bag = await this.prisma.bag.findUnique({
      where: { id },
    });
    if (!bag) {
      throw new NotFoundException(`Bolsa con ID "${id}" no encontrada.`);
    }
    return bag;
  }

  async remove(id: string) {
    const bag = await this.findOne(id);

    if (bag.status === BagStatus.OCUPADA) {
      throw new ConflictException(
        `La bolsa "${id}" no puede ser eliminada porque está actualmente en uso.`,
      );
    }

    return this.prisma.bag.delete({
      where: { id },
    });
  }
}
