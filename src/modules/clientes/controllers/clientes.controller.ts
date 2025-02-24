import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ClientesService } from '../services/clientes.service';
import { Roles } from 'src/modules/security/decorators/roles.decorator';
import { CreateClienteDto } from '../dto/create-cliente.dto';
import { UpdateClienteDto } from '../dto/update-cliente.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) { }

  @Get()
  async listarClientes() {
    return this.clientesService.listarClientes();
  }

  @Post()
  @Roles('Admin', 'Moderador')
  async crearCliente(@Body() dto: CreateClienteDto, @Req() req) {
    return this.clientesService.crearCliente(dto, req.user.username);
  }

  @Patch(':id')
  @Roles('Admin', 'Moderador')
  async editarCliente(@Param('id') id: string, @Body() dto: UpdateClienteDto, @Req() req) {
    return this.clientesService.editarCliente(id, dto, req.user.username);
  }
}
