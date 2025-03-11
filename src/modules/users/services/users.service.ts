import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../entities/usuario.entity';
import { FindManyOptions, In, Like, Repository } from 'typeorm';
import { Rol } from '../entities/rol.entity';
import * as bcrypt from 'bcrypt';
import { UsuarioRol } from '../entities/usuario-rol.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import { FilterUsersDto } from '../dto/filter-user.dto';

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

  async obtenerUsuariosAll(): Promise<any[]> {
    const usuarios = await this.usuarioRepository.find({
      relations: ['roles', 'roles.rol'], // ✅ Incluir los roles en la respuesta
    });
    const res = usuarios.map(usuario => ({
      id: usuario.id,
      nombre: usuario.nombre,
      username: usuario.username,
      email: usuario.email,
      activo: usuario.activo,
      usuCre: usuario.usuCre,
      fecCre: usuario.fecCre,
      usuMod: usuario.usuMod,
      fecMod: usuario.fecMod,
      roles: usuario.roles.map(ur => ({
        id: ur.rol.id,
        nombre: ur.rol.nombre,
        descripcion: ur.rol.descripcion,
      })),
    }));
    return res;
  }

  async getUsersPage(
    page: number = 1,
    limit: number = 10,
    filtros: FilterUsersDto
  ): Promise<{ data: any[]; total: number }> {

    // 📌 Configurar opciones de búsqueda dinámicamente
    const where: FindManyOptions<Usuario>['where'] = {};

    if (filtros.nombre) where.nombre = Like(`%${filtros.nombre}%`);
    if (filtros.email) where.email = Like(`%${filtros.email}%`);
    if (filtros.activo !== undefined) where.activo = filtros.activo;

    // 📌 Configurar ordenamiento dinámico
    const order: FindManyOptions<Usuario>['order'] = {};
    if (filtros.orderBy) order[filtros.orderBy] = filtros.orderDir ?? 'ASC';

    // 📌 Obtener usuarios con filtros, paginación y ordenamiento
    const [usuarios, total] = await this.usuarioRepository.findAndCount({
      where,
      relations: ['roles', 'roles.rol'],
      order,
      skip: (page - 1) * limit,
      take: limit,
    });

    // 📌 Optimizar respuesta eliminando `password`
    const data = usuarios.map(usuario => ({
      id: usuario.id,
      nombre: usuario.nombre,
      username: usuario.username,
      email: usuario.email,
      activo: usuario.activo,
      roles: usuario.roles.map(ur => ({
        id: ur.rol.id,
        nombre: ur.rol.nombre,
        descripcion: ur.rol.descripcion,
      })),
    }));

    return { data, total };
  }

  async crearUsuario(
    nombre: string,
    username: string,
    password: string,
    email: string,
    usuCre: AuthenticatedUser,
    rolIds: string[],
  ): Promise<Usuario> {
    // 1️⃣ Obtener roles de la BD
    const roles = await this.rolRepository.find({ where: { id: In(rolIds) } });
    if (!roles || roles.length !== rolIds.length) {
      throw new NotFoundException('El o los roles no existen para asignar');
    }
    // 2️⃣ Validar que el Moderador no pueda asignar Admin
    if (usuCre.roles.includes['Moderador']) {
      const rolesNoPermitidos = roles.filter(rol => rol.nombre === 'Admin');
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
      fecCre: new Date()
    });

    await this.usuarioRepository.save(usuario);

    // 5️⃣ Asignar roles
    const usuarioRoles = roles.map(rol => new UsuarioRol(usuario, rol, usuCre.username));
    await this.usuarioRolRepository.save(usuarioRoles);

    return usuario;
  }
  async editarUsuario(
    usuarioId: string,
    updateData: UpdateUserDto,
    usuarioEditor: AuthenticatedUser,
  ): Promise<Usuario> {
    // 🔸 Buscar usuario y roles en paralelo
    const [usuario, rolesActuales] = await Promise.all([
      this.usuarioRepository.findOne({ where: { id: usuarioId } }),
      this.usuarioRolRepository
        .createQueryBuilder('usuarioRol')
        .select('usuarioRol.rol.id', 'rol_id') // 📌 Obtener solo los IDs de los roles
        .where('usuarioRol.usuario.id = :usuarioId', { usuarioId })
        .getRawMany()
        .then(results => results.map(r => r.rol_id)),
    ]);

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // ✅ 1️⃣ Validar permisos del usuario que edita
    const esAdmin = usuarioEditor.roles.includes('Admin');
    const esModerador = usuarioEditor.roles.includes('Moderador');

    if (!esAdmin && !esModerador) {
      throw new ForbiddenException('No tienes permisos para editar usuarios.');
    }

    // ✅ 2️⃣ Actualizar datos básicos (Admin y Moderador pueden hacerlo)
    if (updateData.nombre) usuario.nombre = updateData.nombre;
    if (updateData.email) usuario.email = updateData.email;
    if (updateData.activo !== undefined) usuario.activo = updateData.activo;
    usuario.usuMod = usuarioEditor.username;

    // ✅ 3️⃣ Actualizar roles (Solo si se envían en el DTO)
    if (updateData.rolIds) {
      // 📌 Identificar roles nuevos y roles eliminados
      const nuevosRolesIds = updateData.rolIds.filter(id => !rolesActuales.includes(id));
      const rolesEliminados = rolesActuales.filter(id => !updateData.rolIds!.includes(id));

      // ❌ Moderador NO puede asignar "Admin"
      if (!esAdmin && esModerador) {
        const rolesSolicitados = await this.rolRepository.find({ where: { id: In(nuevosRolesIds) } });
        const rolesInvalidos = rolesSolicitados.filter(rol => rol.nombre === 'Admin');

        if (rolesInvalidos.length > 0) {
          throw new ForbiddenException('Con tu rol, no puedes asignar el rol de Admin.');
        }
      }

      // ✅ Eliminar roles que ya no debe tener (solo si hay cambios)
      if (rolesEliminados.length > 0) {
        await this.usuarioRolRepository.delete({ usuario: { id: usuario.id }, rol: In(rolesEliminados) });
      }

      // ✅ Agregar solo los roles nuevos (solo si hay cambios)
      if (nuevosRolesIds.length > 0) {
        const nuevosRoles = nuevosRolesIds.map(rolId => new UsuarioRol(usuario, { id: rolId } as Rol, usuarioEditor.username));
        await this.usuarioRolRepository.save(nuevosRoles);
      }
    }
    return this.usuarioRepository.save(usuario);
  }




  async buscarUsuarioPorUsername(username: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { username }, relations: ['roles', 'roles.rol'] });
  }

  async buscarUsuarioPorID(id: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({ where: { id }, relations: ['roles', 'roles.rol'] });;
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


  async cambiarContraseña(usuarioId: string, oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const passwordValida = await bcrypt.compare(oldPassword, usuario.password);
    if (!passwordValida) throw new UnauthorizedException('Contraseña actual incorrecta');

    usuario.password = await bcrypt.hash(newPassword, 10);
    await this.usuarioRepository.save(usuario);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
