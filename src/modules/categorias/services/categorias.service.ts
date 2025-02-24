import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../entities/categoria.entity';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) { }

  async listarCategorias(): Promise<Categoria[]> {
    return this.categoriaRepository.find();
  }

  async crearCategoria(dto: CreateCategoriaDto, usuario: string): Promise<Categoria> {
    const categoria = this.categoriaRepository.create({
      ...dto,
      apiEstado: 'ACTIVO',
      apiTransaccion: 'ACTIVAR',
      usuCre: usuario,
      fecCre: new Date(),
    });
    return this.categoriaRepository.save(categoria);
  }

  async editarCategoria(id: string, dto: UpdateCategoriaDto, usuario: string): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({ where: { id } });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');

    if (dto.activo !== undefined) {
      categoria.apiEstado = dto.activo ? 'ACTIVO' : 'INACTIVO';
      categoria.apiTransaccion = dto.activo ? 'ACTIVAR' : 'INACTIVAR';
    }

    Object.assign(categoria, dto, { usuMod: usuario, fecMod: new Date() });
    return this.categoriaRepository.save(categoria);
  }
}
