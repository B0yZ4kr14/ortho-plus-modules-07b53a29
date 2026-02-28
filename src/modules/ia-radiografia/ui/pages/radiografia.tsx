import { useState } from 'react';
import { RadiografiaUpload } from '@/modules/ia/presentation/components/RadiografiaUpload';
import { RadiografiaViewer } from '@/modules/ia/presentation/components/RadiografiaViewer';
import { RadiografiaList } from '@/modules/ia/presentation/components/RadiografiaList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brain, History } from 'lucide-react';

const RadiografiaPage = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAnalise, setSelectedAnalise] = useState<any>(null);
  const [analises, setAnalises] = useState<any[]>([]);

  const handleUpload = async (file: File, tipo: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      setIsUploading(true);

      // Converter arquivo para base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imageBase64 = await base64Promise;

      // Chamar Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-radiografia', {
        body: {
          imageBase64,
          tipoRadiografia: tipo,
          patientId: 'demo-patient-id', // TODO: Conectar com paciente real
        },
      });

      if (error) throw error;

      toast.success('Análise concluída com sucesso!');
      
      // Recarregar lista de análises
      loadAnalises();
      
      // Abrir resultado
      setSelectedAnalise({
        imagemUrl: data.imagemUrl,
        resultadoIA: data.resultadoIA,
        confidence: data.confidence,
        tipo,
      });
    } catch (error: any) {
      console.error('Erro na análise:', error);
      if (error.message.includes('429')) {
        toast.error('Rate limit excedido. Aguarde alguns minutos.');
      } else if (error.message.includes('402')) {
        toast.error('Créditos insuficientes no workspace Lovable.');
      } else {
        toast.error(error.message || 'Erro ao analisar radiografia');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const loadAnalises = async () => {
    try {
      const { data, error } = await supabase
        .from('analises_radiograficas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAnalises(data || []);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
    }
  };

  const handleViewAnalise = (analise: any) => {
    setSelectedAnalise({
      imagemUrl: analise.imagem_url,
      resultadoIA: analise.resultado_ia,
      confidence: analise.confidence_score,
      tipo: analise.tipo_radiografia,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Análise de Radiografias com IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Detecção automática de problemas odontológicos com Gemini 2.5 Pro
          </p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Nova Análise
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <RadiografiaUpload
              onUpload={handleUpload}
              isUploading={isUploading}
            />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <RadiografiaList
            analises={analises}
            onView={handleViewAnalise}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedAnalise} onOpenChange={(open) => !open && setSelectedAnalise(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resultado da Análise</DialogTitle>
          </DialogHeader>
          {selectedAnalise && (
            <RadiografiaViewer
              imagemUrl={selectedAnalise.imagemUrl}
              resultadoIA={selectedAnalise.resultadoIA}
              confidence={selectedAnalise.confidence}
              tipo={selectedAnalise.tipo}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RadiografiaPage;
