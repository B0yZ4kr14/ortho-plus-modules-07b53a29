import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Clinic {
  id: string;
  name: string;
}

type UserProfile = 'ADMIN' | 'MEMBER' | 'PATIENT';

interface PatientUser {
  id: string;
  email: string;
  role: 'PATIENT';
}

interface AuthContextType {
  user: User | PatientUser | null;
  session: Session | string | null;
  loading: boolean;
  userRole: 'ADMIN' | 'MEMBER' | null;
  userProfile: UserProfile | null;
  clinicId: string | null;
  isAdmin: boolean;
  isMember: boolean;
  isPatient: boolean;
  availableClinics: Clinic[];
  selectedClinic: Clinic | null;
  userPermissions: string[];
  activeModules: string[]; // List of active module keys for the clinic
  switchClinic: (clinicId: string) => void;
  hasRole: (role: 'ADMIN' | 'MEMBER') => boolean;
  hasModuleAccess: (moduleKey: string) => boolean;
  fetchUserMetadata: (userId: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInPatient: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | PatientUser | null>(null);
  const [session, setSession] = useState<Session | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'ADMIN' | 'MEMBER' | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [availableClinics, setAvailableClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [activeModules, setActiveModules] = useState<string[]>([]); // Lista de module_keys ativos

  // Derived state moved to bottom to avoid redeclaration

  // Fetch user role and clinics
  const fetchUserMetadata = async (userId: string) => {
    try {
      // Get user role from user_roles table (novo sistema seguro)
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get profile data including avatar_url and clinic_id
      const { data: profileData } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, clinic_id')
        .eq('id', userId)
        .single();

      if (profileData?.clinic_id) {
        setClinicId(profileData.clinic_id);
        
        // Fetch clinic info
        const { data: clinicData } = await supabase
          .from('clinics')
          .select('*')
          .eq('id', profileData.clinic_id)
          .single();
        
        if (clinicData) {
          setSelectedClinic(clinicData);
          setAvailableClinics([clinicData]);
        }
      }

      // Definir role (ADMIN ou MEMBER)
      const role = roleData?.role || 'MEMBER';
      setUserRole(role as 'ADMIN' | 'MEMBER');
      setUserProfile(role as UserProfile);
        
      // Update user object with avatar and full_name (only for User type)
      setUser((currentUser) => {
        if (!currentUser || 'role' in currentUser) return currentUser;
        return {
          ...currentUser,
          user_metadata: {
            ...(currentUser as User).user_metadata,
            avatar_url: profileData?.avatar_url,
            full_name: profileData?.full_name || (currentUser as User).user_metadata?.full_name,
          }
        };
      });
        
      // If ADMIN, grant access to all modules
      if (role === 'ADMIN') {
        setUserPermissions(['ALL']);
        
        // Fetch active modules for admin
        if (profileData?.clinic_id) {
          await fetchActiveModules(profileData.clinic_id);
        }
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
        
        // Fetch active modules for member
        if (profileData?.clinic_id) {
          await fetchActiveModules(profileData.clinic_id);
        }
      }
    } catch (error) {
      console.error('Error fetching user metadata:', error);
    }
  };

  // Fetch active modules for the clinic
  const fetchActiveModules = async (clinicId: string) => {
    try {
      const { data, error } = await supabase
        .from('clinic_modules')
        .select('module_catalog:module_catalog_id(module_key)')
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      if (error) throw error;

      const moduleKeys = data
        ?.map((item: any) => item.module_catalog?.module_key)
        .filter(Boolean) || [];

      setActiveModules(moduleKeys);
    } catch (error) {
      console.error('Error fetching active modules:', error);
    }
  };

  const switchClinic = (newClinicId: string) => {
    const clinic = availableClinics.find(c => c.id === newClinicId);
    if (clinic) {
      setSelectedClinic(clinic);
      setClinicId(clinic.id);
      // Fetch active modules for the new clinic
      fetchActiveModules(clinic.id);
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

  const signInPatient = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('patient-auth', {
        body: { action: 'login', email, password },
      });

      if (error) throw error;

      localStorage.setItem('patient_token', data.token);
      localStorage.setItem('patient_session_id', data.sessionId);

      setUser(data.patient);
      setSession(data.token);
      setUserProfile('PATIENT');

      toast.success('Bem-vindo ao Portal do Paciente!');
      return { error: null };
    } catch (error: any) {
      toast.error('Erro ao fazer login: ' + error.message);
      return { error };
    }
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
    // Check if module is active for the clinic
    const isModuleActive = activeModules.includes(moduleKey);
    
    // ADMIN can see all active modules
    if (userRole === 'ADMIN') {
      return isModuleActive;
    }
    
    // MEMBER needs both module active AND user permission
    if (userRole === 'MEMBER') {
      const hasPermission = userPermissions.includes('ALL') || userPermissions.includes(moduleKey.toLowerCase());
      return isModuleActive && hasPermission;
    }
    
    return false;
  };

  // Derived state
  const isAdmin = userProfile === 'ADMIN';
  const isMember = userProfile === 'MEMBER';
  const isPatient = userProfile === 'PATIENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userRole,
        userProfile,
        clinicId,
        isAdmin,
        isMember,
        isPatient,
        availableClinics,
        selectedClinic,
        userPermissions,
        activeModules,
        switchClinic,
        hasRole,
        hasModuleAccess,
        fetchUserMetadata,
        signUp,
        signIn,
        signInPatient,
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