import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireStaff?: boolean;
  requirePatient?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireStaff = false,
  requirePatient = false 
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isMember, isPatient } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-destructive">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Esta página é restrita a administradores.
          </p>
        </div>
      </div>
    );
  }

  if (requireStaff && isPatient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-destructive">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Esta página é restrita à equipe da clínica.
          </p>
        </div>
      </div>
    );
  }

  if (requirePatient && !isPatient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-destructive">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Esta página é restrita a pacientes.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}