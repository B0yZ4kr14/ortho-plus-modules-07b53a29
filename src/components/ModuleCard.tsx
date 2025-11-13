import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
}

export function ModuleCard({ title, subtitle, icon: Icon, color, onClick }: ModuleCardProps) {
  return (
    <Card
      variant="interactive"
      depth="normal"
      className="p-6 hover:-translate-y-1 active:translate-y-0"
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110", color)}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </Card>
  );
}
