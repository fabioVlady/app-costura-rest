import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateMantenimientoDto } from '../dto/update-mantenimiento.dto';
import { MantenimientoMaquina } from '../entities/mantenimiento-maquina.entity';
import { CreateMantenimientoDto } from '../dto/create-mantenimiento.dto';
import { Maquina } from '../entities/maquina.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MantenimientoMaquinasService {
  constructor(
    @InjectRepository(MantenimientoMaquina)
    private readonly mantenimientoRepository: Repository<MantenimientoMaquina>,
    @InjectRepository(Maquina)
    private readonly maquinaRepository: Repository<Maquina>,
  ) { }

  async listarMantenimientos(): Promise<MantenimientoMaquina[]> {
    return this.mantenimientoRepository.find();
  }

  async registrarMantenimiento(dto: CreateMantenimientoDto, usuario: string): Promise<MantenimientoMaquina> {
    const maquina = await this.maquinaRepository.findOne({ where: { id: dto.maquinaId } });
    if (!maquina) throw new NotFoundException('Máquina no encontrada');

    if (maquina.apiEstado === 'EN MANTENIMIENTO' || maquina.apiEstado === 'INACTIVO' || maquina.apiEstado === 'DESCARTADO') {
      throw new ConflictException('No se puede registrar mantenimiento en el estado actual de la máquina');
    }
    console.log('maquina', maquina);
    console.log('dto mantenimiento', dto);
    const mantenimiento = this.mantenimientoRepository.create({
      ...dto,
      apiEstado: 'PROGRAMADO',
      apiTransaccion: 'CREAR',
      usuCre: usuario,
      fecCre: new Date(),
      maquinaId: maquina.id,
    });
    // mantenimiento.maquinaId = maquina.id;
    console.log('entity mantenimiento', mantenimiento);
    return this.mantenimientoRepository.save(mantenimiento);
  }

  async actualizarMantenimiento(id: string, dto: UpdateMantenimientoDto, usuario: string): Promise<MantenimientoMaquina> {
    const mantenimiento = await this.mantenimientoRepository.findOne({ where: { id } });
    if (!mantenimiento) throw new NotFoundException('Mantenimiento no encontrado');

    const maquina = await this.maquinaRepository.findOne({ where: { id: mantenimiento.maquinaId } });
    if (!maquina) throw new NotFoundException('Máquina no encontrada');

    // 🚨 Bloquear modificaciones si ya está "REALIZADO" o "CANCELADO"
    if (['REALIZADO', 'CANCELADO'].includes(mantenimiento.apiEstado)) {
      throw new ConflictException(`El mantenimiento ya está ${mantenimiento.apiEstado} y no puede ser modificado`);
    }

    // 🚨 Bloquear modificaciones si la máquina está "INACTIVO" o "DESCARTADO"
    if (['INACTIVO', 'DESCARTADO'].includes(maquina.apiEstado)) {
      throw new ConflictException(`No se puede modificar mantenimiento porque la máquina está ${maquina.apiEstado}`);
    }

    // ✅ Reglas de cambio de estado
    const cambiosPermitidos: Record<string, string[]> = {
      PROGRAMADO: ['EN_EJECUCION', 'CANCELADO'],
      EN_EJECUCION: ['REALIZADO', 'CANCELADO'],
      REALIZADO: [], // No puede cambiar desde REALIZADO
      CANCELADO: [], // No puede cambiar desde CANCELADO
    };

    // 🚨 Validar cambio de estado permitido
    if (dto.estado && !cambiosPermitidos[mantenimiento.apiEstado].includes(dto.estado)) {
      throw new ConflictException(`No puedes cambiar el estado de ${mantenimiento.apiEstado} a ${dto.estado}`);
    }

    // ✅ Si el mantenimiento pasa a "EN_EJECUCION", la máquina cambia a "EN_MANTENIMIENTO"
    if (dto.estado === 'EN_EJECUCION') {
      if (maquina.apiEstado !== 'ACTIVO') {
        throw new ConflictException('Solo puedes iniciar ejecución si la máquina está ACTIVO');
      }
      maquina.apiEstado = 'EN_MANTENIMIENTO';
      maquina.apiTransaccion = 'ACTUALIZAR';
      maquina.usuMod = usuario;
      maquina.fecMod = new Date();
      await this.maquinaRepository.save(maquina);
    }

    // ✅ Si el mantenimiento pasa a "REALIZADO", la máquina vuelve a "ACTIVO"
    if (dto.estado === 'REALIZADO') {
      if (maquina.apiEstado !== 'EN_MANTENIMIENTO') {
        throw new ConflictException('Solo puedes marcar como REALIZADO si la máquina está EN_MANTENIMIENTO');
      }
      maquina.apiEstado = 'ACTIVO';
      maquina.apiTransaccion = 'ACTUALIZAR';
      maquina.usuMod = usuario;
      maquina.fecMod = new Date();
      await this.maquinaRepository.save(maquina);
    }

    // ✅ Actualizar mantenimiento
    Object.assign(mantenimiento, dto, { usuMod: usuario, fecMod: new Date(), apiEstado: dto.estado });
    return this.mantenimientoRepository.save(mantenimiento);
  }

}
