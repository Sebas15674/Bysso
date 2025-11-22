import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); //toma appmodule como parametro porque es el que se encarga de permisos y ejecución
  //Se trae el validationPipe de NestJS para validar los DTOs y las peticiones entrantes.
  //El ValidationPipe se encarga de validar los datos de entrada y aplicar transformaciones.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // lanza error si envían propiedades extra
      transform: true, // convierte tipos (ej: string a number)
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap(); //ejecuta la función
