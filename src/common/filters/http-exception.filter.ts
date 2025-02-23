import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>(); // ✅ Usar Fastify
    const request = ctx.getRequest<FastifyRequest>(); // ✅ Usar Fastify

    let status = HttpStatus.INTERNAL_SERVER_ERROR; // Por defecto, error 500
    let message = 'Error interno del servidor';

    // 📌 Imprimir el error en la consola para debug
    console.error('❌ ERROR DETECTADO:', exception);

    // ✅ Capturar errores de PostgreSQL (TypeORM)
    if (exception instanceof QueryFailedError) {
      if ((exception as any).code === '23505') {
        status = HttpStatus.CONFLICT; // 409 Conflict
        message = (exception as any).detail; // 🔥 Extraer el detalle de la clave duplicada
      }
    }

    // ✅ Capturar errores de NestJS
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Extraer mensaje del error
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
    }

    // 📌 Respuesta uniforme para el frontend
    response.status(status).send({
      statusCode: status,
      message,
      error: HttpStatus[status],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
