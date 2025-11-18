import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Upload, ZoomIn } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { ImageViewer } from '@/components/imaging/ImageViewer';

interface ImagingTabProps {
  patientId: string;
}

export function ImagingTab({ patientId }: ImagingTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ['patient-images', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analises_radiograficas')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Carregando imagens...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Imagens e Radiografias</h2>
          <p className="text-muted-foreground">Histórico de exames de imagem</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload de Imagem
        </Button>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={() => setSelectedImage(null)}
            >
              <ZoomIn className="h-6 w-6" />
            </Button>
            <ImageViewer imageUrl={selectedImage} />
          </div>
        </div>
      )}

      {images && images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card 
              key={image.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedImage(image.imagem_url)}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  <img 
                    src={image.imagem_url} 
                    alt={image.tipo_radiografia}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-medium text-sm">{image.tipo_radiografia}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(image.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
                {image.resultado_ia && (
                  <div className="mt-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      IA: {image.confidence_score}% confiança
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhuma imagem ou radiografia registrada ainda.
              <br />
              Clique em "Upload de Imagem" para adicionar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
