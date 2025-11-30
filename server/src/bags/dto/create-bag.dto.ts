import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBagDto {
  @ApiProperty({
    description: 'Identificador único de la bolsa (ej: "1a", "21b", "30").',
    example: '31a',
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  id: string;
}
