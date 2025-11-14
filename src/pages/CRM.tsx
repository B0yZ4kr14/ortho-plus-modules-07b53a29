import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Phone, Mail, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  estimated_value: number;
  conversion_probability: number;
  next_follow_up_date: string;
  created_at: string;
}

const CRM = () => {
  const { clinicId, hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const isAdmin = hasRole('ADMIN');

  const { data: leads, isLoading } = useQuery({
    queryKey: ['crm-leads', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!clinicId,
  });

  const { data: stats } = useQuery({
    queryKey: ['crm-stats', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_leads')
        .select('status, estimated_value')
        .eq('clinic_id', clinicId);
      
      if (error) throw error;
      
      const totalLeads = data.length;
      const converted = data.filter(l => l.status === 'convertido').length;
      const totalValue = data.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
      const conversionRate = totalLeads > 0 ? (converted / totalLeads * 100).toFixed(1) : '0';
      
      return { totalLeads, converted, totalValue, conversionRate };
    },
    enabled: !!clinicId,
  });

  const filteredLeads = leads?.filter(lead =>
    lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone?.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      novo: { label: "Novo", variant: "default" },
      contatado: { label: "Contatado", variant: "secondary" },
      qualificado: { label: "Qualificado", variant: "outline" },
      convertido: { label: "Convertido", variant: "default" },
      perdido: { label: "Perdido", variant: "destructive" },
    };
    const config = variants[status] || variants.novo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Acesso restrito a administradores.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM - Funil de Vendas</h1>
          <p className="text-muted-foreground">Gerencie leads e oportunidades</p>
        </div>
        <Button onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.converted || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.conversionRate || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Potencial</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(stats?.totalValue || 0).toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar leads por nome, email ou telefone..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Leads List */}
      <div className="grid gap-4">
        {filteredLeads?.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{lead.full_name}</h3>
                    {getStatusBadge(lead.status)}
                    {lead.conversion_probability && (
                      <Badge variant="outline">
                        {lead.conversion_probability}% chance
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {lead.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </div>
                    )}
                    {lead.next_follow_up_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Próximo follow-up: {new Date(lead.next_follow_up_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>

                  {lead.estimated_value && (
                    <div className="text-sm font-medium">
                      Valor estimado: R$ {lead.estimated_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredLeads?.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhum lead encontrado.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CRM;
