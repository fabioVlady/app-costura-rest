import { Body, Controller, Get, Param, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { Usuario } from '../entities/usuario.entity';
import { RolesGuard } from 'src/modules/security/guards/roles.guard';
import { Roles } from 'src/modules/security/decorators/roles.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(RolesGuard, JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('create')
  @Roles('admin', 'moderador') // ✅ Solo Admin y Moderador pueden crear usuarios
  async crearUsuario(
    @Req() req,
    @Body(new ValidationPipe({ transform: true })) createUserDto: CreateUserDto, // ✅ Validación automática con DTO
  ): Promise<Usuario> {
    return this.usersService.crearUsuario(
      createUserDto.nombre,
      createUserDto.username,
      createUserDto.password,
      createUserDto.email,
      req.user, // Usuario autenticado que hace la solicitud
      createUserDto.rolIds,
    );
  }

  @Get(':username')
  async buscarUsuario(@Param('username') username: string): Promise<Usuario | null> {
    return this.usersService.buscarUsuarioPorUsername(username);
  }

  @Post('assign-role')
  async asignarRol(
    @Body() body: { usuarioId: string; rolNombre: string; usuCre: string },
  ) {
    await this.usersService.asignarRol(body.usuarioId, body.rolNombre, body.usuCre);
    return { message: 'Rol asignado correctamente' };
  }
}
