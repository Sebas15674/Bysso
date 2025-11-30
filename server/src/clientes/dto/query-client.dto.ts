// server/src/clientes/dto/query-client.dto.ts
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class QueryClientDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional() // El campo de búsqueda es opcional, si no hay búsqueda se devuelven todos (o un límite)
  search?: string; // Para buscar por nombre, cédula o celular
}
