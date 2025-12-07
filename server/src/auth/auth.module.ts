import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';

dotenv.config(); // Cargar variables de entorno

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'superSecretKey', // Usar variable de entorno, fallback para desarrollo
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 28800 }, // Aumentado a 8 horas (28800 segundos)
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy], // Añadir las estrategias aquí
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
