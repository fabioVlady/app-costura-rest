import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ENUMS } from '../constants/enums';

@Injectable()
export class EnumService {
  private enums: Map<string, string[]> = new Map(); // 📌 Almacenar ENUMs en memoria

  constructor(@InjectDataSource() private dataSource: DataSource) { }

  async cargarEnums(): Promise<void> {
    const resultado = await this.dataSource.query(`
      SELECT t.typname AS nombre_enum, string_agg(e.enumlabel, ',') AS valores
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'app'
      GROUP BY t.typname;
    `);

    resultado.forEach(row => {
      ENUMS[row.nombre_enum] = row.valores.split(',');
    });

    console.log('📌 ENUMs cargados:', ENUMS);
  }

  obtenerValoresEnum(nombreEnum: string): string[] {
    return ENUMS[nombreEnum] || [];
  }
}
