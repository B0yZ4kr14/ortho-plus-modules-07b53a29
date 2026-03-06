import axios from "axios";
import cron from "node-cron";

const triggerFinanceiroJob = async (jobName: string) => {
  try {
    await axios.post("http://localhost:3005/api/financeiro/jobs/execute", {
      jobName,
    });
    console.log(`[node-cron] Financeiro job executed: ${jobName}`);
  } catch (error: any) {
    console.error(
      `[node-cron] Error executing financeiro job: ${jobName}`,
      error.message,
    );
  }
};

export const startFinanceiroJobsCron = () => {
  // Daily at 01:00 AM - Sync statements
  cron.schedule("0 1 * * *", () => {
    triggerFinanceiroJob("sincronizar-extratos-all");
  });

  // Intraday intelligent sweeps (Mocked placeholder timing depending on business open hours)
  cron.schedule("0 18 * * *", () => {
    triggerFinanceiroJob("sugerir-sangrias-all");
  });

  console.log("Background workers initialized (Financeiro module).");
};
