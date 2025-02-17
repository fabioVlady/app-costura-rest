import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { UsuarioRol } from './entities/usuario-rol.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol, UsuarioRol])],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
