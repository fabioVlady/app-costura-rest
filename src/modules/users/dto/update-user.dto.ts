import { IsString, IsOptional, IsEmail, IsBoolean, ArrayMinSize, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @ArrayMinSize(1, { message: 'Debe tener al menos un rol' }) // ✅ Mínimo 1 rol
  @IsUUID('4', { each: true, message: 'Cada rol debe ser un UUID válido' }) // ✅ Cada rol debe ser UUID
  rolIds?: string[];
}
