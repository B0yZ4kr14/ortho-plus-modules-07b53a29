import axios from "axios";
import cron from "node-cron";

// Helper mapping for crypto endpoints executing background checks
const triggerCryptoJob = async (jobName: string) => {
  try {
    await axios.post("http://localhost:3005/api/crypto/jobs/execute", {
      jobName,
    });
    console.log(`[node-cron] Scheduled crypto job executed: ${jobName}`);
  } catch (error: any) {
    console.error(
      `[node-cron] Error executing scheduled crypto job: ${jobName}`,
      error.message,
    );
  }
};

export const startCryptoJobsCron = () => {
  // Run every 10 minutes checking the volatility alerts limit
  cron.schedule("*/10 * * * *", () => {
    triggerCryptoJob("check-volatility-alerts");
  });

  // Daily alert summary or specific triggers over the hours
  cron.schedule("15 * * * *", () => {
    triggerCryptoJob("send-crypto-price-alerts");
  });

  // Re-occurring real-time checks
  cron.schedule("*/5 * * * *", () => {
    triggerCryptoJob("crypto-realtime-notifications");
  });

  console.log("Background workers initialized (Crypto module).");
};
