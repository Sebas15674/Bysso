// src/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email debe ser una dirección de correo válida' })
  @IsNotEmpty({ message: 'El email no puede estar vacío' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsEnum(Role, { message: 'El rol proporcionado no es válido' })
  @IsNotEmpty({ message: 'El rol no puede estar vacío' })
  role: Role;
}
