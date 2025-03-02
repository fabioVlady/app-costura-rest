import { Module } from '@nestjs/common';
import { MaquinasService } from './services/maquinas.service';
import { MaquinasController } from './controllers/maquinas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Maquina } from './entities/maquina.entity';
import { MantenimientoMaquina } from './entities/mantenimiento-maquina.entity';
import { MantenimientoMaquinasService } from './services/mantenimiento-maquinas.service';
import { MantenimientoMaquinasController } from './controllers/mantenimiento-maquinas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Maquina, MantenimientoMaquina])],
  providers: [MaquinasService, MantenimientoMaquinasService],
  controllers: [MaquinasController, MantenimientoMaquinasController],
  exports: [MaquinasService, MantenimientoMaquinasService],
})
export class MaquinasModule { }
