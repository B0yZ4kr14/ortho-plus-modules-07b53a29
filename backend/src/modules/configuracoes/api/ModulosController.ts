/**
 * MÓDULO CONFIGURAÇÕES - Controller para Gestão de Módulos
 * Migração da Edge Function get-my-modules e toggle-module-state
 */

import { IDatabaseConnection } from "@/infrastructure/database/IDatabaseConnection";
import { EventBus } from "@/shared/events/EventBus";
import { NextFunction, Request, Response } from "express";

export class ModulosController {
  constructor(private db: IDatabaseConnection) {}

  /**
   * GET /api/configuracoes/modulos
   * Lista todos os módulos disponíveis e o estado de ativação para a clínica
   */
  getMyModules = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clinicId = (req.query.clinicId as string) || "DEFAULT_CLINIC";

      // 1. Buscar todos os módulos do catálogo
      const catalogResult = await this.db.query(
        `SELECT id, module_key, name, description, category, icon, ordem
         FROM configuracoes.modulo_catalog
         WHERE ativo = true
         ORDER BY ordem, name`,
      );

      // 2. Buscar módulos ativos da clínica
      const activeModulesResult = await this.db.query(
        `SELECT module_catalog_id, is_active
         FROM configuracoes.clinic_modules
         WHERE clinic_id = $1`,
        [clinicId],
      );

      const activeModulesMap = new Map(
        activeModulesResult.rows.map((row) => [
          row.module_catalog_id,
          row.is_active,
        ]),
      );

      // 3. Buscar dependências
      const dependenciesResult = await this.db.query(
        `SELECT module_id, depends_on_module_id
         FROM configuracoes.module_dependencies`,
      );

      const dependenciesMap = new Map<number, number[]>();
      dependenciesResult.rows.forEach((row) => {
        if (!dependenciesMap.has(row.module_id)) {
          dependenciesMap.set(row.module_id, []);
        }
        dependenciesMap.get(row.module_id)!.push(row.depends_on_module_id);
      });

      // 4. Montar resposta com informações de dependência
      const modules = catalogResult.rows.map((module) => {
        const isSubscribed = activeModulesMap.has(module.id);
        const isActive = activeModulesMap.get(module.id) || false;
        const dependencies = dependenciesMap.get(module.id) || [];

        return {
          id: module.id,
          module_key: module.module_key,
          name: module.name,
          description: module.description,
          category: module.category,
          icon: module.icon,
          subscribed: isSubscribed,
          is_active: isActive,
          dependencies,
        };
      });

      return res.json({
        success: true,
        data: modules,
        meta: {
          total: modules.length,
          clinic_id: clinicId,
        },
      });
    } catch (error: any) {
      console.error("Erro ao buscar módulos:", error);
      return next(error);
    }
  };

  /**
   * POST /api/configuracoes/modulos/:moduleKey/toggle
   * Ativa ou desativa um módulo para a clínica
   */
  toggleModuleState = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { moduleKey } = req.params;
      const clinicId = req.body.clinicId || "DEFAULT_CLINIC";

      // 1. Buscar módulo no catálogo
      const moduleResult = await this.db.query(
        `SELECT id, module_key, name FROM configuracoes.modulo_catalog WHERE module_key = $1`,
        [moduleKey],
      );

      if (moduleResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Módulo ${moduleKey} não encontrado`,
        });
      }

      const module = moduleResult.rows[0];

      // 2. Buscar estado atual
      const currentStateResult = await this.db.query(
        `SELECT is_active FROM configuracoes.clinic_modules
         WHERE clinic_id = $1 AND module_catalog_id = $2`,
        [clinicId, module.id],
      );

      if (currentStateResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Módulo ${moduleKey} não está subscrito para esta clínica`,
        });
      }

      const currentState = currentStateResult.rows[0].is_active;
      const newState = !currentState;

      // 3. Verificar dependências se estiver ATIVANDO
      if (newState) {
        const dependenciesResult = await this.db.query(
          `SELECT md.depends_on_module_id, mc.module_key, mc.name
           FROM configuracoes.module_dependencies md
           JOIN configuracoes.modulo_catalog mc ON mc.id = md.depends_on_module_id
           WHERE md.module_id = $1`,
          [module.id],
        );

        if (dependenciesResult.rows.length > 0) {
          // Verificar se todas as dependências estão ativas
          const requiredModuleIds = dependenciesResult.rows.map(
            (r) => r.depends_on_module_id,
          );
          const activeRequiredResult = await this.db.query(
            `SELECT module_catalog_id FROM configuracoes.clinic_modules
             WHERE clinic_id = $1 AND module_catalog_id = ANY($2) AND is_active = true`,
            [clinicId, requiredModuleIds],
          );

          const activeDependencies = new Set(
            activeRequiredResult.rows.map((r) => r.module_catalog_id),
          );
          const missingDependencies = dependenciesResult.rows.filter(
            (dep) => !activeDependencies.has(dep.depends_on_module_id),
          );

          if (missingDependencies.length > 0) {
            return res.status(412).json({
              success: false,
              error: `Falha ao ativar. Requer o(s) módulo(s): ${missingDependencies.map((d) => d.name).join(", ")}`,
              missing_dependencies: missingDependencies.map(
                (d) => d.module_key,
              ),
            });
          }
        }
      }

      // 4. Verificar dependências reversas se estiver DESATIVANDO
      if (!newState) {
        const reverseDependenciesResult = await this.db.query(
          `SELECT md.module_id, mc.module_key, mc.name
           FROM configuracoes.module_dependencies md
           JOIN configuracoes.modulo_catalog mc ON mc.id = md.module_id
           WHERE md.depends_on_module_id = $1`,
          [module.id],
        );

        if (reverseDependenciesResult.rows.length > 0) {
          const dependentModuleIds = reverseDependenciesResult.rows.map(
            (r) => r.module_id,
          );
          const activeDependentsResult = await this.db.query(
            `SELECT cm.module_catalog_id, mc.name, mc.module_key
             FROM configuracoes.clinic_modules cm
             JOIN configuracoes.modulo_catalog mc ON mc.id = cm.module_catalog_id
             WHERE cm.clinic_id = $1 AND cm.module_catalog_id = ANY($2) AND cm.is_active = true`,
            [clinicId, dependentModuleIds],
          );

          if (activeDependentsResult.rows.length > 0) {
            return res.status(412).json({
              success: false,
              error: `Falha ao desativar. O(s) módulo(s) ${activeDependentsResult.rows.map((d) => d.name).join(", ")} deve(m) ser desativado(s) primeiro.`,
              active_dependents: activeDependentsResult.rows.map(
                (d) => d.module_key,
              ),
            });
          }
        }
      }

      // 5. Atualizar estado
      await this.db.query(
        `UPDATE configuracoes.clinic_modules
         SET is_active = $1, updated_at = now()
         WHERE clinic_id = $2 AND module_catalog_id = $3`,
        [newState, clinicId, module.id],
      );

      // 6. Registrar em audit log
      await this.db.query(
        `INSERT INTO configuracoes.audit_logs (clinic_id, action, entity_type, entity_id, new_values)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          clinicId,
          newState ? "MODULE_ACTIVATED" : "MODULE_DEACTIVATED",
          "MODULE",
          module.id,
          JSON.stringify({ module_key: moduleKey, is_active: newState }),
        ],
      );

      // 7. Emitir evento de domínio
      EventBus.getInstance().publish({
        eventId: crypto.randomUUID(),
        aggregateType: "Modulos",
        eventType: newState
          ? "Configuracoes.ModuloAtivado"
          : "Configuracoes.ModuloDesativado",
        aggregateId: module.id.toString(),
        payload: {
          clinicId,
          moduleKey,
          moduleName: module.name,
          isActive: newState,
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });

      return res.json({
        success: true,
        data: {
          module_key: moduleKey,
          name: module.name,
          is_active: newState,
        },
        message: `Módulo ${module.name} ${newState ? "ativado" : "desativado"} com sucesso`,
      });
    } catch (error: any) {
      console.error("Erro ao alternar estado do módulo:", error);
      return next(error);
    }
  };

  /**
   * GET /api/configuracoes/modulos/stats
   * Estatísticas de módulos por clínica
   */
  getModuleStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clinicId = (req.query.clinicId as string) || "DEFAULT_CLINIC";

      const statsResult = await this.db.query(
        `SELECT
          COUNT(*) as total_modules,
          COUNT(*) FILTER (WHERE is_active = true) as active_modules,
          COUNT(*) FILTER (WHERE is_active = false) as inactive_modules
         FROM configuracoes.clinic_modules
         WHERE clinic_id = $1`,
        [clinicId],
      );

      return res.json({
        success: true,
        data: statsResult.rows[0],
      });
    } catch (error: any) {
      return next(error);
    }
  };
}
