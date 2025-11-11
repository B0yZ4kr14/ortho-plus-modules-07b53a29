import { Dentista } from '../types/dentista.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, User, Phone, MapPin, Briefcase, Calendar, Clock, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { diasSemana } from '../types/dentista.types';

interface DentistaDetailsProps {
  dentista: Dentista;
  onEdit: () => void;
  onClose: () => void;
}

export function DentistaDetails({ dentista, onEdit, onClose }: DentistaDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'default';
      case 'Inativo':
        return 'secondary';
      case 'Férias':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getDiasAtendimentoText = () => {
    return dentista.diasAtendimento
      .sort((a, b) => a - b)
      .map(dia => diasSemana.find(d => d.value === dia)?.label)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: dentista.corCalendario }}
            />
            <h2 className="text-2xl font-bold">{dentista.nome}</h2>
            <Badge variant={getStatusColor(dentista.status)}>{dentista.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Cadastrado em {format(parseISO(dentista.createdAt!), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">
            Fechar
          </Button>
        </div>
      </div>

      <Separator />

      {/* Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">CPF</p>
              <p className="font-medium">{dentista.cpf}</p>
            </div>
            {dentista.rg && (
              <div>
                <p className="text-sm text-muted-foreground">RG</p>
                <p className="font-medium">{dentista.rg}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Data de Nascimento</p>
              <p className="font-medium">
                {format(new Date(dentista.dataNascimento), 'dd/MM/yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sexo</p>
              <p className="font-medium">
                {dentista.sexo === 'M' ? 'Masculino' : dentista.sexo === 'F' ? 'Feminino' : 'Outro'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-5 w-5" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{dentista.telefone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Celular</p>
              <p className="font-medium">{dentista.celular}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">{dentista.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {dentista.endereco.logradouro}, {dentista.endereco.numero}
              {dentista.endereco.complemento && ` - ${dentista.endereco.complemento}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {dentista.endereco.bairro} - {dentista.endereco.cidade}/{dentista.endereco.estado}
            </p>
            <p className="text-sm text-muted-foreground">CEP: {dentista.endereco.cep}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-5 w-5" />
              Informações Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">CRO</p>
              <p className="font-medium">{dentista.cro}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Especialidades</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {dentista.especialidades.map((esp) => (
                  <Badge key={esp} variant="secondary">
                    {esp}
                  </Badge>
                ))}
              </div>
            </div>
            {dentista.valorConsulta && (
              <div>
                <p className="text-sm text-muted-foreground">Valor da Consulta</p>
                <p className="font-medium">
                  R$ {dentista.valorConsulta.toFixed(2).replace('.', ',')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5" />
              Horários de Atendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Dias de Atendimento</p>
              <p className="font-medium">{getDiasAtendimentoText()}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Horário</p>
                <p className="font-medium">
                  {dentista.horariosAtendimento.inicio} às {dentista.horariosAtendimento.fim}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Cor no calendário:</p>
                <div
                  className="w-6 h-6 rounded border-2 border-border"
                  style={{ backgroundColor: dentista.corCalendario }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      {dentista.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{dentista.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID:</span>
            <span className="font-medium">{dentista.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cadastrado em:</span>
            <span className="font-medium">
              {format(parseISO(dentista.createdAt!), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Última atualização:</span>
            <span className="font-medium">
              {format(parseISO(dentista.updatedAt!), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
