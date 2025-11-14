import { Module } from '@/domain/entities/Module';
import { ModuleKey } from '@/domain/value-objects/ModuleKey';
import { Database } from '@/integrations/supabase/types';

type ModuleCatalogRow = Database['public']['Tables']['module_catalog']['Row'];
type ClinicModuleRow = Database['public']['Tables']['clinic_modules']['Row'];

/**
 * Mapper: Supabase Row ↔ Module Entity
 */
export class ModuleMapper {
  static toDomain(
    catalogRow: ModuleCatalogRow,
    clinicModuleRow?: ClinicModuleRow
  ): Module {
    return Module.restore({
      id: catalogRow.id,
      moduleKey: ModuleKey.create(catalogRow.module_key),
      name: catalogRow.name,
      description: catalogRow.description ?? undefined,
      category: catalogRow.category ?? 'Outros',
      isActive: clinicModuleRow?.is_active ?? false,
      subscribedAt: clinicModuleRow?.subscribed_at 
        ? new Date(clinicModuleRow.subscribed_at) 
        : new Date(),
    });
  }

  static catalogToPersistence(
    module: Module
  ): Omit<ModuleCatalogRow, 'id'> {
    return {
      module_key: module.moduleKey.getValue(),
      name: module.name,
      description: module.description ?? null,
      category: module.category,
      icon: 'default', // Default icon
      created_at: new Date().toISOString(),
    };
  }
}
