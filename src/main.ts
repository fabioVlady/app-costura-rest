import * as crypto from 'crypto';
(global as any).crypto = crypto;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  console.log('¿Crypto está disponible?', typeof crypto !== 'undefined' ? 'Sí' : 'No');

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Servidor corriendo en http://localhost:3000');
}
bootstrap();

