import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateMaquinaDto } from '../dto/update-maquina.dto';
import { Maquina } from '../entities/maquina.entity';
import { CreateMaquinaDto } from '../dto/create-maquina.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MantenimientoMaquina } from '../entities/mantenimiento-maquina.entity';

@Injectable()
export class MaquinasService {
  constructor(
    @InjectRepository(Maquina)
    private readonly maquinaRepository: Repository<Maquina>,
    @InjectRepository(MantenimientoMaquina)
    private readonly mantenimientoRepository: Repository<MantenimientoMaquina>,
  ) { }

  async listarMaquinas(): Promise<Maquina[]> {
    return this.maquinaRepository.find();
  }

  async crearMaquina(dto: CreateMaquinaDto, usuario: string): Promise<Maquina> {
    const maquina = this.maquinaRepository.create({
      ...dto,
      apiEstado: 'ACTIVO',
      apiTransaccion: 'ACTIVAR',
      usuCre: usuario,
      fecCre: new Date(),
    });
    return this.maquinaRepository.save(maquina);
  }

  async editarMaquina(id: string, dto: UpdateMaquinaDto, usuario: string): Promise<Maquina> {
    const maquina = await this.maquinaRepository.findOne({ where: { id } });
    if (!maquina) throw new NotFoundException('Máquina no encontrada');

    Object.assign(maquina, dto, { usuMod: usuario, fecMod: new Date() });
    if (dto.estado) {
      maquina.apiEstado = dto.estado;
    }
    return this.maquinaRepository.save(maquina);
  }

}
