import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class EnumService implements OnModuleInit {
  static ENUMS: Record<string, string[]> = {};

  constructor(@InjectDataSource() private dataSource: DataSource) { }

  async onModuleInit() { // Se ejecuta al iniciar la aplicación
    await this.cargarEnums();
  }

  async cargarEnums(): Promise<void> {
    const resultado = await this.dataSource.query(`
      SELECT t.typname AS nombre_enum, string_agg(e.enumlabel, ',') AS valores
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'app'
      GROUP BY t.typname;
    `);

    EnumService.ENUMS = {}; // Resetear antes de cargar nuevos valores
    resultado.forEach(row => {
      EnumService.ENUMS[row.nombre_enum] = row.valores.split(',');
    });

    console.log('onmoduleinit ENUMs cargados:', EnumService.ENUMS);
  }
  static getEnumValues(enumName: string): string[] {
    return EnumService.ENUMS[enumName] ?? [];
  }
  getEnums(): Record<string, string[]> {
    return EnumService.ENUMS;
  }
}
