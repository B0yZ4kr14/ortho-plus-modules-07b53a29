import { LogOut, Building2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/GlobalSearch";
import { HotkeysHelp } from "@/components/HotkeysHelp";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  className?: string;
  onMenuClick?: () => void;
}

export function DashboardHeader({ className, onMenuClick }: DashboardHeaderProps = {}) {
  const {
    user,
    signOut,
    userRole,
    availableClinics,
    selectedClinic,
    switchClinic
  } = useAuth();
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };
  const getRoleName = (role: 'ADMIN' | 'MEMBER' | null) => {
    if (role === 'ADMIN') return 'Administrador';
    if (role === 'MEMBER') return 'Usuário';
    return 'Carregando...';
  };
  return <>
      <HotkeysHelp />
      <header className={cn("sticky top-0 z-50 w-full bg-card/95 backdrop-blur-xl shadow-2xl border-0 rounded-b-3xl supports-[backdrop-filter]:bg-card/80", className)}>
        <div className="flex items-center justify-between h-16 px-6 gap-6">
          {/* Mobile menu button - shown only on mobile */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden min-h-[44px] min-w-[44px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          )}

          {/* Search - left aligned with max-width */}
          <div className="flex-1 max-w-md hidden md:block" data-tour="search-bar">
            <GlobalSearch />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <NotificationDropdown />

            <div data-tour="theme-toggle">
              <ThemeToggle />
            </div>

            {availableClinics && availableClinics.length > 1 && (
              <Select value={selectedClinic?.id} onValueChange={switchClinic}>
                <SelectTrigger className="w-[180px] h-9">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Clínica" />
                </SelectTrigger>
                <SelectContent>
                  {availableClinics.map(clinic => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-9 px-2" data-tour="user-menu">
                  <Avatar className="h-7 w-7 bg-primary border-2 border-primary/20">
                    {user?.user_metadata?.avatar_url && (
                      <AvatarImage 
                        src={user.user_metadata.avatar_url} 
                        alt={user?.user_metadata?.full_name || user?.email || 'Avatar'} 
                      />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {user?.email ? getInitials(user.email) : 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs font-medium">
                      {user?.email?.split('@')[0] || 'Usuário'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{getRoleName(userRole)}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">{getRoleName(userRole)}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="/settings/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="bg-gradient-to-br from-muted/30 to-muted/10 px-6 py-3 mx-4 mb-2 rounded-2xl shadow-lg backdrop-blur-sm">
          <Breadcrumbs />
        </div>
      </header>
    </>;
}