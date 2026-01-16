import { memoryStorage } from 'multer';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  Delete,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { CancelOrdersDto } from './dto/cancel-orders.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

@ApiTags('Pedidos')
@Controller('pedidos')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo pedido' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 404, description: 'Bolsa no encontrada.' })
  @ApiResponse({ status: 409, description: 'La bolsa ya está ocupada.' })
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(), // Forzar el almacenamiento en memoria
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          return callback(
            new BadRequestException('Solo se permiten archivos de imagen.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async create(@Body() body: any, @UploadedFile() image?: Express.Multer.File) {
    // Frontend sends order data as a JSON string in the 'pedido' field
    if (!body.pedido) {
      throw new BadRequestException(
        'El campo "pedido" es requerido en el formulario multipart.',
      );
    }

    let createOrderDto: CreateOrderDto;
    try {
      createOrderDto = JSON.parse(body.pedido);
    } catch (e) {
      throw new BadRequestException(
        'El campo "pedido" debe ser un string JSON válido.',
      );
    }

    // Validate the parsed DTO
    const errors = await validate(plainToClass(CreateOrderDto, createOrderDto));
    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) =>
          error.constraints ? Object.values(error.constraints) : [],
        )
        .flat();
      throw new BadRequestException(errorMessages);
    }

    return this.ordersService.create(createOrderDto, image);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener una lista de pedidos con paginación y filtros',
  })
  @ApiResponse({ status: 200, description: 'Lista de pedidos obtenida.' })
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pedido por su ID' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado.' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch('cancelar')
  @ApiOperation({
    summary: 'Cancela múltiples pedidos basado en una lista de IDs de bolsas',
  })
  @ApiResponse({ status: 200, description: 'Pedidos cancelados exitosamente.' })
  @ApiResponse({
    status: 404,
    description:
      'Alguno de los pedidos no se encontró o no era válido para cancelación.',
  })
  CancelMultipleOrders(@Body() cancelOrdersDto: CancelOrdersDto) {
    return this.ordersService.cancelMultipleOrders(cancelOrdersDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar datos de un pedido en estado PENDIENTE',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Pedido actualizado exitosamente.' })
  @ApiResponse({
    status: 403,
    description:
      'El pedido no se puede actualizar porque no está en estado PENDIENTE.',
  })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado.' })
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(), // Forza el almacenamiento en memoria
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          return callback(
            new BadRequestException('Solo se permiten archivos de imagen.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    // Frontend sends order data as a JSON string in the 'pedido' field for updates as well
    if (!body.pedido) {
      throw new BadRequestException(
        'El campo "pedido" es requerido en el formulario multipart para la actualización.',
      );
    }

    let updateOrderDto: UpdateOrderDto;
    try {
      updateOrderDto = JSON.parse(body.pedido);
    } catch (e) {
      throw new BadRequestException(
        'El campo "pedido" debe ser un string JSON válido para la actualización.',
      );
    }

    // Validate the parsed DTO
    const errors = await validate(plainToClass(UpdateOrderDto, updateOrderDto));
    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) =>
          error.constraints ? Object.values(error.constraints) : [],
        )
        .flat();
      throw new BadRequestException(errorMessages);
    }

    return this.ordersService.update(id, updateOrderDto, image);
  }

  @Patch(':id/estado/en-produccion')
  @ApiOperation({
    summary: 'Cambia el estado de un pedido de PENDIENTE a EN_PRODUCCION',
  })
  @ApiResponse({ status: 200, description: 'Estado cambiado a EN_PRODUCCION.' })
  @ApiResponse({ status: 403, description: 'Transición de estado no válida.' })
  updateStatusEnProduccion(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.updateStatusEnProduccion(id);
  }

  @Patch(':id/estado/en-proceso')
  @ApiOperation({
    summary: 'Cambia el estado de un pedido de EN_PRODUCCION a EN_PROCESO',
  })
  @ApiResponse({ status: 200, description: 'Estado cambiado a EN_PROCESO.' })
  @ApiResponse({ status: 403, description: 'Transición de estado no válida.' })
  updateStatusEnProceso(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.updateStatusEnProceso(id);
  }

  @Patch(':id/estado/listo-entrega')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({
    summary: 'Cambia el estado de un pedido de EN_PROCESO a LISTO_PARA_ENTREGA',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado cambiado a LISTO_PARA_ENTREGA.',
  })
  @ApiResponse({ status: 403, description: 'Transición de estado no válida.' })
  updateStatusListoParaEntrega(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.updateStatusListoParaEntrega(id);
  }

  @Patch(':id/estado/entregado')
  @ApiOperation({
    summary: 'Cambia el estado de un pedido de LISTO_PARA_ENTREGA a ENTREGADO',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado cambiado a ENTREGADO y bolsa liberada.',
  })
  @ApiResponse({ status: 403, description: 'Transición de estado no válida.' })
  updateStatusEntregado(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.updateStatusEntregado(id);
  }

  @Patch(':id/estado/cancelado')
  @ApiOperation({ summary: 'Cancela un pedido individual' })
  @ApiResponse({
    status: 200,
    description: 'Pedido cancelado y bolsa liberada.',
  })
  @ApiResponse({ status: 403, description: 'Transición de estado no válida.' })
  cancelOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.cancelOrder(id);
  }

  @Patch('cancelar')
  @ApiOperation({
    summary: 'Cancela múltiples pedidos basado en una lista de IDs de bolsas',
  })
  @ApiResponse({ status: 200, description: 'Pedidos cancelados exitosamente.' })
  @ApiResponse({
    status: 404,
    description:
      'Alguno de los pedidos no se encontró o no era válido para cancelación.',
  })
  cancelMultipleOrders(@Body() cancelOrdersDto: CancelOrdersDto) {
    return this.ordersService.cancelMultipleOrders(cancelOrdersDto);
  }

  @Delete('delete-multiple')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Elimina múltiples pedidos basado en una lista de IDs de pedidos. Solo para pedidos en estado ENTREGADO o CANCELADO.',
  })
  @ApiResponse({ status: 204, description: 'Pedidos eliminados exitosamente.' })
  @ApiResponse({ status: 404, description: 'No se encontraron pedidos válidos para eliminar.' })
  deleteMultiple(@Body() body: { orderIds: string[] }) {
    if (!body.orderIds || !Array.isArray(body.orderIds)) {
      throw new BadRequestException('El cuerpo de la solicitud debe contener un arreglo de "orderIds".');
    }
    return this.ordersService.deleteMultipleOrders(body.orderIds);
  }

  @Delete('reset')
  @ApiOperation({
    summary:
      'Resetea el sistema, borrando todos los pedidos y liberando todas las bolsas. ¡USAR CON PRECAUCIÓN!',
  })
  @ApiResponse({ status: 204, description: 'Sistema reseteado exitosamente.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetSystem() {
    await this.ordersService.resetSystem();
  }
}
