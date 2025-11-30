import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BagsService } from './bags.service';
import { CreateBagDto } from './dto/create-bag.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BagStatus } from '@prisma/client';

@ApiTags('Bolsas')
@Controller('bags')
export class BagsController {
  constructor(private readonly bagsService: BagsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva bolsa' })
  @ApiResponse({ status: 201, description: 'Bolsa creada exitosamente.' })
  @ApiResponse({ status: 409, description: 'La bolsa con ese ID ya existe.' })
  create(@Body() createBagDto: CreateBagDto) {
    return this.bagsService.create(createBagDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener una lista de bolsas',
    description:
      'Devuelve todas las bolsas. Usar el query parameter ?status=DISPONIBLE para obtener solo las bolsas libres para un nuevo pedido.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BagStatus,
    description: 'Filtrar bolsas por estado (DISPONIBLE u OCUPADA).',
  })
  @ApiResponse({ status: 200, description: 'Lista de bolsas obtenida.' })
  findAll(@Query('status') status?: BagStatus) {
    return this.bagsService.findAll(status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una bolsa por su ID' })
  @ApiResponse({ status: 204, description: 'Bolsa eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Bolsa no encontrada.' })
  @ApiResponse({
    status: 409,
    description: 'La bolsa no se puede eliminar porque está en uso.',
  })
  remove(@Param('id') id: string) {
    return this.bagsService.remove(id);
  }
}
