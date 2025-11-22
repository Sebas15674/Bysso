import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdenPedidoModule } from './orden-pedido/orden-pedido.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule, // Importa el módulo de Prisma
    OrdenPedidoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
