import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { z } from "zod";
import { useFidelidadeSupabase } from "@/modules/fidelidade/hooks/useFidelidadeSupabase";

const recompensaSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  pontos_necessarios: z.number().min(1, "Mínimo de 1 ponto"),
  tipo: z.enum(["BRINDE", "DESCONTO_PERCENTUAL", "DESCONTO_VALOR", "PROCEDIMENTO_GRATIS"]),
  valor_desconto: z.number().optional().nullable(),
  procedimento_id: z.string().uuid().optional().nullable(),
  ativo: z.boolean()
});

type RecompensaFormData = z.infer<typeof recompensaSchema>;

interface RecompensaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedimentos: Array<{ id: string; nome: string }>;
  editingRecompensa?: any;
}

export function RecompensaForm({ 
  open, 
  onOpenChange, 
  procedimentos,
  editingRecompensa 
}: RecompensaFormProps) {
  const { createRecompensa, updateRecompensa } = useFidelidadeSupabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<RecompensaFormData>>({
    nome: editingRecompensa?.nome || "",
    descricao: editingRecompensa?.descricao || "",
    pontos_necessarios: editingRecompensa?.pontos_necessarios || 100,
    tipo: editingRecompensa?.tipo || "BRINDE",
    valor_desconto: editingRecompensa?.valor_desconto || null,
    procedimento_id: editingRecompensa?.procedimento_id || null,
    ativo: editingRecompensa?.ativo ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = recompensaSchema.parse({
        ...formData,
        pontos_necessarios: Number(formData.pontos_necessarios),
        valor_desconto: formData.valor_desconto ? Number(formData.valor_desconto) : null
      });

      if (editingRecompensa) {
        await updateRecompensa(editingRecompensa.id, validated);
      } else {
        await createRecompensa(validated);
      }

      onOpenChange(false);
      setFormData({
        nome: "",
        descricao: "",
        pontos_necessarios: 100,
        tipo: "BRINDE",
        valor_desconto: null,
        procedimento_id: null,
        ativo: true
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao salvar recompensa");
      }
    } finally {
      setLoading(false);
    }
  };

  const tipoLabels = {
    BRINDE: "Brinde",
    DESCONTO_PERCENTUAL: "Desconto Percentual",
    DESCONTO_VALOR: "Desconto em Valor",
    PROCEDIMENTO_GRATIS: "Procedimento Grátis"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingRecompensa ? "Editar" : "Nova"} Recompensa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Recompensa *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Limpeza Grátis"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva os detalhes da recompensa..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pontos_necessarios">Pontos Necessários *</Label>
              <Input
                id="pontos_necessarios"
                type="number"
                min="1"
                value={formData.pontos_necessarios}
                onChange={(e) => setFormData({ ...formData, pontos_necessarios: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Recompensa *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(formData.tipo === "DESCONTO_PERCENTUAL" || formData.tipo === "DESCONTO_VALOR") && (
            <div className="space-y-2">
              <Label htmlFor="valor_desconto">
                Valor do Desconto {formData.tipo === "DESCONTO_PERCENTUAL" ? "(%)" : "(R$)"} *
              </Label>
              <Input
                id="valor_desconto"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor_desconto || ""}
                onChange={(e) => setFormData({ ...formData, valor_desconto: Number(e.target.value) })}
                required
              />
            </div>
          )}

          {formData.tipo === "PROCEDIMENTO_GRATIS" && (
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

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo">Recompensa Ativa</Label>
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
              {loading ? "Salvando..." : editingRecompensa ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
