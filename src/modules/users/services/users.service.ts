import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../entities/usuario.entity';
import { In, Repository } from 'typeorm';
import { Rol } from '../entities/rol.entity';
import * as bcrypt from 'bcrypt';
import { UsuarioRol } from '../entities/usuario-rol.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepository: Repository<UsuarioRol>, // ✅ Agregar repositorio de UsuarioRol
  ) { }

  async obtenerUsuarios(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      relations: ['roles', 'roles.rol'], // ✅ Incluir los roles en la respuesta
    });
  }

  async crearUsuario(
    nombre: string,
    username: string,
    password: string,
    email: string,
    usuCre: Usuario,
    rolIds: string[],
  ): Promise<Usuario> {
    // 1️⃣ Obtener roles de la BD
    const roles = await this.rolRepository.find({ where: { id: In(rolIds) } });

    // 2️⃣ Validar que el Moderador no pueda asignar Admin
    if (usuCre.roles.some(r => r.rol.nombre === 'moderador')) {
      const rolesNoPermitidos = roles.filter(rol => rol.nombre === 'admin');
      if (rolesNoPermitidos.length > 0) {
        throw new ForbiddenException('No puedes asignar el rol de admin.');
      }
    }

    // 3️⃣ Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Crear usuario
    const usuario = this.usuarioRepository.create({
      nombre,
      username,
      password: hashedPassword,
      email,
      usuCre: usuCre.username,
    });

    await this.usuarioRepository.save(usuario);

    // 5️⃣ Asignar roles
    const usuarioRoles = roles.map(rol => new UsuarioRol(usuario, rol, usuCre.username));
    await this.usuarioRolRepository.save(usuarioRoles);

    return usuario;
  }

  async buscarUsuarioPorUsername(username: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { username }, relations: ['roles', 'roles.rol'] });
  }

  async asignarRol(usuarioId: string, rolNombre: string, usuCre: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId }, relations: ['roles'] });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const rol = await this.rolRepository.findOne({ where: { nombre: rolNombre } });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    // ✅ Crear una instancia de UsuarioRol antes de agregarla
    const usuarioRol = new UsuarioRol(usuario, rol, usuCre);

    // ✅ Guardar la relación en la base de datos
    await this.usuarioRolRepository.save(usuarioRol);
  }
}
