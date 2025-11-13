import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

interface IdentificacaoTabProps {
  patient: any;
}

export function IdentificacaoTab({ patient }: IdentificacaoTabProps) {
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
            <p className="text-lg font-semibold">{patient.full_name}</p>
          </div>
          {patient.social_name && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome Social</label>
              <p className="text-lg">{patient.social_name}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground">CPF</label>
            <p className="text-lg font-mono">{patient.cpf || 'Não informado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">RG</label>
            <p className="text-lg font-mono">{patient.rg || 'Não informado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
            <p className="text-lg">
              {new Date(patient.birth_date).toLocaleDateString('pt-BR')} 
              <span className="text-sm text-muted-foreground ml-2">
                ({calculateAge(patient.birth_date)} anos)
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Gênero</label>
            <p className="text-lg capitalize">{patient.gender?.replace('_', ' ') || 'Não informado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Estado Civil</label>
            <p className="text-lg capitalize">{patient.marital_status?.replace('_', ' ') || 'Não informado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nacionalidade</label>
            <p className="text-lg">{patient.nationality}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contatos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contatos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-lg flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {patient.email || 'Não informado'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Telefone Principal</label>
            <p className="text-lg flex items-center gap-2 font-mono">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {patient.phone_primary}
            </p>
          </div>
          {patient.phone_secondary && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Telefone Secundário</label>
              <p className="text-lg font-mono">{patient.phone_secondary}</p>
            </div>
          )}
          {patient.phone_emergency && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Telefone de Emergência</label>
              <p className="text-lg font-mono">{patient.phone_emergency}</p>
            </div>
          )}
          {patient.emergency_contact_name && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contato de Emergência</label>
              <p className="text-lg">{patient.emergency_contact_name}</p>
              {patient.emergency_contact_relationship && (
                <p className="text-sm text-muted-foreground">
                  ({patient.emergency_contact_relationship})
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Logradouro</label>
            <p className="text-lg">
              {patient.address_street || 'Não informado'}, {patient.address_number || 'S/N'}
            </p>
            {patient.address_complement && (
              <p className="text-sm text-muted-foreground">{patient.address_complement}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Bairro</label>
            <p className="text-lg">{patient.address_neighborhood || 'Não informado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">CEP</label>
            <p className="text-lg font-mono">{patient.address_zipcode || 'Não informado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Cidade</label>
            <p className="text-lg">{patient.address_city || 'Não informado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Estado</label>
            <p className="text-lg">{patient.address_state || 'Não informado'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Informações Profissionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Informações Profissionais
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Profissão</label>
            <p className="text-lg">{patient.occupation || 'Não informado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Escolaridade</label>
            <p className="text-lg capitalize">{patient.education_level?.replace('_', ' ') || 'Não informado'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
