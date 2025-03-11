import { Body, Controller, Get, Param, Patch, Post, Req, ValidationPipe } from '@nestjs/common';
import { MaquinasService } from '../services/maquinas.service';
import { Roles } from 'src/modules/security/decorators/roles.decorator';
import { CreateMaquinaDto } from '../dto/create-maquina.dto';
import { UpdateMaquinaDto } from '../dto/update-maquina.dto';
import { EnumService } from 'src/common/services/enum.service';

@Controller('maquinas')
export class MaquinasController {
  constructor(private readonly maquinasService: MaquinasService) { }

  @Get()
  async listarMaquinas() {
    return this.maquinasService.listarMaquinas();
  }

  @Post()
  @Roles('Admin', 'Moderador')
  async crearMaquina(@Body(new ValidationPipe({ transform: true })) dto: CreateMaquinaDto, @Req() req) {
    return this.maquinasService.crearMaquina(dto, req.user.username);
  }

  @Patch(':id')
  @Roles('Admin', 'Moderador')
  async editarMaquina(@Param('id') id: string, @Body(new ValidationPipe({ transform: true })) dto: UpdateMaquinaDto, @Req() req) {
    return this.maquinasService.editarMaquina(id, dto, req.user.username);
  }
}
