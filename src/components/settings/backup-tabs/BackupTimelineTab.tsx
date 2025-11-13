import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Eye, Clock, Database } from 'lucide-react';
import { BackupRestoreDialog } from '../BackupRestoreDialog';

export function BackupTimelineTab() {
  const { clinicId } = useAuth();
  const [selectedBackup, setSelectedBackup] = useState<any>(null);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  const { data: backups } = useQuery({
    queryKey: ['backup-timeline', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backup_history')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!clinicId
  });

  const groupedBackups = backups?.reduce((acc, backup) => {
    const date = new Date(backup.created_at).toLocaleDateString('pt-BR');
    if (!acc[date]) acc[date] = [];
    acc[date].push(backup);
    return acc;
  }, {} as Record<string, any[]>);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getBackupTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'full': 'bg-primary',
      'incremental': 'bg-info',
      'differential': 'bg-warning'
    };
    return colors[type] || 'bg-muted';
  };

  const handleRestoreClick = (backup: any) => {
    setSelectedBackup(backup);
    setIsRestoreDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {Object.entries(groupedBackups || {}).map(([date, dateBackups]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground">{date}</h3>
              </div>
              <div className="space-y-3 pl-6 border-l-2 border-border">
                {dateBackups.map((backup) => (
                  <Card key={backup.id} className="p-4 ml-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${getBackupTypeColor(backup.backup_type)}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {new Date(backup.created_at).toLocaleTimeString('pt-BR')}
                            </span>
                            <Badge variant="outline">{backup.backup_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatBytes(backup.file_size_bytes || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRestoreClick(backup)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <BackupRestoreDialog
        open={isRestoreDialogOpen}
        onClose={() => {
          setIsRestoreDialogOpen(false);
          setSelectedBackup(null);
        }}
      />
    </div>
  );
}
