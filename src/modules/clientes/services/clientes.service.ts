import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from '../entities/cliente.entity';
import { Repository } from 'typeorm';
import { CreateClienteDto } from '../dto/create-cliente.dto';
import { UpdateClienteDto } from '../dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) { }

  async listarClientes(): Promise<Cliente[]> {
    return this.clienteRepository.find({ where: { apiEstado: 'ACTIVO' } });
  }

  async crearCliente(dto: CreateClienteDto, usuario: string): Promise<Cliente> {
    const existeEmail = await this.clienteRepository.findOne({ where: { email: dto.email } });
    if (existeEmail) {
      throw new ConflictException('El email ya está en uso');
    }

    const cliente = this.clienteRepository.create({
      ...dto,
      apiEstado: 'ACTIVO',
      apiTransaccion: 'ACTIVAR',
      usuCre: usuario,
      fecCre: new Date(),
    });
    return this.clienteRepository.save(cliente);
  }

  async editarCliente(id: string, dto: UpdateClienteDto, usuario: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    Object.assign(cliente, dto, { usuMod: usuario, fecMod: new Date() });
    if (dto.activo !== undefined) {
      cliente.apiEstado = dto.activo ? 'ACTIVO' : 'INACTIVO';
      cliente.apiTransaccion = dto.activo ? 'ACTIVAR' : 'INACTIVAR';
    }

    return this.clienteRepository.save(cliente);
  }
}
