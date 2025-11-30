// server/src/clientes/dto/update-client.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

// PartialType toma todas las propiedades de CreateClientDto y las hace opcionales
export class UpdateClientDto extends PartialType(CreateClientDto) {
  // Opcional: Si quieres sobreescribir validaciones o añadir nuevas
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'El celular debe contener solo números.' })
  @MaxLength(20)
  celular?: string; // Mantener la validación específica si es necesario
}
