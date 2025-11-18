import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, CalendarPlus, ShoppingCart, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="icon" data-testid="quick-actions-btn">
          <Plus className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => navigate('/pacientes/novo')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Paciente
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/agenda?action=new')}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Agendar Consulta
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/pdv')}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Nova Venda (PDV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/orcamentos/novo')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Novo Orçamento
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
