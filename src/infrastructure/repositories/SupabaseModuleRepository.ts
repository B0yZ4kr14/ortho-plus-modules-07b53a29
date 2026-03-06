import { Module } from "@/domain/entities/Module";
import { IModuleRepository } from "@/domain/repositories/IModuleRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors";
import { ModuleMapper } from "../mappers/ModuleMapper";

export class SupabaseModuleRepository implements IModuleRepository {
  async findById(id: number): Promise<Module | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/module_catalog?id=eq.${id}`,
      );
      if (!data || data.length === 0) return null;
      return ModuleMapper.toDomain(data[0]);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Erro inesperado ao buscar módulo", error);
    }
  }

  async findByKey(moduleKey: string): Promise<Module | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/module_catalog?module_key=eq.${moduleKey}`,
      );
      if (!data || data.length === 0) return null;
      return ModuleMapper.toDomain(data[0]);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar módulo por chave",
        error,
      );
    }
  }

  async findByClinicId(clinicId: string): Promise<Module[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/clinic_modules?select=*,module_catalog(*)&clinic_id=eq.${clinicId}`,
      );
      return (data || []).map((row) =>
        ModuleMapper.toDomain(row.module_catalog as any, row),
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar módulos da clínica",
        error,
      );
    }
  }

  async findActiveByClinicId(clinicId: string): Promise<Module[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/clinic_modules?select=*,module_catalog(*)&clinic_id=eq.${clinicId}&is_active=eq.true`,
      );
      return ((data as any[]) || []).map((row) =>
        ModuleMapper.toDomain(row.module_catalog, row),
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar módulos ativos",
        error,
      );
    }
  }

  async findByCategory(category: string): Promise<Module[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/module_catalog?category=eq.${category}`,
      );
      return (data || []).map((catalog) => ModuleMapper.toDomain(catalog));
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar módulos por categoria",
        error,
      );
    }
  }

  async activate(moduleId: number, clinicId: string): Promise<void> {
    try {
      await apiClient.patch(
        `/rest/v1/clinic_modules?module_catalog_id=eq.${moduleId}&clinic_id=eq.${clinicId}`,
        { is_active: true },
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Erro inesperado ao ativar módulo", error);
    }
  }

  async deactivate(moduleId: number, clinicId: string): Promise<void> {
    try {
      await apiClient.patch(
        `/rest/v1/clinic_modules?module_catalog_id=eq.${moduleId}&clinic_id=eq.${clinicId}`,
        { is_active: false },
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao desativar módulo",
        error,
      );
    }
  }

  async findDependencies(moduleKey: string): Promise<
    Array<{
      module_key: string;
      depends_on_module_key: string;
      depends_on_module_name: string;
    }>
  > {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/module_dependencies?select=module_id,depends_on_module_id,module_catalog!module_dependencies_module_id_fkey(module_key),dep_module:module_catalog!module_dependencies_depends_on_module_id_fkey(module_key,name)&module_catalog.module_key=eq.${moduleKey}`,
      );

      return (data || []).map((d) => ({
        module_key: moduleKey,
        depends_on_module_key: (d as any).dep_module?.module_key || "",
        depends_on_module_name: (d as any).dep_module?.name || "",
      }));
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Erro ao buscar dependências", error);
    }
  }

  async findDependentsActive(
    moduleKey: string,
    clinicId: string,
  ): Promise<Array<{ module_key: string; name: string }>> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/module_dependencies?select=module_catalog!module_dependencies_module_id_fkey(module_key,name),clinic_modules!inner(is_active)&dep_module.module_key=eq.${moduleKey}&clinic_modules.clinic_id=eq.${clinicId}&clinic_modules.is_active=eq.true`,
      );

      return (data || []).map((d) => ({
        module_key: (d as any).module_catalog?.module_key || "",
        name: (d as any).module_catalog?.name || "",
      }));
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Erro ao buscar dependentes ativos", error);
    }
  }
}
