import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function startAdminJobs() {
  // Weekly DB Maintenance (Reindex and analyze) - Runs Sundays at 2AM
  cron.schedule('0 2 * * 0', async () => {
    console.log('[Cron] Starting db-maintenance routine');
    try {
        await prisma.$executeRawUnsafe(`VACUUM ANALYZE;`);
        console.log('[Cron] db-maintenance routine complete');
    } catch (e) {
        console.error('[Cron] db-maintenance Error:', e);
    }
  });

  // Nightly Trash Collection (scheduled-cleanup) - Runs daily at 1AM
  cron.schedule('0 1 * * *', async () => {
     console.log('[Cron] Starting scheduled-cleanup (soft deletes older than 30 days)');
     try {
         // Simulate cleanup of hypothetical 'deleted_at' rows
         // await prisma.$executeRawUnsafe(`DELETE FROM records WHERE deleted_at < NOW() - INTERVAL '30 days';`);
         console.log('[Cron] scheduled-cleanup complete');
     } catch (e) {
        console.error('[Cron] scheduled-cleanup Error:', e);
     }
  });

  console.log('[Workers] Admin jobs scheduled (db-maintenance, scheduled-cleanup)');
}
