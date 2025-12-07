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
  UseGuards, // Importar UseGuards
} from '@nestjs/common';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { QueryWorkerDto } from './dto/query-worker.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Importar JwtAuthGuard
import { RolesGuard } from '../auth/guards/roles.guard';     // Importar RolesGuard
import { Roles } from '../auth/decorators/roles.decorator';   // Importar @Roles
import { Role } from '@prisma/client';                     // Importar el enum Role de Prisma

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
  // Por ahora, permitimos que cualquiera cree un trabajador, se puede proteger con roles si es necesario
  create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workersService.create(createWorkerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener una lista de trabajadores' })
  @ApiResponse({ status: 200, description: 'Lista de trabajadores obtenida.' })
  // Permitimos que cualquiera vea la lista de trabajadores, se puede proteger con roles si es necesario
  findAll(@Query() query: QueryWorkerDto) {
    return this.workersService.findAll(query.activo, query.search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un trabajador por su ID' })
  @ApiResponse({ status: 200, description: 'Trabajador encontrado.' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado.' })
  // Permitimos que cualquiera vea un trabajador por ID, se puede proteger con roles si es necesario
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // Aplicar JwtAuthGuard y RolesGuard
  @Roles(Role.SUPER_ADMIN)             // Solo SUPER_ADMIN puede actualizar trabajadores
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un trabajador por su ID (Solo SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Trabajador actualizado.' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado.' })
  @ApiResponse({ status: 409, description: 'El nuevo nombre ya está en uso.' })
  @ApiResponse({ status: 403, description: 'No autorizado para esta acción.' }) // Añadir respuesta de no autorizado
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWorkerDto: UpdateWorkerDto,
  ) {
    return this.workersService.update(id, updateWorkerDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // Aplicar JwtAuthGuard y RolesGuard
  @Roles(Role.SUPER_ADMIN)             // Solo SUPER_ADMIN puede eliminar trabajadores
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un trabajador por su ID (Solo SUPER_ADMIN)' })
  @ApiResponse({ status: 204, description: 'Trabajador eliminado.' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado.' })
  @ApiResponse({
    status: 409,
    description:
      'El trabajador no se puede eliminar porque tiene pedidos asignados.',
  })
  @ApiResponse({ status: 403, description: 'No autorizado para esta acción.' }) // Añadir respuesta de no autorizado
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workersService.remove(id);
  }
}
