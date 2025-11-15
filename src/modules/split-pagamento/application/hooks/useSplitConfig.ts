import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export const useSplitConfig = () => {
  const { clinicId } = useAuth();

  const { data: config, isLoading } = useQuery({
    queryKey: ['split-config', clinicId],
    queryFn: async () => null,
    enabled: !!clinicId,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['split-transactions', clinicId],
    queryFn: async () => [],
    enabled: !!clinicId,
  });

  return {
    config,
    transactions,
    isLoading,
  };
};
