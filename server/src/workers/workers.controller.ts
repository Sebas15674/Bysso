import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Trabajadores')
@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo trabajador' })
  @ApiResponse({ status: 201, description: 'Trabajador creado exitosamente.' })
  @ApiResponse({ status: 409, description: 'El nombre del trabajador ya existe.' })
  create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workersService.create(createWorkerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener una lista de trabajadores' })
  @ApiQuery({
    name: 'activo',
    required: false,
    type: Boolean,
    description: 'Filtrar trabajadores por su estado de actividad.',
  })
  @ApiResponse({ status: 200, description: 'Lista de trabajadores obtenida.' })
  findAll(
    @Query('activo', new DefaultValuePipe(undefined), ParseBoolPipe) activo?: boolean,
  ) {
    return this.workersService.findAll(activo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un trabajador por su ID' })
  @ApiResponse({ status: 200, description: 'Trabajador encontrado.' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un trabajador por su ID' })
  @ApiResponse({ status: 200, description: 'Trabajador actualizado.' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado.' })
  @ApiResponse({ status: 409, description: 'El nuevo nombre ya está en uso.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWorkerDto: UpdateWorkerDto,
  ) {
    return this.workersService.update(id, updateWorkerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un trabajador por su ID' })
  @ApiResponse({ status: 204, description: 'Trabajador eliminado.' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'El trabajador no se puede eliminar porque tiene pedidos asignados.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workersService.remove(id);
  }
}
