import { Search, Bell, LogOut, Building2, Palette } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemePreview } from "@/components/ThemePreview";

export function DashboardHeader() {
  const { user, signOut, userRole, availableClinics, selectedClinic, switchClinic } = useAuth();

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getRoleName = (role: 'ADMIN' | 'MEMBER' | null) => {
    if (role === 'ADMIN') return 'Administrador';
    if (role === 'MEMBER') return 'Usuário';
    return 'Carregando...';
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm px-6 flex items-center justify-between">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente, procedimento..."
            className="pl-10 bg-muted/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Preview Dialog */}
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
        {/* Seletor de Clínica - só aparece se usuário tiver acesso a múltiplas clínicas */}
        {availableClinics && availableClinics.length > 1 && (
          <div className="flex items-center gap-2 mr-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedClinic?.id}
              onValueChange={switchClinic}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione a clínica" />
              </SelectTrigger>
              <SelectContent>
                {availableClinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            variant="destructive"
          >
            3
          </Badge>
        </Button>

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