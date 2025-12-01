// server/src/clientes/dto/create-client.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'La cédula debe contener solo números.' })
  @MaxLength(20) // Ajusta el MaxLength según tu necesidad
  cedula: string;

  @IsString()
  @IsNotEmpty() // Celular es requerido
  @Matches(/^[0-9]+$/, { message: 'El celular debe contener solo números.' })
  @MaxLength(20)
  celular: string;
}
