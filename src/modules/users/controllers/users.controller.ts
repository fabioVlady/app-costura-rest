import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { Usuario } from '../entities/usuario.entity';
import { RolesGuard } from 'src/modules/security/guards/roles.guard';
import { Roles } from 'src/modules/security/decorators/roles.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FilterUsersDto } from '../dto/filter-user.dto';
import { ChangePasswordDto } from '../dto/change-password-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Roles('Admin', 'Moderador') // ✅ Solo Admin y Moderador pueden ver la lista de usuarios
  async obtenerUsuarios(): Promise<any[]> {
    return this.usersService.obtenerUsuariosAll();
  }

  @Post('/page')
  async getUsersPage(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    // @Body() filtros: FilterUsersDto
    @Body(new ValidationPipe({ transform: true })) filtros: FilterUsersDto,
  ) {
    return this.usersService.getUsersPage(Number(page), Number(limit), filtros);
  }

  @Post('create')
  @Roles('Admin', 'Moderador') // ✅ Solo Admin y Moderador pueden crear usuarios
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

  @Put(':usuarioId')
  @Roles('Admin', 'Moderador')
  async editarUsuario(
    @Param('usuarioId') usuarioId: string,
    @Body(new ValidationPipe({ transform: true })) updateUserDto: UpdateUserDto,
    @Req() req,
  ): Promise<Usuario> {
    return this.usersService.editarUsuario(usuarioId, updateUserDto, req.user);
  }

  @Get(':username')
  async buscarUsuario(@Param('username') username: string): Promise<Usuario | null> {
    return this.usersService.buscarUsuarioPorUsername(username);
  }
  @Get('/porid/:id')
  async buscarUsuarioXid(@Param('id') id: string): Promise<Usuario | null> {
    return this.usersService.buscarUsuarioPorID(id);
  }

  @Post('assign-role')
  async asignarRol(
    @Body() body: { usuarioId: string; rolNombre: string; usuCre: string },
  ) {
    await this.usersService.asignarRol(body.usuarioId, body.rolNombre, body.usuCre);
    return { message: 'Rol asignado correctamente' };
  }

  //contraseña
  @Post('change-password')
  async cambiarContraseña(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.usersService.cambiarContraseña(req.user.id, dto.oldPassword, dto.newPassword);
  }
}
