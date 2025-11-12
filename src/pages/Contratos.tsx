import { useState } from 'react';
import { Plus, FileText, FileSignature, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContratosSupabase } from '@/modules/contratos/hooks/useContratosSupabase';
import { statusContratoLabels } from '@/modules/contratos/types/contrato.types';
import type { ContratoComplete, ContratoTemplate } from '@/modules/contratos/types/contrato.types';

export default function Contratos() {
  const { contratos, templates, loading, signContrato, cancelContrato } = useContratosSupabase();
  const [selectedContrato, setSelectedContrato] = useState<ContratoComplete | null>(null);

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      AGUARDANDO_ASSINATURA: 'default',
      ASSINADO: 'success',
      CANCELADO: 'destructive',
      EXPIRADO: 'destructive',
      CONCLUIDO: 'secondary',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando contratos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={FileSignature}
          title="Contratos Digitais"
          description="Gestão completa de contratos com assinatura digital"
        />
        <Button variant="elevated">
          <Plus className="h-4 w-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total de Contratos</div>
          <div className="text-3xl font-bold mt-2">{contratos.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Aguardando Assinatura</div>
          <div className="text-3xl font-bold mt-2 text-warning">
            {contratos.filter(c => c.status === 'AGUARDANDO_ASSINATURA').length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Assinados</div>
          <div className="text-3xl font-bold mt-2 text-success">
            {contratos.filter(c => c.status === 'ASSINADO').length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Templates Ativos</div>
          <div className="text-3xl font-bold mt-2">{templates.length}</div>
        </Card>
      </div>

      <Tabs defaultValue="contratos" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="contratos">
          <Card className="p-6">
            <div className="space-y-4">
              {contratos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileSignature className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum contrato encontrado</p>
                  <p className="text-sm mt-2">Crie seu primeiro contrato para começar</p>
                </div>
              ) : (
                contratos.map((contrato) => (
                  <div
                    key={contrato.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedContrato(contrato)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{contrato.titulo}</h3>
                        <Badge variant={getStatusVariant(contrato.status)}>
                          {statusContratoLabels[contrato.status]}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Número: {contrato.numero_contrato}</p>
                        <p>Paciente: {contrato.patient_name || 'N/A'}</p>
                        <p>Data Início: {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold">
                        R$ {contrato.valor_contrato.toFixed(2)}
                      </div>
                      <div className="flex gap-2">
                        {contrato.status === 'AGUARDANDO_ASSINATURA' && (
                          <Button
                            size="sm"
                            variant="elevated"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Abrir dialog de assinatura
                            }}
                          >
                            <FileSignature className="h-3 w-3 mr-1" />
                            Assinar
                          </Button>
                        )}
                        {contrato.status === 'ASSINADO' && contrato.assinado_em && (
                          <span className="text-sm text-success flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Assinado em {new Date(contrato.assinado_em).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{template.nome}</h3>
                    <p className="text-sm text-muted-foreground">{template.tipo_tratamento}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Usar Template
                    </Button>
                  </div>
                </Card>
              ))}
              {templates.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum template encontrado</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
