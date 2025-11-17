/**
 * Module Data Adapter
 * Converte entre formato API e Frontend para módulos do sistema
 */

interface ModuleAPI {
  id: number;
  module_key: string;
  name: string;
  description?: string;
  category: string;
  is_active: boolean;
  dependencies?: string[];
}

interface ModuleFrontend {
  id: number;
  moduleKey: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  dependencies?: string[];
  canActivate?: boolean;
  canDeactivate?: boolean;
  unmetDependencies?: string[];
}

export class ModuleAdapter {
  static toFrontend(apiModule: ModuleAPI & { can_activate?: boolean; can_deactivate?: boolean; unmet_dependencies?: string[] }): ModuleFrontend {
    return {
      id: apiModule.id,
      moduleKey: apiModule.module_key,
      name: apiModule.name,
      description: apiModule.description,
      category: apiModule.category,
      isActive: apiModule.is_active,
      dependencies: apiModule.dependencies,
      canActivate: apiModule.can_activate,
      canDeactivate: apiModule.can_deactivate,
      unmetDependencies: apiModule.unmet_dependencies,
    };
  }

  static toAPI(frontendModule: Partial<ModuleFrontend>): Partial<ModuleAPI> {
    return {
      module_key: frontendModule.moduleKey,
      name: frontendModule.name,
      description: frontendModule.description,
      category: frontendModule.category,
      is_active: frontendModule.isActive,
      dependencies: frontendModule.dependencies,
    };
  }

  static toFrontendList(apiModules: ModuleAPI[]): ModuleFrontend[] {
    return apiModules.map(module => this.toFrontend(module));
  }
}
