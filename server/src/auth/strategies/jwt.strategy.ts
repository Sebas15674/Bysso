import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Asegura que los tokens expiren
      secretOrKey: process.env.JWT_SECRET || 'superSecretKey', // Usar variable de entorno, fallback para desarrollo
    });
  }

  async validate(payload: any) {
    // El payload ya ha sido validado por la clave secreta y la expiración
    // Aquí podemos añadir lógica para buscar al usuario en la DB si fuera necesario,
    // pero para este caso, devolver el payload es suficiente.
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
