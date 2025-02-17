import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Rol } from './rol.entity';
import { BaseApiEntity } from 'src/common/entities/base-api.entity';

@Entity({ schema: 'seguridad', name: 'usuario_rol' })
export class UsuarioRol extends BaseApiEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.roles, { onDelete: 'CASCADE' })
  usuario: Usuario;

  @ManyToOne(() => Rol, (rol) => rol.usuarios, { onDelete: 'CASCADE' })
  rol: Rol;

  constructor(usuario: Usuario, rol: Rol, usuCre: string) {
    super('CREADO', 'CREAR', usuCre);
    this.usuario = usuario;
    this.rol = rol;
  }
}
