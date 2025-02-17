import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USER', 'postgres'),
  password: configService.get<string>('DB_PASS', 'password'),
  database: configService.get<string>('DB_NAME', 'app_db'),
  autoLoadEntities: true, // Carga todas las entidades automáticamente
  synchronize: true, // Solo en desarrollo, en producción usar migrations
  logging: configService.get<boolean>('DB_LOGG', false),
  ssl: {
    rejectUnauthorized: false, // 🔹 Permite conexión sin verificación de certificado
  },
});
