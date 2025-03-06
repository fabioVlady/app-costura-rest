import { Controller, Get, Post } from '@nestjs/common';
import { EnumService } from '../services/enum.service';

@Controller('enums')
export class EnumController {
  constructor(private readonly enumService: EnumService) { }

  @Get()
  async obtenerEnums() {
    return this.enumService.obtenerValoresEnum('tipo_maquina'); // Ejemplo para un solo ENUM
  }

  @Post('refresh')
  async actualizarEnums() {
    await this.enumService.cargarEnums();
    return { message: 'ENUMs actualizados correctamente' };
  }
}
