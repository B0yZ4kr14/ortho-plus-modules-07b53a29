import { startBackupJobsCron } from "./jobs/backupJobs";
import { startCryptoJobsCron } from "./jobs/cryptoJobs";
import { startEstoqueJobsCron } from "./jobs/estoqueJobs";
import { startFinanceiroJobsCron } from "./jobs/financeiroJobs";
import { startGamificationJobs } from './jobs/gamificationJobs';
import { startAdminJobs } from './jobs/adminJobs';
import { startScheduleAppointmentsCron } from "./jobs/scheduleAppointments";
import { startScheduleBiExportCron } from "./jobs/scheduleBiExport";

export const startAllWorkers = () => {
  console.log("Starting all background workers (cron jobs)...");

  startScheduleAppointmentsCron();
  startScheduleBiExportCron();
  startBackupJobsCron();
  startEstoqueJobsCron();
  startCryptoJobsCron();
  startFinanceiroJobsCron();
  startGamificationJobs();
  startAdminJobs();

  console.log("Background workers started.");
};
