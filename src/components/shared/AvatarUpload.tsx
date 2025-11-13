import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Loader2, X, Crop } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<CropType>({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40',
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validar tamanho (máximo 5MB antes do crop)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Ler arquivo e abrir dialog de crop
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result?.toString() || '');
      setCropDialogOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to 400x400 for avatar
    canvas.width = 400;
    canvas.height = 400;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      400,
      400
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    });
  }, [completedCrop]);

  const handleCropComplete = async () => {
    try {
      setUploading(true);
      setCropDialogOpen(false);

      const croppedBlob = await getCroppedImg();
      if (!croppedBlob) {
        throw new Error('Falha ao processar imagem');
      }

      // Criar nome único para o arquivo
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.jpg`;
      const filePath = `${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg',
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
      setImageSrc('');
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
    <>
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
          JPG, PNG ou WEBP (máx. 5MB)
          <br />
          A imagem será redimensionada automaticamente
        </p>
      </div>

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="h-5 w-5" />
              Ajustar Foto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              {imageSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    style={{ maxHeight: '60vh' }}
                  />
                </ReactCrop>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCropDialogOpen(false);
                  setImageSrc('');
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleCropComplete}
                disabled={!completedCrop}
              >
                <Crop className="h-4 w-4 mr-2" />
                Aplicar e Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
