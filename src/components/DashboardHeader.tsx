import { LogOut, Building2, Palette } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/GlobalSearch";
import { HotkeysHelp } from "@/components/HotkeysHelp";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemePreview } from "@/components/ThemePreview";
import { Breadcrumbs } from "@/components/Breadcrumbs";
export function DashboardHeader() {
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
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm shrink-0">
        {/* Top row with search and user menu */}
        <div className="h-16 px-4 lg:px-6 flex items-center gap-4 mx-[34px]">
          {/* Centralizar a busca */}
          <div className="flex-1 flex justify-center" data-tour="search-bar">
            <GlobalSearch />
          </div>

          {/* Right side: Notifications, Theme, Clinic Selector and User Menu */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <NotificationDropdown />

            {/* Theme Preview Dialog */}
            <div data-tour="theme-toggle">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Palette className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Escolher Tema
                    </DialogTitle>
                    <DialogDescription>
                      Selecione o tema visual que melhor se adapta à sua preferência. As alterações são aplicadas instantaneamente.
                    </DialogDescription>
                  </DialogHeader>
                  <ThemePreview />
                </DialogContent>
              </Dialog>

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>

            {/* Seletor de Clínica - só aparece se usuário tiver acesso a múltiplas clínicas */}
            {availableClinics && availableClinics.length > 1 && <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedClinic?.id} onValueChange={switchClinic}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Selecione a clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClinics.map(clinic => <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div data-tour="user-menu">
                  <Button variant="ghost" className="flex items-center gap-3 hover:bg-accent">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {user?.email?.split('@')[0] || 'Usuário'}
                      </p>
                      <p className="text-xs text-muted-foreground">{getRoleName(userRole)}</p>
                    </div>
                    <Avatar className="h-9 w-9 bg-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {user?.email ? getInitials(user.email) : 'US'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">{getRoleName(userRole)}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Breadcrumbs row */}
        <div className="h-8 px-4 flex-col items-center border-t border-border/40 bg-muted/10 rounded mx-[99px] lg:px-0 py-0">
          <Breadcrumbs />
        </div>
      </header>
    </>;
}