import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  bgColor: string;
  route: string;
}

export function ActionCard({ title, subtitle, icon: Icon, bgColor, route }: ActionCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 hover:scale-105 active:scale-95"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div 
            className={`p-4 rounded-2xl ${bgColor} shadow-lg hover:shadow-2xl transition-shadow duration-300`}
            style={{ width: 'fit-content' }}
          >
            <Icon className="h-8 w-8 text-white drop-shadow-md" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
