import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule } from '../clientes/clients.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    ClientsModule,
    MulterModule.register({
      storage: diskStorage({
        destination: resolve(__dirname, '..', '..', '..', 'imagenes'),
        filename: (req, file, cb) => {
          const extension = file.originalname.split('.').pop();
          cb(null, `${uuidv4()}.${extension}`);
        },
      }),
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
