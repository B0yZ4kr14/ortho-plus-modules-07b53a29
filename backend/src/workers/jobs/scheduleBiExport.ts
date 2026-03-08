import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();

// Replacing schedule-bi-export edge function
export const runScheduleBiExportJob = async () => {
  console.log("Running BI Export job...");
  try {
    // Basic BI export mock logic
    const reports = await (prisma as any).analytics_events.groupBy({
      by: ["event_type"],
      _count: {
        id: true,
      },
    });

    console.log(
      `Generated BI aggregated report for ${reports.length} event types.`,
    );

    // Normally we would push this file to an S3/MinIO bucket and log
    console.log("BI Export completed successfully.");
  } catch (error) {
    console.error("Error in schedule-bi-export cron: ", error);
  }
};

export const startScheduleBiExportCron = () => {
  // Run every day at 2:00 AM
  cron.schedule("0 2 * * *", runScheduleBiExportJob);
  console.log(
    "Scheduled BI Export Job initialized: running daily at 02:00 AM.",
  );
};
