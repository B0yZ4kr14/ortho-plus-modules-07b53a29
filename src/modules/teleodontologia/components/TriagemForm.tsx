// @ts-nocheck
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { triagemSchema } from '../types/teleodontologia.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { z } from 'zod';

type TriagemFormData = z.infer<typeof triagemSchema>;

interface TriagemFormProps {
  teleconsultaId: string;
  onSubmit: (data: TriagemFormData) => void;
  onCancel: () => void;
}

export const TriagemForm = ({ teleconsultaId, onSubmit, onCancel }: TriagemFormProps) => {
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [sintomaInput, setSintomaInput] = useState('');
  const [fotosAnexas, setFotosAnexas] = useState<Array<{ url: string; descricao: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TriagemFormData>({
    resolver: zodResolver(triagemSchema),
    defaultValues: {
      teleconsulta_id: teleconsultaId,
      sintomas: [],
      intensidade_dor: 0,
      fotos_anexas: [],
    },
  });

  const intensidadeDor = watch('intensidade_dor') || 0;

  const adicionarSintoma = () => {
    if (sintomaInput.trim()) {
      const novosSintomas = [...sintomas, sintomaInput.trim()];
      setSintomas(novosSintomas);
      setValue('sintomas', novosSintomas);
      setSintomaInput('');
    }
  };

  const removerSintoma = (index: number) => {
    const novosSintomas = sintomas.filter((_, i) => i !== index);
    setSintomas(novosSintomas);
    setValue('sintomas', novosSintomas);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedFiles: Array<{ url: string; descricao: string }> = [];

      for (const file of Array.from(files)) {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${teleconsultaId}-${Date.now()}.${fileExt}`;
        const filePath = `triagens/${fileName}`;

        const { data, error } = await supabase.storage
          .from('pep-anexos')
          .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('pep-anexos')
          .getPublicUrl(filePath);

        uploadedFiles.push({
          url: urlData.publicUrl,
          descricao: file.name,
        });
      }

      const novasFotos = [...fotosAnexas, ...uploadedFiles];
      setFotosAnexas(novasFotos);
      setValue('fotos_anexas', novasFotos);

      toast({
        title: 'Fotos enviadas',
        description: `${uploadedFiles.length} foto(s) anexada(s) com sucesso.`,
      });
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Erro ao enviar fotos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removerFoto = (index: number) => {
    const novasFotos = fotosAnexas.filter((_, i) => i !== index);
    setFotosAnexas(novasFotos);
    setValue('fotos_anexas', novasFotos);
  };

  const handleFormSubmit = (data: TriagemFormData) => {
    onSubmit({
      ...data,
      sintomas,
      fotos_anexas: fotosAnexas,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Card className="p-4 space-y-3 bg-muted/50">
        <h4 className="font-semibold text-sm">Sintomas Relatados</h4>
        
        <div className="flex gap-2">
          <Input
            placeholder="Digite um sintoma e pressione Enter"
            value={sintomaInput}
            onChange={(e) => setSintomaInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                adicionarSintoma();
              }
            }}
          />
          <Button type="button" onClick={adicionarSintoma} variant="outline">
            Adicionar
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {sintomas.map((sintoma, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {sintoma}
              <button
                type="button"
                onClick={() => removerSintoma(index)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        {errors.sintomas && (
          <p className="text-sm text-destructive">{errors.sintomas.message}</p>
        )}
      </Card>

      <div>
        <Label htmlFor="intensidade_dor">Intensidade da Dor: {intensidadeDor}/10</Label>
        <Slider
          id="intensidade_dor"
          min={0}
          max={10}
          step={1}
          value={[intensidadeDor]}
          onValueChange={(value) => setValue('intensidade_dor', value[0])}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Sem dor</span>
          <span>Dor insuportável</span>
        </div>
        {errors.intensidade_dor && (
          <p className="text-sm text-destructive mt-1">{errors.intensidade_dor.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="tempo_sintoma">Há quanto tempo apresenta os sintomas? *</Label>
        <Input
          id="tempo_sintoma"
          placeholder="Ex: 3 dias, 1 semana, 2 meses"
          {...register('tempo_sintoma')}
        />
        {errors.tempo_sintoma && (
          <p className="text-sm text-destructive mt-1">{errors.tempo_sintoma.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="alergias">Alergias (se houver)</Label>
        <Textarea
          id="alergias"
          placeholder="Liste qualquer alergia conhecida"
          rows={2}
          {...register('alergias')}
        />
      </div>

      <div>
        <Label htmlFor="medicamentos_uso">Medicamentos em Uso (se houver)</Label>
        <Textarea
          id="medicamentos_uso"
          placeholder="Liste os medicamentos que está tomando atualmente"
          rows={2}
          {...register('medicamentos_uso')}
        />
      </div>

      <Card className="p-4 space-y-3 bg-muted/50">
        <h4 className="font-semibold text-sm">Fotos da Região Afetada</h4>
        <p className="text-xs text-muted-foreground">
          Anexe fotos que ajudem o dentista a visualizar o problema (opcional)
        </p>

        <div>
          <Label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Enviando...' : 'Anexar Fotos'}
          </Label>
          <Input
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </div>

        {fotosAnexas.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {fotosAnexas.map((foto, index) => (
              <div key={index} className="relative group">
                <img
                  src={foto.url}
                  alt={foto.descricao}
                  className="w-full h-32 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removerFoto(index)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="elevated" disabled={isSubmitting || uploading}>
          {isSubmitting ? 'Salvando...' : 'Salvar Triagem'}
        </Button>
      </div>
    </form>
  );
};
