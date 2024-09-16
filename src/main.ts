import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Serve static files from the 'uploads/dns-lookup/results' directory
  app.use(
    '/dns-lookup/results',
    express.static(join(__dirname, '..', 'uploads', 'dns-lookup', 'results')),
  );

  app.enableCors({
    origin: '*', // Replace with your frontend URL if needed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
