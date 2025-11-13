import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse';
  message?: string;
  className?: string;
}

export function LoadingState({ 
  size = 'md', 
  variant = 'spinner', 
  message,
  className 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8', className)}>
        <div className={cn('bg-primary/20 rounded-full animate-pulse', sizeClasses[size])} />
        {message && <p className="text-sm text-muted-foreground mt-4">{message}</p>}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-8', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {message && <p className="text-sm text-muted-foreground mt-4">{message}</p>}
    </div>
  );
}
