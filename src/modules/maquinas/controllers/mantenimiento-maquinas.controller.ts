import { Body, Controller, Get, Param, Patch, Post, Req, ValidationPipe } from '@nestjs/common';
import { MantenimientoMaquinasService } from '../services/mantenimiento-maquinas.service';
import { Roles } from 'src/modules/security/decorators/roles.decorator';
import { CreateMantenimientoDto } from '../dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from '../dto/update-mantenimiento.dto';

@Controller('mantenimiento')
export class MantenimientoMaquinasController {
  constructor(private readonly mantenimientoService: MantenimientoMaquinasService) { }

  @Get()
  async listarMantenimientos() {
    return this.mantenimientoService.listarMantenimientos();
  }

  @Post()
  @Roles('Admin', 'Moderador')
  async registrarMantenimiento(@Body(new ValidationPipe({ transform: true })) dto: CreateMantenimientoDto, @Req() req) {
    return this.mantenimientoService.registrarMantenimiento(dto, req.user.username);
  }

  @Patch(':id')
  @Roles('Admin', 'Moderador')
  async actualizarMantenimiento(@Param('id') id: string, @Body(new ValidationPipe({ transform: true })) dto: UpdateMantenimientoDto, @Req() req) {
    return this.mantenimientoService.actualizarMantenimiento(id, dto, req.user.username);
  }
}
