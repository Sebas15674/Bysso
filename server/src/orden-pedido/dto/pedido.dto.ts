import { 
    IsString,
    IsNumber,
    IsDate,
    IsOptional,
    MinLength,
    MaxLength,
    Min,
    IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PedidoDto {
    @IsString()
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'El nombre no debe superar 100 caracteres' })
    nombreCompleto: string;
    
    @IsString()
    @IsPhoneNumber('CO', { message: 'El número de teléfono debe ser válido' })
    numeroTelefono: string;
    
    @IsString()
    @MinLength(6, { message: 'La cédula debe tener mínimo 6 caracteres' })
    @MaxLength(20, { message: 'La cédula no debe superar 20 caracteres' })
    cedula: string;
    
    @IsNumber()
    @Min(1, { message: 'Debe haber mínimo 1 prenda' })
    numeroPrendas: number;
    
    @IsString()
    @MaxLength(50, { message: 'El diseño no debe superar 50 caracteres' })
    elegirDiseno: string;
    
    @IsNumber()
    @Min(1)
    numeroBolsa: number;
    
    @IsString()
    @IsOptional()
    @MaxLength(300, { message: 'La descripción no puede superar 300 caracteres' })
    descripcion?: string;
    
    @IsNumber()
    @Min(0)
    abono: number;
    
    @IsNumber()
    @Min(1)
    totalPagar: number;
    
    @Type(() => Date)
    @IsDate({ message: 'La posible fecha de entrega debe ser una fecha válida' })
    @IsOptional()
    posibleFechaEntrega?: Date;
}
