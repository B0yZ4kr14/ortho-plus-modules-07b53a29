import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClassName?: string;
}

export function PageHeader({ icon: Icon, title, description, iconClassName = '' }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-lg bg-primary/10 ${iconClassName}`}>
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}
