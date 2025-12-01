import { IsArray, IsString, IsNotEmpty, ArrayMinSize } from 'class-validator';

export class CancelOrdersDto {
  @IsArray({ message: 'Las bolsas deben ser un arreglo de cadenas de texto.' })
  @IsString({
    each: true,
    message: 'Cada ID de bolsa debe ser una cadena de texto.',
  })
  @IsNotEmpty({
    each: true,
    message: 'Cada ID de bolsa en el arreglo no puede estar vacío.',
  })
  @ArrayMinSize(1, {
    message: 'Debe proporcionar al menos un ID de bolsa para cancelar.',
  })
  bagIds: string[];
}
