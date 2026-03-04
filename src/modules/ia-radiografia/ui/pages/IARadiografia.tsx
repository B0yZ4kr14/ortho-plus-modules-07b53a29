import { useState, useMemo } from 'react';
import { Plus, Scan, Upload, AlertCircle, CheckCircle, Clock, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useRadiografiaSupabase } from '@/modules/ia-radiografia/hooks/useRadiografiaSupabase';
import { tipoRadiografiaLabels } from '@/modules/ia-radiografia/types/radiografia.types';
import type { AnaliseComplete } from '@/modules/ia-radiografia/types/radiografia.types';
import { useToast } from '@/hooks/use-toast';
import { AnaliseDetailsDialog } from '@/modules/ia-radiografia/components/AnaliseDetailsDialog';
import { AnaliseCharts } from '@/modules/ia-radiografia/components/AnaliseCharts';
import { IAInsightsDashboard } from '@/modules/ia-radiografia/components/IAInsightsDashboard';
import { RadiografiaComparison } from '@/modules/ia-radiografia/components/RadiografiaComparison';
import { PatientRadiographyTimeline } from '@/modules/ia-radiografia/components/PatientRadiographyTimeline';

export default function IARadiografia() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [selectedAnalise, setSelectedAnalise] = useState<AnaliseComplete | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Filtros
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');
  const [filterPeriodo, setFilterPeriodo] = useState<string>('TODOS');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { analises, loading, uploadRadiografia } = useRadiografiaSupabase();
  const { toast } = useToast();
  
  // Filtrar análises
  const filteredAnalises = useMemo(() => {
    let filtered = [...analises];
    
    // Filtro por status
    if (filterStatus !== 'TODOS') {
      filtered = filtered.filter(a => a.status_analise === filterStatus);
    }
    
    // Filtro por tipo
    if (filterTipo !== 'TODOS') {
      filtered = filtered.filter(a => a.tipo_radiografia === filterTipo);
    }
    
    // Filtro por período
    if (filterPeriodo !== 'TODOS') {
      const now = new Date();
      const dataAnalise = (a: AnaliseComplete) => new Date(a.created_at);
      
      if (filterPeriodo === '7_DIAS') {
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(a => dataAnalise(a) >= sevenDaysAgo);
      } else if (filterPeriodo === '30_DIAS') {
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        filtered = filtered.filter(a => dataAnalise(a) >= thirtyDaysAgo);
      } else if (filterPeriodo === '90_DIAS') {
        const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
        filtered = filtered.filter(a => dataAnalise(a) >= ninetyDaysAgo);
      }
    }
    
    return filtered;
  }, [analises, filterStatus, filterTipo, filterPeriodo]);
  
  // Paginação
  const totalPages = Math.ceil(filteredAnalises.length / itemsPerPage);
  const paginatedAnalises = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAnalises.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAnalises, currentPage]);
  
  const handleViewDetails = (analise: AnaliseComplete) => {
    setSelectedAnalise(analise);
    setDetailsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedPatient || !selectedTipo) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos antes de enviar',
        variant: 'destructive'
      });
      return;
    }

    try {
      await uploadRadiografia(selectedPatient, undefined, selectedTipo, selectedFile);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedPatient('');
      setSelectedTipo('');
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDENTE: 'text-muted-foreground',
      PROCESSANDO: 'text-warning',
      CONCLUIDA: 'text-success',
      ERRO: 'text-destructive',
    };
    return colors[status] || 'text-muted-foreground';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      PENDENTE: Clock,
      PROCESSANDO: Clock,
      CONCLUIDA: CheckCircle,
      ERRO: AlertCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={Scan}
          title="IA Análise de Radiografias"
          description="Detecção automática de problemas dentários via Inteligência Artificial"
        />
        <Button variant="elevated" onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Fazer Upload de Raio-X
        </Button>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload de Radiografia</DialogTitle>
            <DialogDescription>
              Envie uma radiografia para análise automática com IA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Paciente ID</Label>
              <Input
                placeholder="ID do paciente"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
              />
            </div>
            <div>
              <Label>Tipo de Radiografia</Label>
              <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoRadiografiaLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Arquivo de Imagem</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedPatient || !selectedTipo}
              className="w-full"
            >
              Enviar e Analisar com IA
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cards de Estatísticas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Total de Análises</div>
            <div className="text-3xl font-bold mt-2">{analises.length}</div>
            <Badge variant="success" className="mt-2">Radiografias analisadas</Badge>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Problemas Detectados</div>
            <div className="text-3xl font-bold mt-2 text-warning">
              {analises.reduce((sum, a) => sum + (a.problemas_detectados || 0), 0)}
            </div>
            <Badge variant="warning" className="mt-2">Requer atenção</Badge>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Precisão Média da IA</div>
            <div className="text-3xl font-bold mt-2 text-success">
              {analises.length > 0
                ? Math.round(analises.reduce((sum, a) => sum + (a.confidence_score || 0), 0) / analises.length)
                : 0}%
            </div>
            <Progress value={analises.length > 0
                ? analises.reduce((sum, a) => sum + (a.confidence_score || 0), 0) / analises.length
                : 0} className="mt-2" />
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Em Processamento</div>
            <div className="text-3xl font-bold mt-2">
              {analises.filter(a => a.status_analise === 'PROCESSANDO' || a.status_analise === 'PENDENTE').length}
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              Processando...
            </div>
          </Card>
        </div>
      )}

      {/* Informações sobre a IA */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Scan className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Como funciona a Análise por IA?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Nossa IA utiliza Google Gemini Vision avançada treinada com milhares de radiografias odontológicas 
              para detectar automaticamente cáries, fraturas, problemas periodontais e outras condições. 
              A precisão média é de 94%, mas sempre recomendamos revisão profissional.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>Detecção de Cáries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>Fraturas Dentárias</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>Problemas Periodontais</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>Lesões Periapicais</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Dashboard de Insights da IA */}
      {!loading && analises.length > 0 && (
        <IAInsightsDashboard analises={analises} />
      )}

      {/* Gráficos Estatísticos */}
      {!loading && analises.length > 0 && (
        <AnaliseCharts analises={analises} />
      )}

      {/* Comparação de Radiografias */}
      {!loading && analises.length > 0 && (
        <RadiografiaComparison analises={analises} />
      )}

      {/* Timeline de Evolução do Paciente */}
      {!loading && analises.length > 0 && (
        <PatientRadiographyTimeline />
      )}

      {/* Lista de Análises */}
      <Card className="p-6" depth="intense">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Análises Recentes</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtros:</span>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="PROCESSANDO">Processando</SelectItem>
                <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                <SelectItem value="ERRO">Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs">Tipo de Radiografia</Label>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                {Object.entries(tipoRadiografiaLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs">Período</Label>
            <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="7_DIAS">Últimos 7 dias</SelectItem>
                <SelectItem value="30_DIAS">Últimos 30 dias</SelectItem>
                <SelectItem value="90_DIAS">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-32" />
              </div>
            ))}
          </div>
        ) : filteredAnalises.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma análise realizada ainda</p>
            <p className="text-sm mt-2">Faça upload de um raio-X para começar</p>
          </div>
        ) : (
          <>
          <div className="space-y-4">
            {paginatedAnalises.map((analise) => (
              <div
                key={analise.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{analise.patient_name}</h3>
                    <Badge variant="outline">
                      {tipoRadiografiaLabels[analise.tipo_radiografia as keyof typeof tipoRadiografiaLabels]}
                    </Badge>
                    <div className={`flex items-center gap-1 text-sm ${getStatusColor(analise.status_analise)}`}>
                      {getStatusIcon(analise.status_analise)}
                      <span className="capitalize">{analise.status_analise}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Data: {new Date(analise.created_at).toLocaleString('pt-BR')}</p>
                    <p className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-warning" />
                      {analise.problemas_detectados || 0} problema(s) detectado(s)
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  {analise.confidence_score && analise.confidence_score > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-success">{Math.round(analise.confidence_score)}%</div>
                      <div className="text-xs text-muted-foreground">Confiança da IA</div>
                    </div>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(analise)}>
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAnalises.length)} de {filteredAnalises.length} análises
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[32px]"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          </>
        )}
      </Card>
      
      {/* Modal de Detalhes */}
      <AnaliseDetailsDialog 
        analise={selectedAnalise}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}