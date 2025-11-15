import React, { createContext, useContext, useState, ReactNode } from 'react';
import { startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';

interface AgendaContextData {
  currentDate: Date;
  viewMode: 'day' | 'week' | 'month';
  selectedDentistId: string | null;
  weekStart: Date;
  weekEnd: Date;
  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: 'day' | 'week' | 'month') => void;
  setSelectedDentistId: (id: string | null) => void;
  goToToday: () => void;
  goToNextWeek: () => void;
  goToPreviousWeek: () => void;
}

const AgendaContext = createContext<AgendaContextData | undefined>(undefined);

interface AgendaProviderProps {
  children: ReactNode;
}

export function AgendaProvider({ children }: AgendaProviderProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDentistId, setSelectedDentistId] = useState<string | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const goToPreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  return (
    <AgendaContext.Provider
      value={{
        currentDate,
        viewMode,
        selectedDentistId,
        weekStart,
        weekEnd,
        setCurrentDate,
        setViewMode,
        setSelectedDentistId,
        goToToday,
        goToNextWeek,
        goToPreviousWeek,
      }}
    >
      {children}
    </AgendaContext.Provider>
  );
}

export function useAgenda() {
  const context = useContext(AgendaContext);
  if (!context) {
    throw new Error('useAgenda must be used within AgendaProvider');
  }
  return context;
}
