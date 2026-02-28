import { useState } from 'react';
import { FileText, Calendar, Users, DollarSign, TrendingUp, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function Relatorios() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleGenerateReport = (reportType: string) => {
    if (!dateFrom || !dateTo) {
      toast.error('Selecione as datas de início e fim');
      return;
    }
    toast.success(`Gerando relatório: ${reportType}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Relatórios" 
        icon={FileText}
        description="Gere relatórios detalhados sobre sua clínica"
      />

      <Tabs defaultValue="comercial" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
          <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
          <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        {/* Relatórios Comerciais */}
        <TabsContent value="comercial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Comerciais</CardTitle>
              <CardDescription>
                Análises de contratos, campanhas e desempenho comercial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Relatório Analítico de Contratos */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">1 - Relatório Analítico de Contratos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>De:</Label>
                    <Input 
                      type="date" 
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Até:</Label>
                    <Input 
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Status:</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Todos --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Plano:</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Todos --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="basico">Básico</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Analítico de Contratos')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>

              {/* Relatório Sintético por Campanha */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">2 - Relatório Sintético por Campanha</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Mês:</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="janeiro">Janeiro</SelectItem>
                        <SelectItem value="fevereiro">Fevereiro</SelectItem>
                        <SelectItem value="marco">Março</SelectItem>
                        <SelectItem value="abril">Abril</SelectItem>
                        <SelectItem value="maio">Maio</SelectItem>
                        <SelectItem value="junho">Junho</SelectItem>
                        <SelectItem value="julho">Julho</SelectItem>
                        <SelectItem value="agosto">Agosto</SelectItem>
                        <SelectItem value="setembro">Setembro</SelectItem>
                        <SelectItem value="outubro">Outubro</SelectItem>
                        <SelectItem value="novembro">Novembro</SelectItem>
                        <SelectItem value="dezembro">Dezembro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ano:</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="2025" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Sintético por Campanha')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>

              {/* Relatório Sintético por Funcionário */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">3 - Relatório Sintético por Funcionário</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>De:</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Até:</Label>
                    <Input type="date" />
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Sintético por Funcionário')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>

              {/* Relatório Comercial de Contratos Não Fechados */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">4 - Relatório Comercial de Contratos Não Fechados</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>De:</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Até:</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Funcionário:</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Todos --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Contratos Não Fechados')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios de Pacientes */}
        <TabsContent value="pacientes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Pacientes</CardTitle>
              <CardDescription>
                Análises sobre tratamentos, agendamentos e histórico de pacientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pacientes com Tratamento em Andamento */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">1 - Pacientes com Tratamento em Andamento/Futuro</h3>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Tratamento em Andamento')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>

              {/* Pacientes que Estarão Sem Agendamento */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">2 - Pacientes que Estarão Sem Agendamento</h3>
                <div>
                  <Label>Data:</Label>
                  <Input type="date" />
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Sem Agendamento')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>

              {/* Relatório de Orçamentos Clínicos */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">6 - Relatório de Orçamentos Clínicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>De:</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Até:</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Funcionário:</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Todos --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Orçamentos Clínicos')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>

              {/* Relatório Tempo Médio de Tratamento Por Dentista */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">7 - Relatório Tempo Médio de Tratamento Por Dentista</h3>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Tempo Médio por Dentista')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios de Profissionais */}
        <TabsContent value="profissionais" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Profissionais</CardTitle>
              <CardDescription>
                Análises de desempenho, aniversários e permissões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lista de Profissionais */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">1 - Lista</h3>
                <div>
                  <Label>Tipo:</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="dentista">Dentista</SelectItem>
                      <SelectItem value="recepcionista">Recepcionista</SelectItem>
                      <SelectItem value="auxiliar">Auxiliar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Lista de Profissionais')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>

              {/* Aniversariantes */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">2 - Aniversariantes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo:</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Mês:</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Setembro" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                        ].map(mes => (
                          <SelectItem key={mes} value={mes.toLowerCase()}>{mes}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Aniversariantes')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>

              {/* Permissões dos Funcionários */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">3 - Permissões dos Funcionários</h3>
                <div>
                  <Label>Funcionário:</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Todos --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Permissões')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>

              {/* Funcionários e suas Permissões */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">4 - Funcionários e suas Permissões</h3>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Funcionários e Permissões')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios Financeiros */}
        <TabsContent value="financeiro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros - Contas a Receber</CardTitle>
              <CardDescription>
                Análises de faturamento, recebimentos e inadimplência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contas Recebidas */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">1 - Contas Recebidas/Adiantamentos Bruto</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Tipo:</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Todos --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Mês:</Label>
                    <Input type="month" />
                  </div>
                  <div>
                    <Label>Fim:</Label>
                    <Input type="month" />
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Contas Recebidas')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>

              {/* Inadimplência */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">2 - Inadimplência</h3>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Inadimplência')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>

              {/* Lançamentos Financeiros */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">3 - Lançamentos Financeiros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Mês:</Label>
                    <Input type="month" />
                  </div>
                  <div>
                    <Label>Fim:</Label>
                    <Input type="month" />
                  </div>
                  <div>
                    <Label>Conta:</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Lançamentos Financeiros')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>

              {/* Visão de Pagamentos de Serviços */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">8 - Visão de Pagamentos de Serviços</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Mês/Inicial:</Label>
                    <Input type="month" />
                  </div>
                  <div>
                    <Label>Ano:</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="2025" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport('Pagamentos de Serviços')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
