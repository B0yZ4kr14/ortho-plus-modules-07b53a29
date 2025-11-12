import { Search, Bell, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  const { user, signOut, userRole } = useAuth();

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getRoleName = (role: 'ADMIN' | 'MEMBER' | null) => {
    if (role === 'ADMIN') return 'Administrador';
    if (role === 'MEMBER') return 'Usuário';
    return 'Carregando...';
  };

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente, procedimento..."
            className="pl-10 bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="h-5 w-5 text-foreground cursor-pointer hover:text-primary transition-colors" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-destructive text-[10px]">
            3
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
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
    </header>
  );
}