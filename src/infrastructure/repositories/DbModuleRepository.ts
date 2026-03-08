import { Module } from "@/domain/entities/Module";
import { IModuleRepository } from "@/domain/repositories/IModuleRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors";
import { ModuleMapper } from "../mappers/ModuleMapper";
import type { Tables } from '@/types/database';

type ModuleCatalogRow = Tables<"module_catalog">;
interface ModuleDependencyRow { dep_module?: { module_key: string; name: string } }
interface ModuleDependentRow { module_catalog?: { module_key: string; name: string } }

export class DbModuleRepository implements IModuleRepository {
  async findById(id: number): Promise<Module | null> {
    try {
      const data = await apiClient.get<Tables<"module_catalog">>(
        `/configuracoes/modulos/${id}`,
      );
      if (!data) return null;
      return ModuleMapper.toDomain(data);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Erro inesperado ao buscar módulo", error);
    }
  }

  async findByKey(moduleKey: string): Promise<Module | null> {
    try {
      const data = await apiClient.get<Tables<"module_catalog">>(
        `/configuracoes/modulos/key/${moduleKey}`,
      );
      if (!data) return null;
      return ModuleMapper.toDomain(data);
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
      const data = await apiClient.get<Tables<"module_catalog">[]>(
        "/configuracoes/modulos",
      );
      return (data || []).map((row) =>
        ModuleMapper.toDomain(row),
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
      const data = await apiClient.get<Tables<"module_catalog">[]>(
        "/configuracoes/modulos",
        { params: { active: true } },
      );
      return (data || []).map((row: ModuleCatalogRow) =>
        ModuleMapper.toDomain(row),
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
      const data = await apiClient.get<Tables<"module_catalog">[]>(
        "/configuracoes/modulos",
        { params: { category } },
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
      await apiClient.post(
        `/configuracoes/modulos/${moduleId}/toggle`,
        { is_active: true, clinic_id: clinicId },
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Erro inesperado ao ativar módulo", error);
    }
  }

  async deactivate(moduleId: number, clinicId: string): Promise<void> {
    try {
      await apiClient.post(
        `/configuracoes/modulos/${moduleId}/toggle`,
        { is_active: false, clinic_id: clinicId },
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
      const data = await apiClient.get<Tables<"module_catalog">[]>(
        `/configuracoes/modulos/key/${moduleKey}/dependencies`,
      );

      return (data || []).map((d) => {
        const dep = (d as unknown as ModuleDependencyRow).dep_module;
        return {
          module_key: moduleKey,
          depends_on_module_key: dep?.module_key || "",
          depends_on_module_name: dep?.name || "",
        };
      });
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
      const data = await apiClient.get<Tables<"module_catalog">[]>(
        `/configuracoes/modulos/key/${moduleKey}/dependents`,
        { params: { clinic_id: clinicId } },
      );

      return (data || []).map((d) => {
        const cat = (d as unknown as ModuleDependentRow).module_catalog;
        return {
          module_key: cat?.module_key || "",
          name: cat?.name || "",
        };
      });
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Erro ao buscar dependentes ativos", error);
    }
  }
}
