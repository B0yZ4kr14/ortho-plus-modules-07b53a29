import { useState } from 'react';
import { Plus, Scan, Upload, AlertCircle, CheckCircle, Clock, Eye } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

export default function IARadiografia() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const { analises, loading, uploadRadiografia } = useRadiografiaSupabase();
  const { toast } = useToast();

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
              <Clock className="h-3 w-3 animate-spin" />
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

      {/* Lista de Análises */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Análises Recentes</h2>
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
        ) : analises.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma análise realizada ainda</p>
            <p className="text-sm mt-2">Faça upload de um raio-X para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analises.map((analise) => (
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
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}