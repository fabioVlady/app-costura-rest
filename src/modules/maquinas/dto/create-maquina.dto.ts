import { IsIn, IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { ENUMS } from 'src/common/constants/enums';
import { EnumService } from 'src/common/services/enum.service';

export class CreateMaquinaDto {
  constructor(tipoMaquinas: string[]) {
    this.tipoMaquinas = tipoMaquinas;
  }

  private readonly tipoMaquinas: string[]; // almacena los valores del enum

  @IsString()
  @IsNotEmpty()
  // @IsIn(this.tipoMaquinas, { message: `tipoMaquina debe ser uno de: ${this.tipoMaquinas.join(', ')}` })
  // @IsIn(ENUMS.tipo_maquina, { message: `tipoMaquina debe ser uno de: ${ENUMS.tipo_maquina.join(', ')}` })
  @IsIn(ENUMS['tipo_maquina'], { message: `tipoMaquina debe ser uno de: ${ENUMS['tipo_maquina'].join(', ')}` })
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