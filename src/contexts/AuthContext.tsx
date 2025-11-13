import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Clinic {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: 'ADMIN' | 'MEMBER' | null;
  clinicId: string | null;
  isAdmin: boolean;
  availableClinics: Clinic[];
  selectedClinic: Clinic | null;
  userPermissions: string[];
  switchClinic: (clinicId: string) => void;
  hasRole: (role: 'ADMIN' | 'MEMBER') => boolean;
  hasModuleAccess: (moduleKey: string) => boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'ADMIN' | 'MEMBER' | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [availableClinics, setAvailableClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  // Fetch user role and clinics
  const fetchUserMetadata = async (userId: string) => {
    try {
      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleData) {
        setUserRole(roleData.role as 'ADMIN' | 'MEMBER');
        
        // If ADMIN, grant access to all modules
        if (roleData.role === 'ADMIN') {
          setUserPermissions(['ALL']);
        } else {
          // Fetch user module permissions for MEMBER
          const { data: permissionsData } = await supabase
            .from('user_module_permissions')
            .select(`
              module_catalog_id,
              can_view,
              module_catalog!inner (
                module_key
              )
            `)
            .eq('user_id', userId)
            .eq('can_view', true);

          if (permissionsData) {
            const moduleKeys = permissionsData.map((p: any) => 
              p.module_catalog?.module_key?.toLowerCase()
            ).filter(Boolean);
            setUserPermissions(moduleKeys);
          }
        }
      }

      // Get all clinics the user has access to
      const { data: clinicsData } = await supabase
        .from('user_clinic_access')
        .select(`
          clinic_id,
          is_default,
          clinics (
            id,
            name
          )
        `)
        .eq('user_id', userId);

      if (clinicsData && clinicsData.length > 0) {
        const clinics = clinicsData
          .map((item: any) => item.clinics)
          .filter(Boolean) as Clinic[];
        
        setAvailableClinics(clinics);

        // Set selected clinic to default or first available
        const defaultClinic = clinicsData.find((item: any) => item.is_default);
        const clinic = defaultClinic?.clinics || clinics[0];
        
        if (clinic) {
          setSelectedClinic(clinic);
          setClinicId(clinic.id);
        }
      }
    } catch (error) {
      console.error('Error fetching user metadata:', error);
    }
  };

  const switchClinic = (newClinicId: string) => {
    const clinic = availableClinics.find(c => c.id === newClinicId);
    if (clinic) {
      setSelectedClinic(clinic);
      setClinicId(clinic.id);
      toast.success(`Clínica alterada para: ${clinic.name}`);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer metadata fetch to avoid blocking
        if (session?.user) {
          setTimeout(() => {
            fetchUserMetadata(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setClinicId(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserMetadata(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast.error('Erro ao criar conta', { description: error.message });
    } else {
      toast.success('Conta criada com sucesso!', { 
        description: 'Você já pode fazer login.' 
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error('Erro ao fazer login', { description: error.message });
    } else {
      toast.success('Login realizado com sucesso!');
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Erro ao sair', { description: error.message });
    } else {
      setUserRole(null);
      setClinicId(null);
      toast.success('Logout realizado com sucesso');
    }
  };

  const hasRole = (role: 'ADMIN' | 'MEMBER') => {
    return userRole === role;
  };

  const hasModuleAccess = (moduleKey: string) => {
    // ADMIN has access to all modules
    if (userRole === 'ADMIN' || userPermissions.includes('ALL')) {
      return true;
    }
    
    // Check if MEMBER has permission for this specific module
    return userPermissions.includes(moduleKey.toLowerCase());
  };

  const isAdmin = userRole === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userRole,
        clinicId,
        isAdmin,
        availableClinics,
        selectedClinic,
        userPermissions,
        switchClinic,
        hasRole,
        hasModuleAccess,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}