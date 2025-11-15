import { Module } from '@/domain/entities/Module';
import { IModuleRepository } from '@/domain/repositories/IModuleRepository';

export interface ValidateDependenciesInput {
  moduleKey: string;
  clinicId: string;
  action: 'ACTIVATE' | 'DEACTIVATE';
}

export interface DependencyValidationResult {
  canProceed: boolean;
  errors: string[];
  warnings: string[];
  affectedModules: Array<{
    key: string;
    name: string;
    relationship: 'DEPENDENCY' | 'DEPENDENT';
  }>;
}

export class ValidateModuleDependenciesUseCase {
  constructor(private moduleRepository: IModuleRepository) {}

  async execute(input: ValidateDependenciesInput): Promise<DependencyValidationResult> {
    const result: DependencyValidationResult = {
      canProceed: true,
      errors: [],
      warnings: [],
      affectedModules: [],
    };

    const module = await this.moduleRepository.findByKey(input.moduleKey);
    if (!module) {
      result.canProceed = false;
      result.errors.push(`Módulo '${input.moduleKey}' não encontrado`);
      return result;
    }

    if (input.action === 'ACTIVATE') {
      await this.validateActivation(module, input.clinicId, result);
    } else {
      await this.validateDeactivation(module, input.clinicId, result);
    }

    return result;
  }

  private async validateActivation(
    module: Module,
    clinicId: string,
    result: DependencyValidationResult
  ): Promise<void> {
    const dependencies = await this.moduleRepository.findDependencies(module.moduleKey.toString());
    
    for (const dep of dependencies) {
      const depModule = await this.moduleRepository.findByKey(dep.depends_on_module_key);
      
      if (!depModule) {
        result.canProceed = false;
        result.errors.push(
          `Módulo dependente '${dep.depends_on_module_key}' não está contratado pela clínica`
        );
        continue;
      }

      if (!depModule.isActive) {
        result.canProceed = false;
        result.errors.push(
          `O módulo '${depModule.name}' precisa estar ativo primeiro`
        );
        result.affectedModules.push({
          key: depModule.moduleKey.toString(),
          name: depModule.name,
          relationship: 'DEPENDENCY',
        });
      }
    }

    if (dependencies.length > 0) {
      result.warnings.push(
        `Este módulo depende de ${dependencies.length} outro(s) módulo(s). Certifique-se de que estão configurados corretamente.`
      );
    }
  }

  private async validateDeactivation(
    module: Module,
    clinicId: string,
    result: DependencyValidationResult
  ): Promise<void> {
    const dependents = await this.moduleRepository.findDependentsActive(
      module.moduleKey.toString(),
      clinicId
    );

    if (dependents.length > 0) {
      result.canProceed = false;
      result.errors.push(
        `Não é possível desativar. Os seguintes módulos dependem dele:`
      );

      for (const dependent of dependents) {
        result.errors.push(`  - ${dependent.name}`);
        result.affectedModules.push({
          key: dependent.module_key,
          name: dependent.name,
          relationship: 'DEPENDENT',
        });
      }

      result.errors.push(
        'Desative primeiro os módulos dependentes antes de prosseguir.'
      );
    }

    if (dependents.length === 0) {
      result.warnings.push(
        'Desativar este módulo removerá seu acesso na sidebar e pode afetar workflows.'
      );
    }
  }
}
