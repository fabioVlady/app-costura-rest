import { IsDate, IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { CreateMantenimientoDto } from './create-mantenimiento.dto';
import { Type } from 'class-transformer';

export class UpdateMantenimientoDto {
  // @IsUUID()
  // maquinaId: string;

  @IsDate()
  @Type(() => Date)
  fecRealizado: Date;

  @IsString()
  @MaxLength(50)
  tipo: string;

  @IsOptional()
  @IsNumber()
  precio?: number;

  @IsOptional()
  @IsString()
  comentarios?: string;

  @IsOptional()
  @IsString()
  @IsIn(['EN_EJECUCION', 'REALIZADO', 'CANCELADO'])
  estado?: string;
}