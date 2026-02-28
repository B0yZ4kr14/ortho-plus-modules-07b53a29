import { PageHeader } from '@/components/shared/PageHeader';
import { BackupControlCenter } from '@/components/settings/backup/BackupControlCenter';
import { HardDrive } from 'lucide-react';

export default function BackupExecutivePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={HardDrive}
        title="Centro de Controle de Backups"
        description="Gestão profissional de backups com wizards intuitivos"
      />
      <BackupControlCenter />
    </div>
  );
}
