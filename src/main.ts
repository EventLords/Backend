import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ignoră câmpuri în plus
      forbidNonWhitelisted: true, // eroare dacă vin câmpuri în plus
      transform: true, // transformă automat tipurile (ex: string -> number)
    }),
  );

  await app.listen(3000);
}
bootstrap();
