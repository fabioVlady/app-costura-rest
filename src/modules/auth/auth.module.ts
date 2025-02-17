import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Sesion } from './entities/sesion.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule, // ✅ Asegura que `JWT_SECRET` esté disponible en este módulo
    UsersModule,
    TypeOrmModule.forFeature([Sesion]),
    JwtModule.registerAsync({
      imports: [ConfigModule], // ✅ Obtiene la configuración desde `ConfigModule`
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AuthService, JwtAuthGuard, JwtStrategy], // ✅ Registramos `JwtStrategy`
  exports: [AuthService, JwtAuthGuard],
  controllers: [AuthController],
})
export class AuthModule { }
