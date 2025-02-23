import { IsString, IsNotEmpty, IsEmail, MinLength, ArrayMinSize, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsEmail()
  email: string;

  @ArrayMinSize(1, { message: 'Debe asignarse al menos un rol' }) // ✅ Mínimo 1 rol
  @IsUUID('4', { each: true, message: 'Cada rol debe ser un UUID válido' }) // ✅ Verifica que sean UUIDs válidos
  rolIds: string[];
}
