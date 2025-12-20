import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. PREFIX GLOBAL
  // URL-ul devine: http://localhost:3001/api/...
  app.setGlobalPrefix('api');

  // 2. CORS (Portarul)
  app.enableCors({
    origin: [
      'http://localhost:5173', // Vite (Frontend-ul tău actual probabil e aici)
      'http://localhost:3000', // React clasic
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. VALIDARE (Filtrul de calitate)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Curăță gunoaiele (câmpuri extra)
      forbidNonWhitelisted: true, // Te ceartă dacă trimiți gunoaie
      transform: true, // Transformă automat string "5" în număr 5
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 4. PORNIRE SERVER
  // AICI AM SCHIMBAT DIN 3000 IN 3001 CA SA VORBEASCA CU FRONTENDUL
  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);

  console.log(`🚀 Backend running on http://localhost:${PORT}/api`);
}

bootstrap();
