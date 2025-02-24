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
      const ex = exception as any;
      switch (ex.code) {
        case '23505': // 🔹 Violación de restricción UNIQUE
          status = HttpStatus.CONFLICT; // 409 Conflict
          message = ex.detail || 'Clave duplicada detectada';
          break;

        case '23502': // 🔹 Columna con restricción NOT NULL está en NULL
          status = HttpStatus.CONFLICT; // 400 Bad Request
          message = `El campo ${ex.column} de la tabla ${ex.table} no puede ser nulo`;
          break;

        case '23503': // 🔹 Violación de clave foránea (FK)
          status = HttpStatus.BAD_REQUEST; // 400 Bad Request
          message = 'La relación con otra tabla no es válida';
          break;

        case '23514': // 🔹 Violación de restricción CHECK
          status = HttpStatus.BAD_REQUEST; // 400 Bad Request
          message = 'El valor ingresado no cumple con las reglas de validación';
          break;

        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Error interno del servidor TypeORM';
          break;
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
