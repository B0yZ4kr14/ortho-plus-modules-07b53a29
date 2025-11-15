import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionCardMemoProps {
  title: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'blue' | 'purple' | 'yellow' | 'green';
}

// ✅ FASE 3: Componente otimizado com React.memo
export const ActionCardMemo = memo(function ActionCardMemo({
  title,
  icon: Icon,
  onClick,
  variant = 'blue'
}: ActionCardMemoProps) {
  const variantStyles = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    green: 'bg-green-500 hover:bg-green-600',
  };

  return (
    <Card 
      onClick={onClick}
      className="cursor-pointer transition-all hover:scale-105 hover:shadow-xl group overflow-hidden"
    >
      <CardContent className="p-0">
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className={cn(
            'rounded-2xl p-4 transition-colors',
            variantStyles[variant]
          )}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <p className="text-sm font-semibold text-center group-hover:text-primary transition-colors">
            {title}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
