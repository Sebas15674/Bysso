import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWorkerDto {
  @ApiProperty({
    description: 'Nombre completo del trabajador. Debe ser único.',
    example: 'Juan Pérez',
    maxLength: 255,
  })
  
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(255)
  nombre: string;
}
