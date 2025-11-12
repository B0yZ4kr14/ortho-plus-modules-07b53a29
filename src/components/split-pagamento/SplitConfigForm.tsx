import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { z } from "zod";
import { useSplitSupabase } from "@/modules/split-pagamento/hooks/useSplitSupabase";

const splitConfigSchema = z.object({
  dentist_id: z.string().uuid("Selecione um dentista válido"),
  procedimento_id: z.string().uuid("Selecione um procedimento").optional().nullable(),
  percentual_dentista: z.number().min(0).max(100),
  percentual_clinica: z.number().min(0).max(100),
  tipo_split: z.enum(["PROCEDIMENTO", "GLOBAL"]),
  ativo: z.boolean()
}).refine(data => data.percentual_dentista + data.percentual_clinica === 100, {
  message: "A soma dos percentuais deve ser 100%",
  path: ["percentual_clinica"]
});

type SplitConfigFormData = z.infer<typeof splitConfigSchema>;

interface SplitConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dentistas: Array<{ id: string; nome: string }>;
  procedimentos: Array<{ id: string; nome: string }>;
  editingConfig?: any;
}

export function SplitConfigForm({ 
  open, 
  onOpenChange, 
  dentistas, 
  procedimentos,
  editingConfig 
}: SplitConfigFormProps) {
  const { createConfig, updateConfig } = useSplitSupabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SplitConfigFormData>>({
    dentist_id: editingConfig?.dentist_id || "",
    procedimento_id: editingConfig?.procedimento_id || null,
    percentual_dentista: editingConfig?.percentual_dentista || 50,
    percentual_clinica: editingConfig?.percentual_clinica || 50,
    tipo_split: editingConfig?.tipo_split || "PROCEDIMENTO",
    ativo: editingConfig?.ativo ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = splitConfigSchema.parse({
        ...formData,
        percentual_dentista: Number(formData.percentual_dentista),
        percentual_clinica: Number(formData.percentual_clinica)
      });

      if (editingConfig) {
        await updateConfig(editingConfig.id, validated);
      } else {
        await createConfig(validated);
      }

      onOpenChange(false);
      setFormData({
        dentist_id: "",
        procedimento_id: null,
        percentual_dentista: 50,
        percentual_clinica: 50,
        tipo_split: "PROCEDIMENTO",
        ativo: true
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao salvar configuração de split");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePercentualDentistaChange = (value: number) => {
    setFormData({
      ...formData,
      percentual_dentista: value,
      percentual_clinica: 100 - value
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingConfig ? "Editar" : "Nova"} Configuração de Split
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dentist">Dentista *</Label>
              <Select
                value={formData.dentist_id}
                onValueChange={(value) => setFormData({ ...formData, dentist_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dentista" />
                </SelectTrigger>
                <SelectContent>
                  {dentistas.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_split">Tipo de Split *</Label>
              <Select
                value={formData.tipo_split}
                onValueChange={(value: "PROCEDIMENTO" | "GLOBAL") => 
                  setFormData({ ...formData, tipo_split: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROCEDIMENTO">Por Procedimento</SelectItem>
                  <SelectItem value="GLOBAL">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.tipo_split === "PROCEDIMENTO" && (
            <div className="space-y-2">
              <Label htmlFor="procedimento">Procedimento *</Label>
              <Select
                value={formData.procedimento_id || ""}
                onValueChange={(value) => setFormData({ ...formData, procedimento_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o procedimento" />
                </SelectTrigger>
                <SelectContent>
                  {procedimentos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percentual_dentista">Percentual Dentista (%) *</Label>
              <Input
                id="percentual_dentista"
                type="number"
                min="0"
                max="100"
                value={formData.percentual_dentista}
                onChange={(e) => handlePercentualDentistaChange(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentual_clinica">Percentual Clínica (%) *</Label>
              <Input
                id="percentual_clinica"
                type="number"
                min="0"
                max="100"
                value={formData.percentual_clinica}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo">Configuração Ativa</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : editingConfig ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
