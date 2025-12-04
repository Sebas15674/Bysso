// server/src/workers/dto/query-worker.dto.ts
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryWorkerDto {
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano.' })
  @Type(() => Boolean) // Esto es crucial para convertir "true"/"false" a booleano
  activo?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
