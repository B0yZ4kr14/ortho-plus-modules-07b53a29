import { User } from "@/domain/entities/User";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors";
import { UserMapper } from "../mappers/UserMapper";

export class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      // First get profile data
      const profiles = await apiClient.get<any[]>(
        `/rest/v1/profiles?id=eq.${id}`,
      );

      if (!profiles || profiles.length === 0) return null;
      const profile = profiles[0];

      // Assuming our new backend has an endpoint for user details including email mapping
      // If it doesn't, we can fallback to searching via the /auth/users list
      const data = await apiClient
        .get<any>(`/auth/user/${id}/metadata`)
        .catch(() => null);
      const email = data?.email || profile.email || "";

      return UserMapper.toDomain(profile, email);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Erro inesperado ao buscar usuário", error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      // Search via custom auth endpoint instead of supabase admin
      const data = await apiClient.get<any>(
        `/auth/users?email=${encodeURIComponent(email)}`,
      );
      const authUser =
        data?.users?.find((u: any) => u.email === email) ||
        (data && data.email === email ? data : null);

      if (!authUser) return null;

      const profiles = await apiClient.get<any[]>(
        `/rest/v1/profiles?id=eq.${authUser.id}`,
      );
      if (!profiles || profiles.length === 0) return null;

      return UserMapper.toDomain(profiles[0], email);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar usuário por email",
        error,
      );
    }
  }

  async findByClinicId(clinicId: string): Promise<User[]> {
    try {
      const data = await apiClient.get<any>(`/auth/users?clinicId=${clinicId}`);
      const profiles = data.users || data || [];

      return profiles.map((profile: any) =>
        UserMapper.toDomain(profile, profile.email || ""),
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar usuários",
        error,
      );
    }
  }

  async findActiveByClinicId(clinicId: string): Promise<User[]> {
    try {
      const data = await apiClient.get<any>(`/auth/users?clinicId=${clinicId}`);
      const profiles = data.users || data || [];

      return profiles
        .filter((profile: any) => profile.is_active !== false)
        .map((profile: any) =>
          UserMapper.toDomain(profile, profile.email || ""),
        );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar usuários ativos",
        error,
      );
    }
  }

  async findAdminsByClinicId(clinicId: string): Promise<User[]> {
    try {
      const data = await apiClient.get<any>(`/auth/users?clinicId=${clinicId}`);
      const profiles = data.users || data || [];

      return profiles
        .filter((profile: any) => profile.app_role === "ADMIN")
        .map((profile: any) =>
          UserMapper.toDomain(profile, profile.email || ""),
        );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar administradores",
        error,
      );
    }
  }

  async save(user: User): Promise<void> {
    try {
      const data = UserMapper.toPersistence(user);
      await apiClient.post("/rest/v1/profiles", data); // This should probably be an auth endpoint too, but keeping as is if it mirrors backend
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Erro inesperado ao salvar usuário", error);
    }
  }

  async update(user: User): Promise<void> {
    try {
      const data = UserMapper.toPersistence(user);
      await apiClient.patch(`/rest/v1/profiles?id=eq.${user.id}`, data);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao atualizar usuário",
        error,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.patch(`/rest/v1/profiles?id=eq.${id}`, {
        is_active: false,
      });
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao deletar usuário",
        error,
      );
    }
  }
}
