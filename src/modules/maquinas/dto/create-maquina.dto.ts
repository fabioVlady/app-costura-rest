import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateMaquinaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
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