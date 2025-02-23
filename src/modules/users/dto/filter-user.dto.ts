import { IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';

export class FilterUsersDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  rol?: string;

  @IsOptional()
  @IsString()
  @IsIn(['nombre', 'email', 'activo', 'fecCre']) // Campos permitidos para ordenamiento
  orderBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderDir?: 'ASC' | 'DESC';
}
