import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TISSGuideForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Guia TISS</CardTitle>
        <CardDescription>
          Preencha os dados da guia de atendimento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="patient">Paciente</Label>
            <Select>
              <SelectTrigger id="patient">
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">João Silva</SelectItem>
                <SelectItem value="2">Maria Santos</SelectItem>
                <SelectItem value="3">Pedro Costa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurance">Convênio</Label>
            <Select>
              <SelectTrigger id="insurance">
                <SelectValue placeholder="Selecione o convênio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unimed">Unimed</SelectItem>
                <SelectItem value="bradesco">Bradesco Saúde</SelectItem>
                <SelectItem value="amil">Amil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="guide-number">Número da Guia</Label>
            <Input
              id="guide-number"
              placeholder="2025110001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="procedure">Procedimento</Label>
            <Select>
              <SelectTrigger id="procedure">
                <SelectValue placeholder="Selecione o procedimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="81000030">Consulta</SelectItem>
                <SelectItem value="82000107">Limpeza</SelectItem>
                <SelectItem value="83000018">Restauração</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar Guia</Button>
        </div>
      </CardContent>
    </Card>
  );
}
