import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Heart, Activity, Package, FileText } from 'lucide-react';

interface PatientFormTabsProps {
  children: React.ReactNode[];
}

export function PatientFormTabs({ children }: PatientFormTabsProps) {
  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-6 mb-6">
        <TabsTrigger value="personal" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Pessoal</span>
        </TabsTrigger>
        <TabsTrigger value="contact" className="gap-2">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">Contato</span>
        </TabsTrigger>
        <TabsTrigger value="medical" className="gap-2">
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Médico</span>
        </TabsTrigger>
        <TabsTrigger value="habits" className="gap-2">
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline">Hábitos</span>
        </TabsTrigger>
        <TabsTrigger value="dental" className="gap-2">
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Odonto</span>
        </TabsTrigger>
        <TabsTrigger value="other" className="gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Outros</span>
        </TabsTrigger>
      </TabsList>

      {children.map((child, index) => {
        const tabValue = ['personal', 'contact', 'medical', 'habits', 'dental', 'other'][index];
        return (
          <TabsContent key={tabValue} value={tabValue} className="space-y-6 mt-6">
            {child}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
