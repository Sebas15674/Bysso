import {
  Controller,
  Get,
  Query,
  Param,
  Patch,
  Body,
  Delete,
  ParseUUIDPipe, // Novedad: Para validar IDs
  HttpCode, // Novedad: Para códigos de estado específicos
  HttpStatus,
  NotFoundException // Novedad: Para códigos de estado específicos
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { QueryClientDto } from './dto/query-client.dto';
import { UpdateClientDto } from './dto/update-client.dto'; // Novedad: Importamos UpdateClientDto
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'; // Novedad: ApiBody para PATCH

@ApiTags('Clientes')
@Controller('clientes') // Endpoint base /clientes
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener una lista general de clientes',
    description: 'Permite obtener todos los clientes o filtrar por un término de búsqueda.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes obtenida, con o sin filtro de búsqueda.',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos.',
  })
  findAllClients(@Query() query: QueryClientDto) {
    return this.clientsService.findAll(query);
  }

  // Novedad: Endpoint para obtener un cliente por su número de cédula
  @Get('cedula/:cedula')
  @ApiOperation({ summary: 'Obtener un cliente por su número de cédula' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  async findOneByCedula(@Param('cedula') cedula: string) {
    const client = await this.clientsService.findOneByCedula(cedula);
    if (!client) {
      throw new NotFoundException(`Cliente con cédula "${cedula}" no encontrado.`);
    }
    return client;
  }

  // Novedad: Endpoint para obtener un cliente por su ID
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por su ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.findOne(id);
  }

  // Novedad: Endpoint para actualizar un cliente
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cliente por su ID' })
  @ApiResponse({
    status: 200,
    description: 'Cliente actualizado exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de actualización inválidos.',
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  @ApiBody({
    type: UpdateClientDto,
    description: 'Datos para actualizar el cliente',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientDto);
  }

  // Novedad: Endpoint para eliminar un cliente
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cliente por su ID' })
  @ApiResponse({ status: 204, description: 'Cliente eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content para eliminación exitosa
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.remove(id);
  }
}
