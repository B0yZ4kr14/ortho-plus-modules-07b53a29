import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  bgColor: string;
  route: string;
}

export function ActionCard({ title, subtitle, icon: Icon, bgColor, route }: ActionCardProps) {
  const navigate = useNavigate();
  const [isRippling, setIsRippling] = useState(false);

  const handleClick = () => {
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 600);
    
    setTimeout(() => {
      navigate(route);
      toast.success(`Navegando para ${title}`);
    }, 150);
  };

  return (
    <Card 
      variant="interactive"
      depth="normal"
      className="group overflow-hidden relative h-full min-h-[140px]"
      onClick={handleClick}
    >
      {/* Ripple effect */}
      {isRippling && (
        <span className="absolute inset-0 animate-ripple bg-primary/20 rounded-lg" />
      )}
      
      <CardContent className="p-4 h-full relative flex flex-col items-center justify-center text-center gap-3">
        <div className={cn(
          "p-3.5 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3",
          bgColor
        )}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div className="space-y-0.5">
          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
