import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  dateFrom?: Date;
  dateTo?: Date;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangePickerProps) {
  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[180px] justify-start text-left font-normal',
              !dateFrom && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateFrom ? format(dateFrom, 'PPP', { locale: ptBR }) : 'Data inicial'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateFrom}
            onSelect={onDateFromChange}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[180px] justify-start text-left font-normal',
              !dateTo && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateTo ? format(dateTo, 'PPP', { locale: ptBR }) : 'Data final'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateTo}
            onSelect={onDateToChange}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
