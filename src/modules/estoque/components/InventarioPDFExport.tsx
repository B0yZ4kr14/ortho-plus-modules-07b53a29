import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Inventario, InventarioItem } from '../types/estoque.types';

export async function exportInventarioPDF(
  inventario: Inventario,
  items: InventarioItem[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Divergências de Inventário', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Inventário: ${inventario.numero}`, 14, 35);
  doc.text(`Data: ${new Date(inventario.data).toLocaleDateString('pt-BR')}`, 14, 42);
  doc.text(`Tipo: ${inventario.tipo}`, 14, 49);
  doc.text(`Responsável: ${inventario.responsavel}`, 14, 56);
  
  // Resumo Executivo
  const divergencias = items.filter(item => item.divergencia !== 0);
  const totalValorDivergencias = divergencias.reduce(
    (acc, item) => acc + Math.abs(item.valorDivergencia || 0),
    0
  );
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Executivo', 14, 70);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const resumoData = [
    ['Total de Itens Inventariados', inventario.totalItens?.toString() || '0'],
    ['Itens Contados', inventario.itensContados?.toString() || '0'],
    ['Divergências Encontradas', inventario.divergenciasEncontradas?.toString() || '0'],
    ['Valor Total das Divergências', `R$ ${totalValorDivergencias.toFixed(2)}`],
    ['Acuracidade', `${((1 - (divergencias.length / items.length)) * 100).toFixed(1)}%`],
  ];
  
  autoTable(doc, {
    startY: 75,
    head: [['Métrica', 'Valor']],
    body: resumoData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  // Tabela de Divergências
  if (divergencias.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalhamento de Divergências', 14, 20);
    
    const divergenciasData = divergencias.map(item => [
      item.produtoNome,
      item.lote || '-',
      item.quantidadeSistema.toString(),
      item.quantidadeFisica?.toString() || '-',
      item.divergencia?.toString() || '0',
      `${item.percentualDivergencia?.toFixed(1) || '0'}%`,
      `R$ ${Math.abs(item.valorDivergencia || 0).toFixed(2)}`,
      getCriticidade(Math.abs(item.percentualDivergencia || 0)),
    ]);
    
    autoTable(doc, {
      startY: 30,
      head: [['Produto', 'Lote', 'Sistema', 'Físico', 'Diverg.', '%', 'Valor', 'Criticidade']],
      body: divergenciasData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'right' },
        7: { halign: 'center' },
      },
    });
  }
  
  // Gráfico de Criticidade (texto)
  doc.addPage();
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Análise de Criticidade', 14, 20);
  
  const alta = divergencias.filter(d => Math.abs(d.percentualDivergencia || 0) >= 20).length;
  const media = divergencias.filter(d => {
    const perc = Math.abs(d.percentualDivergencia || 0);
    return perc >= 10 && perc < 20;
  }).length;
  const baixa = divergencias.filter(d => Math.abs(d.percentualDivergencia || 0) < 10).length;
  
  const criticidadeData = [
    ['Alta (≥20%)', alta.toString(), `${((alta / divergencias.length) * 100).toFixed(1)}%`],
    ['Média (10-20%)', media.toString(), `${((media / divergencias.length) * 100).toFixed(1)}%`],
    ['Baixa (<10%)', baixa.toString(), `${((baixa / divergencias.length) * 100).toFixed(1)}%`],
  ];
  
  autoTable(doc, {
    startY: 30,
    head: [['Criticidade', 'Quantidade', 'Percentual']],
    body: criticidadeData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  // Recomendações
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recomendações', 14, (doc as any).lastAutoTable.finalY + 20);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  let yPos = (doc as any).lastAutoTable.finalY + 30;
  
  const recomendacoes = [
    '• Revisar processos de entrada e saída de produtos com divergências altas',
    '• Implementar inventários cíclicos mais frequentes para itens críticos',
    '• Treinar equipe sobre importância do controle de estoque',
    '• Considerar uso de scanner de código de barras para reduzir erros',
    '• Implementar sistema de auditoria para movimentações de alto valor',
  ];
  
  recomendacoes.forEach(rec => {
    doc.text(rec, 14, yPos, { maxWidth: pageWidth - 28 });
    yPos += 7;
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }
  
  // Salvar PDF
  doc.save(`inventario-divergencias-${inventario.numero}.pdf`);
}

function getCriticidade(percentual: number): string {
  if (percentual >= 20) return 'Alta';
  if (percentual >= 10) return 'Média';
  return 'Baixa';
}
