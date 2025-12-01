import {
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  IsPhoneNumber,
  IsEnum,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType, OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library'; // Import Decimal type

// This DTO defines the base fields common to creating and updating an order
// It also serves as a good representation of the data structure
export class OrderBaseDto {
  @IsString()
  @MinLength(3, {
    message: 'El nombre del cliente debe tener al menos 3 caracteres',
  })
  @MaxLength(100, {
    message: 'El nombre del cliente no debe superar 100 caracteres',
  })
  cliente: string;

  @IsString()
  @MinLength(6, { message: 'La cédula debe tener mínimo 6 caracteres' })
  @MaxLength(20, { message: 'La cédula no debe superar 20 caracteres' })
  cedula: string;

  @IsString()
  @IsPhoneNumber('CO', {
    message: 'El número de teléfono debe ser válido para Colombia',
  })
  @MaxLength(20, {
    message: 'El número de teléfono no debe superar 20 caracteres',
  })
  celular: string;

  @IsEnum(OrderType, { message: 'El tipo de pedido no es válido' })
  tipo: OrderType;

  @IsString()
  @MaxLength(300, { message: 'La descripción no puede superar 300 caracteres' })
  descripcion: string;

  @Type(() => Number) // Ensure it's treated as a number for validation
  @IsNumber({}, { message: 'El abono debe ser un valor numérico' })
  @Min(0, { message: 'El abono no puede ser negativo' })
  abono: number;

  @Type(() => Number) // Ensure it's treated as a number for validation
  @IsNumber({}, { message: 'El número de prendas debe ser un valor numérico' })
  @Min(0, { message: 'El número de prendas no puede ser negativo' })
  prendas: number;

  @IsDateString(
    {},
    {
      message:
        'La fecha de entrega debe ser una fecha válida en formato YYYY-MM-DD',
    },
  )
  fechaEntrega: string; // Expected YYYY-MM-DD from frontend date input

  @Type(() => Number) // Ensure it's treated as a number for validation
  @IsNumber({}, { message: 'El total a pagar debe ser un valor numérico' })
  @Min(0, { message: 'El total a pagar no puede ser negativo' })
  total: number;

  @IsString()
  @MaxLength(255, {
    message: 'El nombre del trabajador no debe superar 255 caracteres',
  })
  trabajadorAsignado: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'La URL de la imagen no debe superar 500 caracteres',
  })
  imagenUrl?: string; // This will be set by the file upload process, not directly from frontend form data

  // bagId is handled specifically in CreateOrderDto as it's assigned once
  // estado is handled specifically by system
}
