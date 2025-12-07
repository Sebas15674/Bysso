import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Función de utilidad para excluir campos de un objeto (como la contraseña)
  private exclude<User extends Record<string, any>, Key extends keyof User>(
    user: User,
    keys: Key[],
  ): Omit<User, Key> {
    return Object.fromEntries(
      Object.entries(user).filter(([key]) => !keys.includes(key as Key)),
    ) as Omit<User, Key>;
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, role } = createUserDto;

    // 1. Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException(`El email '${email}' ya está en uso.`);
    }

    // 2. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    // 4. Devolver el usuario sin la contraseña
    return this.exclude(user, ['password']);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    // Excluir la contraseña de todos los usuarios
    return users.map((user) => this.exclude(user, ['password']));
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
      return this.exclude(user, ['password']);
    } catch (error) {
      // Prisma lanza un error si no lo encuentra, lo capturamos y lanzamos NotFoundException
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Si se proporciona una nueva contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    // Si se intenta cambiar el email, verificar que no esté ya en uso por otro usuario
    if (updateUserDto.email) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: updateUserDto.email } });
        if (existingUser && existingUser.id !== id) {
            throw new ConflictException(`El email '${updateUserDto.email}' ya está en uso.`);
        }
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      return this.exclude(updatedUser, ['password']);
    } catch (error) {
      // Manejar el caso en que el usuario a actualizar no exista
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
    }
  }

  async remove(id: string) {
    try {
      // findUniqueOrThrow verifica la existencia antes de intentar borrar
      await this.prisma.user.findUniqueOrThrow({ where: { id } });
      await this.prisma.user.delete({ where: { id } });
      return; // No se devuelve contenido en un 204
    } catch (error) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
    }
  }
}
