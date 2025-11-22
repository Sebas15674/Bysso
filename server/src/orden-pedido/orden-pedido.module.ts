import { Module } from '@nestjs/common';
import { OrdenPedidoService } from './orden-pedido.service';
import { OrdenPedidoController } from './orden-pedido.controller';

@Module({
  controllers: [OrdenPedidoController],
  providers: [OrdenPedidoService],
  // No se necesita importar PrismaModule aquí porque es global
})
export class OrdenPedidoModule {}
