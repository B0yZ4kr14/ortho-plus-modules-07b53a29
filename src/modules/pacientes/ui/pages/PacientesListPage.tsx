import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/modules/pacientes/hooks/usePatientsUnified';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, UserCircle, Phone, Calendar, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RiskScoreBadge } from '@/components/patients/RiskScoreBadge';
import { TableFilter } from '@/components/shared/TableFilter';
import type { Patient } from '@/types/patient';

export default function PacientesListPage() {
  const { clinicId } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Use unified hook (switches between Supabase and REST API)
  const { patients, loading: isLoading } = usePatients();

  const filteredPatients = patients?.filter(patient => {
    const matchesSearch = !searchTerm || 
      patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.cpf?.includes(searchTerm) ||
      patient.phone_primary?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

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

      {/* Filters */}
      <TableFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nome, CPF ou telefone..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'Todos', value: 'all' },
              { label: 'Ativos', value: 'ativo' },
              { label: 'Inativos', value: 'inativo' },
              { label: 'Arquivados', value: 'arquivado' },
            ],
            onChange: setStatusFilter,
          },
        ]}
        onClear={() => {
          setSearchTerm('');
          setStatusFilter('all');
        }}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <UserCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{filteredPatients?.length || 0}</p>
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
                {filteredPatients?.filter(p => p.status === 'ativo')?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alto Risco</p>
              <p className="text-2xl font-bold">
                {filteredPatients?.filter(p => p.risk_level === 'alto' || p.risk_level === 'critico')?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consultas Hoje</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Patient List */}
      <Card>
        <div className="divide-y">
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum paciente encontrado
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => navigate(`/pacientes/${patient.id}`)}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{patient.full_name}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        {patient.phone_primary && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone_primary}
                          </span>
                        )}
                        {patient.cpf && <span>CPF: {patient.cpf}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskScoreBadge
                      riskLevel={patient.risk_level}
                      overallScore={patient.risk_score_overall}
                    />
                    <Badge className={getStatusColor(patient.status || 'ativo')}>
                      {patient.status || 'ativo'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
