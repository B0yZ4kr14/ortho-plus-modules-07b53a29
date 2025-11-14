import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User } from '@/domain/entities/User';
import { UserMapper } from '../mappers/UserMapper';
import { NotFoundError, InfrastructureError } from '../errors';
import { supabase } from '@/integrations/supabase/client';

export class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') return null;
        throw new InfrastructureError(`Erro ao buscar usuário: ${profileError.message}`, profileError);
      }

      // Buscar email do auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(id);
      if (authError || !authUser.user) return null;

      return UserMapper.toDomain(profile, authUser.user.email ?? '');
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar usuário', error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      // Buscar via auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        throw new InfrastructureError(`Erro ao buscar usuário por email: ${authError.message}`, authError);
      }

      const authUser = authUsers.users.find((u) => u.email === email);
      if (!authUser) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) return null;

      return UserMapper.toDomain(profile, email);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar usuário por email', error);
    }
  }

  async findByClinicId(clinicId: string): Promise<User[]> {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('clinic_id', clinicId);

      if (profileError) {
        throw new InfrastructureError(`Erro ao buscar usuários: ${profileError.message}`, profileError);
      }

      // Buscar emails do auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) return [];

      const emailMap = new Map(authUsers.users.map((u) => [u.id, u.email ?? '']));

      return profiles.map((profile) =>
        UserMapper.toDomain(profile, emailMap.get(profile.id) ?? '')
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar usuários', error);
    }
  }

  async findActiveByClinicId(clinicId: string): Promise<User[]> {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      if (profileError) {
        throw new InfrastructureError(`Erro ao buscar usuários ativos: ${profileError.message}`, profileError);
      }

      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) return [];

      const emailMap = new Map(authUsers.users.map((u) => [u.id, u.email ?? '']));

      return profiles.map((profile) =>
        UserMapper.toDomain(profile, emailMap.get(profile.id) ?? '')
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar usuários ativos', error);
    }
  }

  async findAdminsByClinicId(clinicId: string): Promise<User[]> {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('app_role', 'ADMIN');

      if (profileError) {
        throw new InfrastructureError(`Erro ao buscar administradores: ${profileError.message}`, profileError);
      }

      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) return [];

      const emailMap = new Map(authUsers.users.map((u) => [u.id, u.email ?? '']));

      return profiles.map((profile) =>
        UserMapper.toDomain(profile, emailMap.get(profile.id) ?? '')
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar administradores', error);
    }
  }

  async save(user: User): Promise<void> {
    try {
      const data = UserMapper.toPersistence(user);
      const { error } = await supabase.from('profiles').insert(data);

      if (error) {
        throw new InfrastructureError(`Erro ao salvar usuário: ${error.message}`, error);
      }
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao salvar usuário', error);
    }
  }

  async update(user: User): Promise<void> {
    try {
      const data = UserMapper.toPersistence(user);
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) {
        throw new InfrastructureError(`Erro ao atualizar usuário: ${error.message}`, error);
      }
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao atualizar usuário', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw new InfrastructureError(`Erro ao deletar usuário: ${error.message}`, error);
      }
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao deletar usuário', error);
    }
  }
}
