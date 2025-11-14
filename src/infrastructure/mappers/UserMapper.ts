import { User, AppRole } from '@/domain/entities/User';
import { Email } from '@/domain/value-objects/Email';
import { Database } from '@/integrations/supabase/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

/**
 * Mapper: Supabase Row ↔ User Entity
 */
export class UserMapper {
  static toDomain(row: ProfileRow, email: string): User {
    const rowAny = row as any;
    return User.restore({
      id: row.id,
      clinicId: row.clinic_id ?? '',
      email: Email.create(email),
      fullName: row.full_name ?? 'Usuário',
      appRole: (rowAny.app_role as AppRole) ?? 'MEMBER',
      isActive: rowAny.is_active ?? true,
      avatarUrl: row.avatar_url ?? undefined,
      phone: rowAny.phone ?? undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  static toPersistence(user: User): any {
    return {
      id: user.id,
      clinic_id: user.clinicId,
      full_name: user.fullName,
      app_role: user.appRole,
      is_active: user.isActive,
      avatar_url: user.avatarUrl ?? null,
      phone: user.phone ?? null,
    };
  }
}
