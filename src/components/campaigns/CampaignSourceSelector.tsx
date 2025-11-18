/**
 * FASE 1 - SPRINT 2.1: SELETOR DE ORIGEM DE CAMPANHA
 * Componente para selecionar campanha, canal e origem do lead
 */

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CaptureChannel, DentalCampaign } from '@/types/patient-crm';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';

interface CampaignSourceSelectorProps {
  value: {
    campanha_origem_id: string | null;
    canal_captacao: CaptureChannel;
    origem_lead: string | null;
    evento_captacao: string | null;
  };
  onChange: (value: {
    campanha_origem_id: string | null;
    campanha_origem_nome: string | null;
    canal_captacao: CaptureChannel;
    origem_lead: string | null;
    evento_captacao: string | null;
  }) => void;
  clinicId: string;
  disabled?: boolean;
}

const CAPTURE_CHANNELS: { value: CaptureChannel; label: string }[] = [
  { value: 'GOOGLE_ADS', label: 'Google Ads' },
  { value: 'META_ADS', label: 'Facebook/Instagram Ads' },
  { value: 'GOOGLE_ORGANICO', label: 'Google Orgânico (SEO)' },
  { value: 'INDICACAO_PACIENTE', label: 'Indicação de Paciente' },
  { value: 'INDICACAO_DENTISTA', label: 'Indicação de Dentista' },
  { value: 'EVENTO_SAUDE', label: 'Evento de Saúde' },
  { value: 'TELEMARKETING', label: 'Telemarketing' },
  { value: 'WHATSAPP_BUSINESS', label: 'WhatsApp Business' },
  { value: 'LANDING_PAGE', label: 'Landing Page' },
  { value: 'CONVENIO', label: 'Convênio Odontológico' },
  { value: 'CLINICA_POPULAR', label: 'Clínica Popular' },
  { value: 'ORTODONTIA_ESTETICA', label: 'Campanha Ortodontia Estética' },
  { value: 'IMPLANTES', label: 'Campanha de Implantes' },
  { value: 'CLAREAMENTO', label: 'Campanha de Clareamento' },
  { value: 'OUTRO', label: 'Outro' },
];

export function CampaignSourceSelector({
  value,
  onChange,
  clinicId,
  disabled = false,
}: CampaignSourceSelectorProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<DentalCampaign | null>(null);

  // Buscar campanhas ativas da clínica (placeholder - backend implementará)
  const { data: campaigns = [], isLoading } = useQuery<DentalCampaign[]>({
    queryKey: ['campaigns', clinicId],
    queryFn: async () => {
      // Retornar array vazio por enquanto até backend implementar endpoint
      return [] as DentalCampaign[];
    },
    enabled: !!clinicId,
  });

  const handleCampaignChange = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    setSelectedCampaign(campaign || null);
    
    onChange({
      campanha_origem_id: campaignId,
      campanha_origem_nome: campaign?.nome || null,
      canal_captacao: value.canal_captacao,
      origem_lead: value.origem_lead,
      evento_captacao: value.evento_captacao,
    });
  };

  const handleChannelChange = (channel: CaptureChannel) => {
    onChange({
      ...value,
      campanha_origem_id: value.campanha_origem_id,
      campanha_origem_nome: selectedCampaign?.nome || null,
      canal_captacao: channel,
    });
  };

  const handleOriginChange = (origin: string) => {
    onChange({
      ...value,
      campanha_origem_id: value.campanha_origem_id,
      campanha_origem_nome: selectedCampaign?.nome || null,
      origem_lead: origin,
    });
  };

  const handleEventChange = (event: string) => {
    onChange({
      ...value,
      campanha_origem_id: value.campanha_origem_id,
      campanha_origem_nome: selectedCampaign?.nome || null,
      evento_captacao: event,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Campanha de Origem</Label>
        <Select
          value={value.campanha_origem_id || undefined}
          onValueChange={handleCampaignChange}
          disabled={disabled || isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma campanha (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma campanha específica</SelectItem>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.nome} ({campaign.tipo})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Canal de Captação *</Label>
        <Select
          value={value.canal_captacao}
          onValueChange={(v) => handleChannelChange(v as CaptureChannel)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o canal" />
          </SelectTrigger>
          <SelectContent>
            {CAPTURE_CHANNELS.map((channel) => (
              <SelectItem key={channel.value} value={channel.value}>
                {channel.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Origem do Lead</Label>
        <Input
          placeholder="Ex: Landing Page Implantes 2025"
          value={value.origem_lead || ''}
          onChange={(e) => handleOriginChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      {(value.canal_captacao === 'EVENTO_SAUDE' || value.canal_captacao === 'OUTRO') && (
        <div className="space-y-2">
          <Label>Evento de Captação</Label>
          <Input
            placeholder="Ex: Feira Odontológica São Paulo 2025"
            value={value.evento_captacao || ''}
            onChange={(e) => handleEventChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      {selectedCampaign && (
        <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
          <p className="font-medium">Detalhes da Campanha</p>
          <p className="text-muted-foreground">
            Investimento: R$ {selectedCampaign.investimento_total.toLocaleString('pt-BR')}
          </p>
          <p className="text-muted-foreground">
            Leads Gerados: {selectedCampaign.leads_gerados}
          </p>
          <p className="text-muted-foreground">
            Pacientes Convertidos: {selectedCampaign.pacientes_convertidos}
          </p>
          <p className="text-muted-foreground">
            ROI: {selectedCampaign.roi.toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}
