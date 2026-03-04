import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-6 max-w-md">
        <ShieldAlert className="h-24 w-24 mx-auto text-destructive" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">403</h1>
          <h2 className="text-2xl font-semibold">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar este módulo. Entre em contato com o administrador da clínica.
          </p>
        </div>
        <Button onClick={() => navigate('/')} className="mt-6">
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
}
