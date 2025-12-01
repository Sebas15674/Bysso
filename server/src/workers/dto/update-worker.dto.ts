import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateWorkerDto {
  @ApiPropertyOptional({
    description: 'Nuevo nombre completo del trabajador.',
    example: 'Juan Pablo Pérez',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(255)
  nombre?: string;

  @ApiPropertyOptional({
    description:
      'Define si el trabajador está activo y puede ser asignado a nuevos pedidos.',
    example: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El estado activo debe ser un valor booleano (true/false).',
  })
  activo?: boolean;
}
