import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  solicitud(): string {
    return 'Confirmación de solicitud';
  }

  solicitud2(): number {
    return 2823654;
  }

  solicitud3(): string {
    return 'confimación enlace: http Get';
  }
}
