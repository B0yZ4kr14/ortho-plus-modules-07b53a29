import { PageHeader } from '@/components/shared/PageHeader';
import { OnboardingAnalyticsDashboard } from '@/components/modules/OnboardingAnalyticsDashboard';
import { BarChart3 } from 'lucide-react';

export default function OnboardingAnalytics() {
  return (
    <div className="flex-1 space-y-8 p-8">
      <PageHeader
        icon={BarChart3}
        title="Analytics de Onboarding"
        description="Acompanhe métricas de conclusão, tempo médio e identificação de drop-offs"
      />
      
      <OnboardingAnalyticsDashboard />
    </div>
  );
}
