import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Sesion } from '../../auth/entities/sesion.entity';
import { BaseApiEntity } from '../../../common/entities/base-api.entity';
import { UsuarioRol } from './usuario-rol.entity';

@Entity({ schema: 'seguridad', name: 'usuario' })
export class Usuario extends BaseApiEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string; // Se almacenará encriptada

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.usuario)
  roles: UsuarioRol[];

  constructor(
    nombre: string,
    username: string,
    password: string,
    email: string,
    usuCre: string,
    apiEstado: string = 'ACTIVO', // ✅ Permite modificarlo en el futuro si es necesario
    apiTransaccion: string = 'ACTIVAR' // ✅ Igual que el estado
  ) {
    super(apiEstado, apiTransaccion, usuCre);
    this.nombre = nombre;
    this.username = username;
    this.password = password;
    this.email = email;
    this.activo = true;
  }
}
