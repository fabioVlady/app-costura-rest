import { IsOptional, IsString, MaxLength, IsIn, IsNumber } from 'class-validator';
import { IsEnumValid } from 'src/common/validators/IsEnumValid';

export class UpdateMaquinaDto {

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @IsEnumValid('tipo_maquina')
  tipoMaquina?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  mantenimiento?: number;

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVO', 'EN_MANTENIMIENTO', 'INACTIVO', 'DESCARTADO'])
  estado?: string;
}
