import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarChange: (url: string | null) => void;
  fallbackText: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AvatarUpload = ({
  currentAvatarUrl,
  onAvatarChange,
  fallbackText,
  size = 'lg'
}: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40',
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Arquivo inválido',
          description: 'Por favor, selecione uma imagem',
          variant: 'destructive',
        });
        return;
      }

      // Validar tamanho (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O tamanho máximo é 2MB',
          variant: 'destructive',
        });
        return;
      }

      setUploading(true);

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Deletar avatar antigo se existir
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      setPreviewUrl(publicUrl);
      onAvatarChange(publicUrl);

      toast({
        title: 'Sucesso',
        description: 'Foto atualizada com sucesso',
      });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível fazer upload da foto',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setUploading(true);

      // Deletar do storage
      if (currentAvatarUrl) {
        const path = currentAvatarUrl.split('/').pop();
        if (path) {
          await supabase.storage.from('avatars').remove([path]);
        }
      }

      setPreviewUrl(null);
      onAvatarChange(null);

      toast({
        title: 'Sucesso',
        description: 'Foto removida com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao remover:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a foto',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-4 border-border shadow-xl`}>
          {previewUrl ? (
            <AvatarImage src={previewUrl} alt="Avatar" />
          ) : (
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
              {fallbackText}
            </AvatarFallback>
          )}
        </Avatar>

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {previewUrl && !uploading && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
            onClick={handleRemoveAvatar}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {previewUrl ? (
            <>
              <Camera className="h-4 w-4" />
              Alterar Foto
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Foto
            </>
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG ou WEBP (máx. 2MB)
      </p>
    </div>
  );
};
