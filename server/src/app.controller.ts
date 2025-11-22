import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

import { PedidoDto } from './orden-pedido/dto/pedido.dto';



@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  
  @Get()
  getInicio(): string {
    return this.appService.solicitud();
  }

  @Get('numero')
  getNumber(): number {
    return this.appService.solicitud2();
  }

  @Get('enlace')
  getLink(): string {
    return this.appService.solicitud3();
  }

}
