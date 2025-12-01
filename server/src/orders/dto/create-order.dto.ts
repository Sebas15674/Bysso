import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsIn,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  IsPhoneNumber,
  IsEnum,
  IsDateString,
  Matches,
  IsUrl, // Novedad: para validar URL si viene
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, OrderType } from '@prisma/client';

export class CreateOrderDto {
  // --- CAMPOS DEL CLIENTE (para buscar o crear) ---
  @IsString({ message: 'El nombre del cliente debe ser una cadena de texto' })
  @MinLength(3, {
    message: 'El nombre del cliente debe tener al menos 3 caracteres',
  })
  @MaxLength(100, {
    message: 'El nombre del cliente no debe superar 100 caracteres',
  })
  clienteNombre: string;

  @IsString({ message: 'La cédula del cliente debe ser una cadena de texto' })
  @MinLength(6, { message: 'La cédula debe tener mínimo 6 caracteres' })
  @MaxLength(20, { message: 'La cédula no debe superar 20 caracteres' })
  @Matches(/^[0-9]+$/, { message: 'La cédula debe contener solo números.' })
  clienteCedula: string;

  @IsString({ message: 'El celular del cliente debe ser una cadena de texto' })
  @IsPhoneNumber('CO', {
    message: 'El número de celular debe ser válido para Colombia',
  })
  @MaxLength(20, {
    message: 'El número de celular no debe superar 20 caracteres',
  })
  @Matches(/^[0-9]+$/, { message: 'El celular debe contener solo números.' })
  clienteCelular: string;

  // --- CAMPOS DE LA ORDEN ---
  @IsEnum(OrderType, { message: 'El tipo de pedido no es válido' })
  tipo: OrderType;

  @IsString({
    message: 'La descripción del pedido debe ser una cadena de texto',
  })
  @MaxLength(300, { message: 'La descripción no puede superar 300 caracteres' })
  descripcion: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'El abono debe ser un valor numérico' })
  @Min(0, { message: 'El abono no puede ser negativo' })
  abono: number;

  @Type(() => Number)
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
  fechaEntrega: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'El total a pagar debe ser un valor numérico' })
  @Min(0, { message: 'El total a pagar no puede ser negativo' })
  total: number;

  @IsString({ message: 'El ID de la bolsa debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID de la bolsa no puede estar vacío' })
  bagId: string;

  // --- ID DEL TRABAJADOR ASIGNADO ---
  @IsString({ message: 'El ID del trabajador debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del trabajador no puede estar vacío' })
  @IsUUID('4', { message: 'El ID del trabajador debe ser un UUID válido' }) // Asumiendo UUID
  trabajadorId: string;

  // --- ESTADO (Gestionado por el backend, opcional si lo envía el frontend) ---
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'El estado del pedido no es válido' })
  estado?: OrderStatus = OrderStatus.PENDIENTE;

  // --- Novedad: URL de la imagen (puede ser null para eliminar) ---
  @IsOptional()
  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto' })
  @MaxLength(500, {
    message: 'La URL de la imagen no debe superar 500 caracteres',
  })
  // @IsUrl({}, { message: 'La URL de la imagen no es válida' }) // Opcional, si siempre es una URL
  imagenUrl?: string | null;
}
