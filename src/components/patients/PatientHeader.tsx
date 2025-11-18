import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Mail, Calendar, MapPin, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { STATUS_LABELS, STATUS_COLORS, PatientStatus } from '@/types/patient-status';

interface PatientHeaderProps {
  patientId: string;
}

export function PatientHeader({ patientId }: PatientHeaderProps) {
  const navigate = useNavigate();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient-header', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  if (!patient) {
    return <div className="text-center text-muted-foreground">Paciente não encontrado</div>;
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const statusColor = STATUS_COLORS[patient.status as PatientStatus] || 'bg-muted';
  const statusLabel = STATUS_LABELS[patient.status as PatientStatus] || patient.status;

  return (
    <Card className="p-6">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-2xl">
            {getInitials(patient.full_name)}
          </AvatarFallback>
        </Avatar>

        {/* Info Principal */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{patient.full_name}</h1>
              {patient.social_name && (
                <p className="text-muted-foreground">Nome Social: {patient.social_name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className={statusColor}>
                {statusLabel}
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate(`/pacientes/editar/${patientId}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>

          {/* Dados de Contato */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {patient.phone_primary && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{patient.phone_primary}</span>
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{patient.email}</span>
              </div>
            )}
            {patient.birth_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(patient.birth_date), "dd/MM/yyyy", { locale: ptBR })}
                  {' '}
                  ({new Date().getFullYear() - new Date(patient.birth_date).getFullYear()} anos)
                </span>
              </div>
            )}
            {patient.address_city && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{patient.address_city}, {patient.address_state}</span>
              </div>
            )}
          </div>

          {/* Rastreamento Comercial (se existir) */}
          {(patient.marketing_campaign || patient.marketing_source) && (
            <div className="flex gap-2 text-xs text-muted-foreground">
              {patient.marketing_campaign && (
                <Badge variant="outline">Campanha: {patient.marketing_campaign}</Badge>
              )}
              {patient.marketing_source && (
                <Badge variant="outline">Origem: {patient.marketing_source}</Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
