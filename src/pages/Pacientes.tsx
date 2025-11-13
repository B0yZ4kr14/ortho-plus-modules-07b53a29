import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, UserCircle, Phone, Calendar, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RiskScoreBadge } from '@/components/patients/RiskScoreBadge';

export default function Pacientes() {
  const { clinicId } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', clinicId, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%,phone_primary.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-success/10 text-success';
      case 'inativo': return 'bg-warning/10 text-warning';
      case 'arquivado': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground mt-1">
            Gestão completa de pacientes com ficha clínica profissional
          </p>
        </div>
        <Button onClick={() => navigate('/pacientes/novo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <UserCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{patients?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <UserCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ativos</p>
              <p className="text-2xl font-bold">
                {patients?.filter(p => p.status === 'ativo').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alto Risco</p>
              <p className="text-2xl font-bold">
                {patients?.filter(p => p.risk_level === 'alto' || p.risk_level === 'critico').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Calendar className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Este Mês</p>
              <p className="text-2xl font-bold">
                {patients?.filter(p => {
                  const created = new Date(p.created_at);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Patient List */}
      <div className="grid gap-4">
        {patients?.map((patient) => (
          <Card
            key={patient.id}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/pacientes/${patient.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4 flex-1">
                <div className="p-3 rounded-xl bg-primary/10">
                  <UserCircle className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{patient.full_name}</h3>
                    {patient.patient_code && (
                      <Badge variant="outline">{patient.patient_code}</Badge>
                    )}
                    <Badge className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                    <RiskScoreBadge
                      riskLevel={patient.risk_level}
                      overallScore={patient.risk_score_overall}
                    />
                  </div>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    {patient.cpf && (
                      <span>CPF: {patient.cpf}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {patient.phone_primary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                    </span>
                    {patient.last_appointment_date && (
                      <span>
                        Última consulta: {new Date(patient.last_appointment_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  {patient.main_complaint && (
                    <p className="text-sm text-muted-foreground italic">
                      "{patient.main_complaint}"
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {patient.total_appointments} consultas
                </p>
              </div>
            </div>
          </Card>
        ))}

        {patients?.length === 0 && (
          <Card className="p-12 text-center">
            <UserCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum paciente encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? 'Tente ajustar os filtros de busca'
                : 'Comece cadastrando o primeiro paciente da clínica'}
            </p>
            <Button onClick={() => navigate('/pacientes/novo')}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Paciente
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
