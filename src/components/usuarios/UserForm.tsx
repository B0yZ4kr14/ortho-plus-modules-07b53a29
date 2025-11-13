import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const userFormSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200),
  email: z.string().email('Email inválido'),
  app_role: z.enum(['ADMIN', 'MEMBER']),
  is_active: z.boolean().default(true),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface User {
  id: string;
  email: string;
  full_name: string;
  app_role: 'ADMIN' | 'MEMBER';
  is_active: boolean;
}

interface UserFormProps {
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { clinicId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      app_role: user?.app_role || 'MEMBER',
      is_active: user?.is_active ?? true,
      password: '',
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    if (!clinicId) {
      toast.error('Erro', { description: 'Clínica não identificada' });
      return;
    }

    setIsLoading(true);

    try {
      if (user) {
        // Atualizar usuário existente
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: values.full_name,
            app_role: values.app_role,
            // is_active: values.is_active, // TODO: adicionar campo na migration
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Se forneceu nova senha, atualizar
        if (values.password) {
          const { error: passwordError } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: values.password }
          );
          if (passwordError) throw passwordError;
        }

        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: values.email,
          password: values.password || `temp${Date.now()}`, // Senha temporária se não fornecida
          email_confirm: true,
          user_metadata: {
            full_name: values.full_name,
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Usuário não foi criado');

        // Criar perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            clinic_id: clinicId,
            full_name: values.full_name,
            app_role: values.app_role,
            // is_active: values.is_active, // TODO: adicionar campo na migration
          });

        if (profileError) throw profileError;

        toast.success('Usuário criado com sucesso!', {
          description: values.password 
            ? 'O usuário pode fazer login com a senha fornecida.' 
            : 'Foi enviado um email de confirmação com instruções para definir a senha.',
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao salvar usuário', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo *</FormLabel>
              <FormControl>
                <Input placeholder="Nome do usuário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="email@exemplo.com" 
                  {...field}
                  disabled={!!user} // Não permite alterar email de usuário existente
                />
              </FormControl>
              {user && (
                <FormDescription>
                  O email não pode ser alterado após a criação do usuário
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {user ? 'Nova Senha (opcional)' : 'Senha *'}
              </FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={user ? 'Deixe em branco para manter a senha atual' : 'Mínimo 6 caracteres'}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="app_role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nível de Acesso *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MEMBER">Membro</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Administradores têm acesso total ao sistema, incluindo configurações e gerenciamento de módulos
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Usuário Ativo</FormLabel>
                <FormDescription>
                  Desmarque para desativar o acesso deste usuário ao sistema
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user ? 'Atualizar' : 'Criar'} Usuário
          </Button>
        </div>
      </form>
    </Form>
  );
}
