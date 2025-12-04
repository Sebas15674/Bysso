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
} from '@nestjs/common'; // Se eliminan ParseBoolPipe y DefaultValuePipe
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { QueryWorkerDto } from './dto/query-worker.dto'; // Importar el nuevo DTO
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'; // Se elimina ApiQuery

@ApiTags('Trabajadores')
@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo trabajador' })
  @ApiResponse({ status: 201, description: 'Trabajador creado exitosamente.' })
  @ApiResponse({
    status: 409,
    description: 'El nombre del trabajador ya existe.',
  })
  create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workersService.create(createWorkerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener una lista de trabajadores' })
  @ApiResponse({ status: 200, description: 'Lista de trabajadores obtenida.' })
  findAll(@Query() query: QueryWorkerDto) { // Usar QueryWorkerDto
    return this.workersService.findAll(query.activo, query.search);
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
    description:
      'El trabajador no se puede eliminar porque tiene pedidos asignados.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workersService.remove(id);
  }
}
