// server/src/clientes/clients.module.ts
import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Asegúrate de que PrismaModule esté accesible

@Module({
  imports: [PrismaModule], // Importamos PrismaModule para que ClientsService pueda usar PrismaService
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService], // Exportamos ClientsService para que otros módulos puedan inyectarlo
})
export class ClientsModule {}
