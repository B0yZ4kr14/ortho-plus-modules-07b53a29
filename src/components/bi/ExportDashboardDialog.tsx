import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Download, Calendar, Mail } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api/apiClient";

interface ExportDashboardDialogProps {
  dashboardName: string;
  data: any[];
}

export function ExportDashboardDialog({
  dashboardName,
  data,
}: ExportDashboardDialogProps) {
  const [format, setFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [scheduleExport, setScheduleExport] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
    "weekly",
  );
  const [email, setEmail] = useState("");

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text("ORTHO + Business Intelligence", margin, yPos);

    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(dashboardName, margin, yPos);

    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, margin, yPos);

    yPos += 15;
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 15;

    // Data Summary
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Resumo dos Dados", margin, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(60);

    if (data && data.length > 0) {
      // Exibir os primeiros 10 itens dos dados
      const displayData = data.slice(0, 10);
      displayData.forEach((item, index) => {
        const text = Object.entries(item)
          .map(([key, value]) => `${key}: ${value}`)
          .join(" | ");

        doc.text(`${index + 1}. ${text}`, margin, yPos);
        yPos += 6;

        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });

      if (data.length > 10) {
        yPos += 5;
        doc.setTextColor(100);
        doc.text(`... e mais ${data.length - 10} registros`, margin, yPos);
      }
    } else {
      doc.text("Nenhum dado disponível para exibição", margin, yPos);
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      "Relatório gerado automaticamente pelo sistema ORTHO + BI",
      pageWidth / 2,
      footerY,
      { align: "center" },
    );

    doc.save(`${dashboardName.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  const exportToExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Dados");

      XLSX.writeFile(
        wb,
        `${dashboardName.replace(/\s+/g, "_")}_${Date.now()}.xlsx`,
      );
      toast.success("Excel exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      toast.error("Erro ao exportar para Excel");
    }
  };

  const exportToCSV = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${dashboardName.replace(/\s+/g, "_")}_${Date.now()}.csv`,
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast.error("Erro ao exportar para CSV");
    }
  };

  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error("Nenhum dado disponível para exportação");
      return;
    }

    switch (format) {
      case "pdf":
        exportToPDF();
        break;
      case "excel":
        exportToExcel();
        break;
      case "csv":
        exportToCSV();
        break;
    }
  };

  const handleScheduleExport = async () => {
    if (!email) {
      toast.error("Digite um email para agendamento");
      return;
    }

    try {
      const data = await apiClient.post<any>(
        "/functions/v1/schedule-bi-export",
        {
          dashboardName,
          exportFormat: format,
          frequency,
          email,
        },
      );

      toast.success(
        data.message ||
          `Exportação agendada com sucesso! Você receberá relatórios ${
            frequency === "daily"
              ? "diariamente"
              : frequency === "weekly"
                ? "semanalmente"
                : "mensalmente"
          } em ${email}`,
      );
    } catch (error: any) {
      console.error("Erro ao agendar exportação:", error);
      toast.error(error.message || "Erro ao agendar exportação");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Dashboard</DialogTitle>
          <DialogDescription>
            Escolha o formato e configure o agendamento automático
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Formato de Exportação</Label>
            <Select
              value={format}
              onValueChange={(value: any) => setFormat(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF (Relatório Formatado)</SelectItem>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV (Planilha)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Agendar Exportação Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Receba relatórios periodicamente por email
                </p>
              </div>
              <Switch
                checked={scheduleExport}
                onCheckedChange={setScheduleExport}
              />
            </div>

            {scheduleExport && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select
                    value={frequency}
                    onValueChange={(value: any) => setFrequency(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Diário
                        </div>
                      </SelectItem>
                      <SelectItem value="weekly">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Semanal
                        </div>
                      </SelectItem>
                      <SelectItem value="monthly">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Mensal
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Email de Destino</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleScheduleExport}
                  className="w-full"
                  variant="secondary"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Confirmar Agendamento
                </Button>
              </div>
            )}
          </div>

          <Button onClick={handleExport} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Exportar Agora
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
