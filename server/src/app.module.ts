import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { OrdersModule } from './orders/orders.module';
import { BagsModule } from './bags/bags.module';
import { WorkersModule } from './workers/workers.module';
import { ClientsModule } from './clientes/clients.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    OrdersModule,
    BagsModule,
    WorkersModule,
    ClientsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'imagenes'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
