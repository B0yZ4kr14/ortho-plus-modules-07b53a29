import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();

export function startGamificationJobs() {
  // Executar diariamente às 23:30 para processamento noturno de metas de gamificação
  cron.schedule("30 23 * * *", async () => {
    console.log("[Cron] Starting processar-metas-gamificacao job");
    await runGamificationMetricsJob();
  });
  console.log("[Workers] Gamification jobs scheduled");
}

export async function runGamificationMetricsJob() {
  try {
    console.log("[Gamificação] Iniciando processamento de metas e rankings");

    // Buscar todas as clínicas ativas
    const clinics = await prisma.clinics.findMany({
      select: { id: true },
    });

    for (const clinic of clinics) {
      console.log(`[Gamificação] Processando clínica: ${clinic.id}`);

      // Calls the logic from the controller to process goals
      // Note: A real implementation would either directly do the math here
      // or call a shared service. Since we have a specific endpoint or controller method
      // we can do the raw query processing here to emulate the edge function.

      const metas = await prisma.$queryRawUnsafe<any[]>(
        `
        SELECT * FROM gamification_goals
        WHERE clinic_id = $1 AND status = 'ACTIVE' AND deadline >= NOW()
        `,
        clinic.id,
      );

      for (const meta of metas) {
        // Placeholder logic corresponding to the legacy edge function
        let progress = 0;
        let isCompleted = false;

        if (meta.type === "CONSULTAS_MES") {
          const startMonth = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
          );
          const count = await (prisma as any).appointments.count({
            where: {
              dentistId: meta.user_id, // assuming user_id maps to dentistId
              status: "CONCLUIDA",
              startTime: { gte: startMonth },
            },
          });
          progress = (count / meta.target_value) * 100;
          isCompleted = count >= meta.target_value;
        }

        await prisma.$queryRawUnsafe(
          `
            UPDATE gamification_goals SET current_value = $1, status = $2, completed_at = $3 WHERE id = $4
            `,
          Math.round(progress),
          isCompleted ? "COMPLETED" : "ACTIVE",
          isCompleted ? new Date() : null,
          meta.id,
        );
      }
    }

    console.log("[Gamificação] Finalizado com sucesso");
  } catch (error) {
    console.error("[Gamificação] Erro no job:", error);
  }
}
