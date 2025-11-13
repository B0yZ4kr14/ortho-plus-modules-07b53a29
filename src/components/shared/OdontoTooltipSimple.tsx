import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getOdontoTooltip } from '@/core/tooltips/odonto-tooltips-data';

interface OdontoTooltipProps {
  moduleId: string;
  children?: React.ReactNode;
}

export function OdontoTooltip({ moduleId, children }: OdontoTooltipProps) {
  const data = getOdontoTooltip(moduleId);
  if (!data) return children || <HelpCircle className="h-4 w-4" />;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || <HelpCircle className="h-4 w-4 cursor-help" />}
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <h4 className="font-semibold">{data.title}</h4>
            <p className="text-xs">{data.definition}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
