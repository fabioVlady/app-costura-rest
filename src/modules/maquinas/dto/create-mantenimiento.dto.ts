import { Type } from 'class-transformer';
import { IsUUID, IsDate, IsOptional, IsNumber, IsString, MaxLength, IsIn } from 'class-validator';

export class CreateMantenimientoDto {
  @IsUUID()
  maquinaId: string;

  @IsDate()
  @Type(() => Date)
  fecRealizado: Date;

  @IsString()
  @MaxLength(50)
  @IsIn(['PREVENTIVO', 'CORRECTIVO'])
  tipo: string;

  @IsOptional()
  @IsNumber()
  precio?: number;

  @IsOptional()
  @IsString()
  comentarios?: string;
}