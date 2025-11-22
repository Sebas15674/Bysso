import { IsIn, IsOptional, IsString } from 'class-validator';
import { PedidoDto } from './pedido.dto';
import { EstadoPedido } from '@prisma/client';

export class CreatePedidoDto extends PedidoDto {
  @IsString()
  creadoPor: string;

  @IsOptional()
  @IsIn(Object.values(EstadoPedido))
  estado?: EstadoPedido;
}