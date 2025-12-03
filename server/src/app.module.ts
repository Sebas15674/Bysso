import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { BagsModule } from './bags/bags.module';
import { ClientsModule } from './clientes/clients.module';
import { WorkersModule } from './workers/workers.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      // Usar process.cwd() para una ruta más robusta
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    OrdersModule,
    BagsModule,
    ClientsModule,
    WorkersModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
