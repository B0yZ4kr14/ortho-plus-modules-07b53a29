import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Download, Trash2 } from 'lucide-react';

export function BackupHistoryTab() {
  const backups = [
    { id: '1', date: '15/11/2025 18:30', type: 'Full', size: '2.3 GB', status: 'success' },
    { id: '2', date: '15/11/2025 12:00', type: 'Incremental', size: '156 MB', status: 'success' },
    { id: '3', date: '14/11/2025 18:30', type: 'Full', size: '2.2 GB', status: 'success' },
    { id: '4', date: '14/11/2025 12:00', type: 'Incremental', size: '134 MB', status: 'failed' },
    { id: '5', date: '13/11/2025 18:30', type: 'Full', size: '2.1 GB', status: 'success' },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {backups.map((backup) => (
            <div
              key={backup.id}
              className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                {backup.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium">{backup.date}</p>
                  <p className="text-sm text-muted-foreground">
                    {backup.type} • {backup.size}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
