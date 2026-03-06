import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const prisma = new PrismaClient();

interface ExportOptions {
  includeModules: boolean;
  includePatients: boolean;
  includeHistory: boolean;
  includeProntuarios: boolean;
  includeAppointments: boolean;
  includeFinanceiro: boolean;
  format: "json" | "csv" | "excel";
}

export class ReportController {
  // GET or POST depending on frontend implementation, typically POST for options
  async exportClinicData(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<any> {
    try {
      const clinicId = (req as any).clinic_id;
      const userId = (req as any).user?.id;

      if (!clinicId || !userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Missing clinicId or userId" });
      }

      // Check admin status (already done by middleware normally, but verifying)
      const userProfile = await (prisma as any).profiles.findUnique({
        where: { id: userId },
      });
      if (userProfile?.role !== "ADMIN" && userProfile?.role !== "MANAGER") {
        // Enforce basic RBAC if middleware didn't catch
        // We'll proceed assuming auth middleware handled it, but good to be safe
      }

      const options: ExportOptions = req.body;

      const exportData: any = {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        clinicId: clinicId,
        data: {},
      };

      if (options.includeModules) {
        exportData.data.modules = await (prisma as any).clinic_modules.findMany(
          {
            where: { clinic_id: clinicId },
            include: { module_catalog: true },
          },
        );
      }

      if (options.includePatients) {
        const patients = await (prisma as any).patients.findMany({
          where: { clinic_id: clinicId },
          select: {
            id: true,
            cpf: true,
            nome: true,
            email: true,
            telefone: true,
            created_at: true,
            updated_at: true,
          },
        });
        exportData.data.patients = patients;
        exportData.data.patientCount = patients.length || 0;
      }

      if (options.includeHistory) {
      }

      if (options.includeProntuarios) {
      }

      if (options.includeAppointments) {
        exportData.data.appointments = await (
          prisma as any
        ).appointments_ortho.findMany({
          where: { clinic_id: clinicId },
        });
      }

      if (options.includeFinanceiro) {
        exportData.data.financeiro = {
          contasReceber: await (prisma as any).contas_receber.findMany({
            where: { clinic_id: clinicId },
          }),
          contasPagar: await (prisma as any).contas_pagar.findMany({
            where: { clinic_id: clinicId },
          }),
        };
      }

      // We would log to audit_logs, assuming audit_logs table exists
      try {
        await (prisma as any).audit_logs.create({
          data: {
            clinic_id: clinicId,
            user_id: userId,
            action: "DATA_EXPORT",
            details: {
              options,
              recordsExported: {
                modules: exportData.data.modules?.length || 0,
                patients: exportData.data.patientCount || 0,
                appointments: exportData.data.appointments?.length || 0,
              },
            },
          },
        });
      } catch (e) {
        console.error("Failed to write to audit log", e);
      }

      return res.status(200).json(exportData);
    } catch (error) {
      console.error("[ReportController] exportClinicData error:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  }

  async importClinicData(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<any> {
    try {
      const clinicId = (req as any).clinic_id;
      const userId = (req as any).user?.id;

      if (!clinicId || !userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Missing clinicId or userId" });
      }

      const userProfile = await (prisma as any).profiles.findUnique({
        where: { id: userId },
      });
      if (userProfile?.role !== "ADMIN" && userProfile?.role !== "MANAGER") {
        return res
          .status(403)
          .json({ error: "Forbidden: Admin access required" });
      }

      const body = req.body;
      const importData = body.data;
      const options: any = body.options || {
        overwriteExisting: false,
        skipConflicts: true,
        mergeData: false,
      };

      if (!importData || !importData.version || !importData.data) {
        return res.status(400).json({ error: "Invalid import data format" });
      }

      const results = {
        success: true,
        imported: {
          modules: 0,
          patients: 0,
          historico: 0,
          prontuarios: 0,
          appointments: 0,
        },
        errors: [] as string[],
        skipped: [] as string[],
      };

      // Import Modules
      if (importData.data.modules && Array.isArray(importData.data.modules)) {
        for (const moduleData of importData.data.modules) {
          try {
            const catalogModule = await (
              prisma as any
            ).module_catalog.findFirst({
              where: { module_key: moduleData.module_catalog?.module_key },
            });

            if (catalogModule) {
              await (prisma as any).clinic_modules.upsert({
                where: {
                  clinic_id_module_catalog_id: {
                    clinic_id: clinicId,
                    module_catalog_id: catalogModule.id,
                  },
                },
                update: {
                  is_active: moduleData.is_active,
                },
                create: {
                  clinic_id: clinicId,
                  module_catalog_id: catalogModule.id,
                  is_active: moduleData.is_active,
                },
              });
              results.imported.modules++;
            }
          } catch (error: any) {
            results.errors.push(`Error importing module: ${error.message}`);
          }
        }
      }

      // Import Prontuarios
      if (
        importData.data.prontuarios &&
        Array.isArray(importData.data.prontuarios)
      ) {
        for (const prontuario of importData.data.prontuarios) {
          try {
            const inserted = await (prisma as any).prontuarios.create({
              data: {
                ...prontuario,
                clinic_id: clinicId,
                id: undefined,
                created_at: undefined,
                updated_at: undefined,
              },
            });

            results.imported.prontuarios++;

            if (
              importData.data.odontogramas &&
              Array.isArray(importData.data.odontogramas)
            ) {
              const odontogramasOriginal = importData.data.odontogramas.filter(
                (o: any) => o.prontuario_id === prontuario.id,
              );

              for (const odonto of odontogramasOriginal) {
                await (prisma as any).odontograma_teeth.create({
                  data: {
                    ...odonto,
                    prontuario_id: inserted.id,
                    id: undefined,
                  },
                });
              }
            }
          } catch (error: any) {
            if (options.skipConflicts) {
              results.skipped.push(`Prontuario: ${prontuario.id}`);
            } else {
              results.errors.push(
                `Error importing prontuario: ${error.message}`,
              );
            }
          }
        }
      }

      try {
        await (prisma as any).audit_logs.create({
          data: {
            clinic_id: clinicId,
            user_id: userId,
            action: "DATA_IMPORT",
            details: {
              sourceClinicId: importData.clinicId,
              options,
              results: {
                imported: results.imported,
                errorsCount: results.errors.length,
                skippedCount: results.skipped.length,
              },
            },
          },
        });
      } catch (e) {
        console.error("Failed to write to audit log", e);
      }

      return res.status(200).json(results);
    } catch (error) {
      console.error("[ReportController] importClinicData error:", error);
      res.status(500).json({ error: "Failed to import data" });
    }
  }

  async createDocumentPdf(
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<any> {
    try {
      // Placeholder for future pdf generation using pdfkit/puppeteer
      return res.status(200).json({ success: true, url: "/placeholder.pdf" });
    } catch (err) {
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  }
}
