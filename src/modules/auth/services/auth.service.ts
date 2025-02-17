import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from 'src/modules/users/entities/usuario.entity';
import { UsersService } from 'src/modules/users/services/users.service';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Sesion } from '../entities/sesion.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(Sesion)
    private readonly sesionRepository: Repository<Sesion>,
  ) { }

  async validarUsuario(username: string, password: string) {
    const usuario = await this.usersService.buscarUsuarioPorUsername(username);
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) throw new UnauthorizedException('Credenciales inválidas');
    return usuario;
  }

  async login(username: string, password: string, ip: string, userAgent: string) {
    const usuario = await this.validarUsuario(username, password);

    const payload = { sub: usuario.id, username: usuario.username, roles: usuario.roles.map(r => r.rol.nombre) };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    // Guardar sesión en la BD
    const sesion = this.sesionRepository.create({
      usuario,
      token: refreshToken,
      ip,
      userAgent,
      fecExpira: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días de expiración
      usuCre: usuario.username,
    });

    await this.sesionRepository.save(sesion);

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    const sesion = await this.sesionRepository.findOne({ where: { token: refreshToken } });
    if (!sesion) throw new UnauthorizedException('Token inválido');

    await this.sesionRepository.delete(sesion.id);
    return { message: 'Sesión cerrada correctamente' };
  }

  async refreshToken(oldToken: string) {
    const sesion = await this.sesionRepository.findOne({ where: { token: oldToken } });
    if (!sesion) throw new UnauthorizedException('Refresh Token inválido');

    const decoded = this.jwtService.verify(oldToken);
    const usuario = await this.usersService.buscarUsuarioPorUsername(decoded.username);
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

    const payload = { sub: usuario.id, username: usuario.username, roles: usuario.roles.map(r => r.rol.nombre) };
    const newAccessToken = this.jwtService.sign(payload);

    return { accessToken: newAccessToken };
  }
}
