import { IsIn, IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { IsEnumValid } from 'src/common/validators/IsEnumValid';

export class CreateMaquinaDto {
  @IsString()
  @IsNotEmpty()
  @IsEnumValid('tipo_maquina')
  tipoMaquina: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @IsNumber()
  mantenimiento?: number = 0;
}