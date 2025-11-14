import { useState, useEffect } from 'react';
import { container } from '@/infrastructure/di/Container';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import { Anexo } from '@/domain/entities/Anexo';
import { UploadAnexoUseCase } from '@/application/use-cases/prontuario/UploadAnexoUseCase';
import { IAnexoRepository } from '@/domain/repositories/IAnexoRepository';
import { useToast } from '@/hooks/use-toast';

export function useAnexos(prontuarioId: string | null, clinicId: string) {
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const anexoRepository = container.resolve<IAnexoRepository>(
    SERVICE_KEYS.ANEXO_REPOSITORY
  );
  const uploadAnexoUseCase = container.resolve<UploadAnexoUseCase>(
    SERVICE_KEYS.UPLOAD_ANEXO_USE_CASE
  );

  const fetchAnexos = async () => {
    if (!prontuarioId) return;

    setIsLoading(true);
    try {
      const result = await anexoRepository.findByProntuarioId(prontuarioId);
      setAnexos(result);
    } catch (error) {
      toast({
        title: 'Erro ao carregar anexos',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnexos();
  }, [prontuarioId]);

  const uploadAnexo = async (
    file: File,
    tipo: 'IMAGEM' | 'DOCUMENTO' | 'RAIO_X' | 'LAUDO' | 'EXAME' | 'RECEITA' | 'ATESTADO' | 'OUTRO',
    descricao: string | undefined,
    uploadedBy: string,
    historicoId?: string
  ) => {
    if (!prontuarioId) {
      toast({
        title: 'Erro',
        description: 'Prontuário não selecionado',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadAnexoUseCase.execute({
        prontuarioId,
        historicoId,
        clinicId,
        tipo,
        file,
        descricao,
        uploadedBy,
      });
      
      toast({
        title: 'Sucesso',
        description: 'Arquivo enviado com sucesso',
      });
      
      await fetchAnexos();
    } catch (error) {
      toast({
        title: 'Erro ao enviar arquivo',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAnexo = async (id: string, storagePath: string) => {
    try {
      await anexoRepository.delete(id, storagePath);
      
      toast({
        title: 'Sucesso',
        description: 'Arquivo excluído com sucesso',
      });
      
      await fetchAnexos();
    } catch (error) {
      toast({
        title: 'Erro ao excluir arquivo',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    anexos,
    isLoading,
    isUploading,
    uploadAnexo,
    deleteAnexo,
    refresh: fetchAnexos,
  };
}
