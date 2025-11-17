import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: any[];
  filename: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export function ExportButton({ data, filename, variant = 'outline', size = 'default' }: ExportButtonProps) {
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    
    toast.success('Arquivo CSV exportado com sucesso!');
  };

  const exportToJSON = () => {
    if (!data || data.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
    
    toast.success('Arquivo JSON exportado com sucesso!');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
