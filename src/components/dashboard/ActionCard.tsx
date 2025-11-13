import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';

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
      className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 hover:scale-[1.05] active:scale-95 h-full overflow-hidden relative group"
      onClick={handleClick}
    >
      {/* Ripple effect */}
      {isRippling && (
        <span className="absolute inset-0 animate-ripple bg-primary/20 rounded-lg" />
      )}
      
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-6 h-full relative z-10">
        <div className="flex flex-col items-center text-center space-y-3 h-full">
          <div 
            className={`p-4 rounded-2xl ${bgColor} shadow-lg group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110`}
            style={{ width: 'fit-content' }}
          >
            <Icon className="h-8 w-8 text-white drop-shadow-md group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] transition-all duration-300" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-300">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
