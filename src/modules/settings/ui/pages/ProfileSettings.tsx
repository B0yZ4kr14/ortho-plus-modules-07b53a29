import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AvatarUpload } from '@/components/shared/AvatarUpload';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, fetchUserMetadata } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user && 'user_metadata' in user) {
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Recarregar dados do usuário
      await fetchUserMetadata(user.id);

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={User}
          title="Meu Perfil"
          description="Gerencie suas informações pessoais e foto de perfil"
        />
      </div>

      <Card className="p-8" depth="normal">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Avatar Upload */}
          <div className="flex justify-center">
            <AvatarUpload
              currentAvatarUrl={avatarUrl}
              onAvatarChange={setAvatarUrl}
              fallbackText={fullName ? getInitials(fullName) : 'US'}
              size="xl"
            />
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                O email não pode ser alterado
              </p>
            </div>

            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="elevated"
              onClick={handleSave}
              disabled={loading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
