import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class OrderQueryDto {
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto.' })
  search?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(OrderStatus, { each: true, message: 'Cada estado en la lista de estados debe ser un valor válido.' })
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un estado si utiliza el filtro de estados.' })
  @ArrayMaxSize(Object.values(OrderStatus).length, { message: 'No se pueden especificar más estados que los disponibles.' })
  @Type(() => String) // Ensure that array elements are transformed to string if they come as single string "PENDIENTE,EN_PRODUCCION"
  estado?: OrderStatus[]; // Can be a single status or comma-separated for multiple

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La página debe ser un número.' })
  @Min(1, { message: 'La página debe ser al menos 1.' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El límite debe ser un número.' })
  @Min(1, { message: 'El límite debe ser al menos 1.' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'El campo para ordenar debe ser una cadena de texto.' })
  orderBy?: string = 'createdAt'; // Default sorting field

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'La dirección de ordenamiento debe ser "asc" o "desc".' })
  orderDirection?: 'asc' | 'desc' = 'desc'; // Default sorting direction
}
