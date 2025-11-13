import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { AnaliseComplete } from '../types/radiografia.types';
import { tipoRadiografiaLabels } from '../types/radiografia.types';

interface ComparativoPDFExportProps {
  analise1: AnaliseComplete;
  analise2: AnaliseComplete;
  comparacao: {
    problemas: { valor: number; percentual: string; tendencia: string };
    precisao: { valor: string; tendencia: string };
    diasEntre: number;
  };
}

export function ComparativoPDFExport({ analise1, analise2, comparacao }: ComparativoPDFExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = async () => {
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Título
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório Comparativo de Radiografias', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Logo Ortho+
      pdf.setFontSize(12);
      pdf.setTextColor(0, 150, 136);
      pdf.text('Ortho+', pageWidth / 2, yPosition, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      // Informações do Paciente
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Informações do Paciente', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Nome: ${analise1.patient_name}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Data do Relatório: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 10;

      // Linha separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Seção de Análise Comparativa
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Análise Comparativa', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Período entre análises
      pdf.text(`Período entre análises: ${comparacao.diasEntre} dias`, margin, yPosition);
      yPosition += 6;

      // Problemas detectados
      const problemasCor = comparacao.problemas.valor < 0 ? [34, 197, 94] : comparacao.problemas.valor > 0 ? [239, 68, 68] : [107, 114, 128];
      pdf.setTextColor(problemasCor[0], problemasCor[1], problemasCor[2]);
      pdf.text(
        `Problemas Detectados: ${comparacao.problemas.valor > 0 ? '+' : ''}${comparacao.problemas.valor} (${comparacao.problemas.percentual}% ${comparacao.problemas.tendencia})`,
        margin,
        yPosition
      );
      pdf.setTextColor(0, 0, 0);
      yPosition += 6;

      // Precisão da IA
      const precisaoCor = comparacao.precisao.tendencia === 'melhorou' ? [34, 197, 94] : comparacao.precisao.tendencia === 'piorou' ? [239, 68, 68] : [107, 114, 128];
      pdf.setTextColor(precisaoCor[0], precisaoCor[1], precisaoCor[2]);
      pdf.text(
        `Precisão da IA: ${Number(comparacao.precisao.valor) > 0 ? '+' : ''}${comparacao.precisao.valor}% (${comparacao.precisao.tendencia})`,
        margin,
        yPosition
      );
      pdf.setTextColor(0, 0, 0);
      yPosition += 12;

      // Interpretação
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Interpretação:', margin, yPosition);
      yPosition += 6;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const interpretacao = 
        comparacao.problemas.valor < 0 
          ? `Evolução positiva: Redução de ${Math.abs(comparacao.problemas.valor)} problema(s) detectado(s).`
          : comparacao.problemas.valor > 0
          ? `Atenção necessária: Aumento de ${comparacao.problemas.valor} problema(s) detectado(s).`
          : 'Situação estável: Número de problemas manteve-se constante.';
      
      const splitText = pdf.splitTextToSize(interpretacao, pageWidth - 2 * margin);
      pdf.text(splitText, margin, yPosition);
      yPosition += (splitText.length * 5) + 10;

      // Nova página para as radiografias
      pdf.addPage();
      yPosition = margin;

      // Título da seção de radiografias
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Comparação Visual das Radiografias', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 12;

      // Primeira Radiografia
      pdf.setFontSize(12);
      pdf.text('Primeira Análise', margin, yPosition);
      yPosition += 6;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${new Date(analise1.created_at).toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 4;
      pdf.text(`Tipo: ${tipoRadiografiaLabels[analise1.tipo_radiografia as keyof typeof tipoRadiografiaLabels]}`, margin, yPosition);
      yPosition += 4;
      pdf.text(`Problemas: ${analise1.problemas_detectados || 0}`, margin, yPosition);
      yPosition += 4;
      pdf.text(`Precisão IA: ${analise1.confidence_score ? Math.round(analise1.confidence_score) : 0}%`, margin, yPosition);
      yPosition += 8;

      // Carregar e adicionar imagem 1
      try {
        const img1 = new Image();
        img1.crossOrigin = 'anonymous';
        img1.src = analise1.imagem_url;
        await new Promise((resolve) => { img1.onload = resolve; });
        
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (img1.height / img1.width) * imgWidth;
        const maxHeight = 60;
        const finalHeight = Math.min(imgHeight, maxHeight);
        
        pdf.addImage(img1, 'JPEG', margin, yPosition, imgWidth, finalHeight);
        yPosition += finalHeight + 15;
      } catch (error) {
        console.error('Erro ao carregar imagem 1:', error);
        pdf.text('[Imagem não disponível]', margin, yPosition);
        yPosition += 10;
      }

      // Segunda Radiografia
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Segunda Análise', margin, yPosition);
      yPosition += 6;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${new Date(analise2.created_at).toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 4;
      pdf.text(`Tipo: ${tipoRadiografiaLabels[analise2.tipo_radiografia as keyof typeof tipoRadiografiaLabels]}`, margin, yPosition);
      yPosition += 4;
      pdf.text(`Problemas: ${analise2.problemas_detectados || 0}`, margin, yPosition);
      yPosition += 4;
      pdf.text(`Precisão IA: ${analise2.confidence_score ? Math.round(analise2.confidence_score) : 0}%`, margin, yPosition);
      yPosition += 8;

      // Carregar e adicionar imagem 2
      try {
        const img2 = new Image();
        img2.crossOrigin = 'anonymous';
        img2.src = analise2.imagem_url;
        await new Promise((resolve) => { img2.onload = resolve; });
        
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (img2.height / img2.width) * imgWidth;
        const maxHeight = 60;
        const finalHeight = Math.min(imgHeight, maxHeight);
        
        pdf.addImage(img2, 'JPEG', margin, yPosition, imgWidth, finalHeight);
        yPosition += finalHeight + 10;
      } catch (error) {
        console.error('Erro ao carregar imagem 2:', error);
        pdf.text('[Imagem não disponível]', margin, yPosition);
        yPosition += 10;
      }

      // Rodapé
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Ortho+ | Relatório Comparativo de Radiografias | Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Salvar PDF
      const fileName = `comparativo_${analise1.patient_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="elevated"
      onClick={generatePDF}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          Exportar Comparação em PDF
        </>
      )}
    </Button>
  );
}
