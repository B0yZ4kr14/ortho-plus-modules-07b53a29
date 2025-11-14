import { useState, useRef, useEffect } from 'react';
import { Upload, File, X, Eye, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAnexos } from '@/modules/pep/hooks/useAnexos';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AnexoFile {
  id: string;
  nome_arquivo: string;
  mime_type: string;
  tamanho_bytes: number;
  caminho_storage: string;
  tipo_arquivo: 'IMAGEM' | 'PDF' | 'DOCUMENTO' | 'OUTRO';
  created_at: string;
}

interface AnexosUploadProps {
  prontuarioId: string;
  historicoId?: string;
  onUploadSuccess?: () => void;
}

export function AnexosUpload({ prontuarioId, historicoId, onUploadSuccess }: AnexosUploadProps) {
  const { user, clinicId } = useAuth();
  const { anexos: anexosData, isUploading, uploadAnexo, deleteAnexo } = useAnexos(prontuarioId, clinicId || '');
  const [previewFile, setPreviewFile] = useState<AnexoFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Converter entidades de domínio para o formato do componente
  const anexos = anexosData.map(a => ({
    id: a.id,
    nome_arquivo: a.nomeArquivo,
    mime_type: a.mimeType,
    tamanho_bytes: a.tamanhoBytes,
    caminho_storage: a.storagePath,
    tipo_arquivo: a.tipo as 'IMAGEM' | 'PDF' | 'DOCUMENTO' | 'OUTRO',
    created_at: a.createdAt.toISOString(),
  }));

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    try {
      for (const file of Array.from(files)) {
        // Determinar tipo de arquivo
        let tipoArquivo: 'IMAGEM' | 'DOCUMENTO' | 'RAIO_X' | 'LAUDO' | 'EXAME' | 'RECEITA' | 'ATESTADO' | 'OUTRO' = 'OUTRO';
        if (file.type.startsWith('image/')) tipoArquivo = 'IMAGEM';
        else if (file.type === 'application/pdf') tipoArquivo = 'DOCUMENTO';
        else if (file.type.includes('document') || file.type.includes('text')) tipoArquivo = 'DOCUMENTO';

        await uploadAnexo(file, tipoArquivo, undefined, user.id, historicoId);
      }

      onUploadSuccess?.();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      // Toast já exibido pelo hook
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (anexo: AnexoFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('pep-anexos')
        .download(anexo.caminho_storage);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = anexo.nome_arquivo;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Download iniciado!');
    } catch (error: any) {
      console.error('Erro ao baixar arquivo:', error);
      toast.error('Erro ao baixar arquivo', { description: error.message });
    }
  };

  const handlePreview = async (anexo: AnexoFile) => {
    if (anexo.tipo_arquivo === 'IMAGEM' || anexo.tipo_arquivo === 'PDF') {
      setPreviewFile(anexo);
    } else {
      toast.info('Preview não disponível para este tipo de arquivo');
    }
  };

  const handleDelete = async (anexoId: string, caminhoStorage: string) => {
    const confirmed = window.confirm('Tem certeza que deseja excluir este anexo?');
    if (!confirmed) return;

    try {
      await deleteAnexo(anexoId, caminhoStorage);
    } catch (error: any) {
      console.error('Erro ao excluir anexo:', error);
      // Toast já exibido pelo hook
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      IMAGEM: 'Imagem',
      PDF: 'PDF',
      DOCUMENTO: 'Documento',
      OUTRO: 'Outro'
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="font-medium mb-1">Enviar Anexos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Imagens, PDFs ou documentos (máximo 10MB cada)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Selecionar Arquivos
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Lista de Anexos */}
      {anexos.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Anexos ({anexos.length})</h4>
          <div className="grid gap-2">
            {anexos.map((anexo) => (
              <Card key={anexo.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <File className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{anexo.nome_arquivo}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {getTipoLabel(anexo.tipo_arquivo)}
                        </Badge>
                        <span>{formatBytes(anexo.tamanho_bytes)}</span>
                        <span>{new Date(anexo.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {(anexo.tipo_arquivo === 'IMAGEM' || anexo.tipo_arquivo === 'PDF') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePreview(anexo)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(anexo)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(anexo.id, anexo.caminho_storage)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Dialog de Preview */}
      <Dialog open={previewFile !== null} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewFile?.nome_arquivo}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            {previewFile?.tipo_arquivo === 'IMAGEM' && (
              <img
                src={`${supabase.storage.from('pep-anexos').getPublicUrl(previewFile.caminho_storage).data.publicUrl}`}
                alt={previewFile.nome_arquivo}
                className="max-w-full h-auto"
              />
            )}
            {previewFile?.tipo_arquivo === 'PDF' && (
              <iframe
                src={`${supabase.storage.from('pep-anexos').getPublicUrl(previewFile.caminho_storage).data.publicUrl}`}
                className="w-full h-[70vh]"
                title={previewFile.nome_arquivo}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
