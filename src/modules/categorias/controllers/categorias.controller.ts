import { Body, Controller, Get, Param, Patch, Post, Req, ValidationPipe } from '@nestjs/common';
import { CategoriasService } from '../services/categorias.service';
import { Roles } from 'src/modules/security/decorators/roles.decorator';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) { }

  @Get()
  async listarCategorias() {
    return this.categoriasService.listarCategorias();
  }

  @Post()
  @Roles('Admin', 'Moderador')
  async crearCategoria(@Body(new ValidationPipe({ transform: true })) dto: CreateCategoriaDto, @Req() req) {
    return this.categoriasService.crearCategoria(dto, req.user.username);
  }

  @Patch(':id')
  @Roles('Admin', 'Moderador')
  async editarCategoria(@Param('id') id: string, @Body(new ValidationPipe({ transform: true })) dto: UpdateCategoriaDto, @Req() req) {
    return this.categoriasService.editarCategoria(id, dto, req.user.username);
  }
}
