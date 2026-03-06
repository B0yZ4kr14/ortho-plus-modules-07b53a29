import axios from "axios";
import cron from "node-cron";

// Helper for local API calls mapping back to our Express `estoqueController`
const triggerEstoqueAction = async (action: string) => {
  try {
    await axios.post("http://localhost:3005/api/estoque/automation", {
      action,
    });
    console.log(`[node-cron] Scheduled action executed: ${action}`);
  } catch (error: any) {
    console.error(
      `[node-cron] Error executing scheduled action: ${action}`,
      error.message,
    );
  }
};

export const startEstoqueJobsCron = () => {
  // Daily at 02:00 AM - Check required restocks
  cron.schedule("0 2 * * *", () => {
    triggerEstoqueAction("prever-reposicao");
  });

  // Daily at 02:30 AM - Generate orders
  cron.schedule("30 2 * * *", () => {
    triggerEstoqueAction("gerar-pedidos-automaticos");
  });

  // Daily at 03:00 AM - Send stock alerts
  cron.schedule("0 3 * * *", () => {
    triggerEstoqueAction("send-stock-alerts");
  });

  // Daily at 04:00 AM - Process retries
  cron.schedule("0 4 * * *", () => {
    triggerEstoqueAction("processar-retry-pedidos");
  });

  // Daily at 05:00 AM - Process scheduled inventory audits
  cron.schedule("0 5 * * *", () => {
    triggerEstoqueAction("processar-inventarios-agendados");
  });

  console.log("Background workers initialized (Estoque module).");
};
