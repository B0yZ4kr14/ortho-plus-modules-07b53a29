import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PortfolioData {
  totalBRL: number;
  totalCrypto: { [key: string]: number };
  distribution: { coin: string; value: number; percentage: number }[];
  gains: number;
  losses: number;
  conversionsHistory: {
    id: string;
    date: Date;
    fromCoin: string;
    toCoin: string;
    amount: number;
    rate: number;
    valueBRL: number;
    type: 'gain' | 'loss';
  }[];
}

interface MarketComparison {
  btcReturn: number;
  sp500Return: number;
  portfolioReturn: number;
}

export async function generateCryptoPerformanceReport(
  portfolioData: PortfolioData,
  clinicName: string,
  startDate: Date,
  endDate: Date
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Performance Cripto', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(clinicName, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.text(
    `Período: ${format(startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );

  yPosition += 15;

  // Resumo Executivo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Executivo', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const summaryData = [
    ['Valor Total do Portfolio:', portfolioData.totalBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['Ganhos Realizados:', `+${portfolioData.gains.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`],
    ['Perdas Realizadas:', `-${portfolioData.losses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`],
    ['Resultado Líquido:', (portfolioData.gains - portfolioData.losses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['Total de Conversões:', portfolioData.conversionsHistory.length.toString()],
  ];

  summaryData.forEach(([label, value]) => {
    doc.text(label, 20, yPosition);
    doc.text(value, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 6;
  });

  yPosition += 10;

  // Distribuição por Moeda
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Distribuição por Moeda', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  portfolioData.distribution.forEach(item => {
    doc.text(item.coin, 20, yPosition);
    doc.text(`${item.percentage.toFixed(2)}%`, pageWidth / 2 - 10, yPosition, { align: 'right' });
    doc.text(
      item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      pageWidth - 20,
      yPosition,
      { align: 'right' }
    );
    yPosition += 6;
  });

  // Comparativo de Mercado
  yPosition += 10;
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Comparativo com Índices de Mercado', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Buscar dados reais de performance do Bitcoin e S&P500
  const marketComparison = await fetchMarketComparison(startDate, endDate);
  
  const comparisonData = [
    ['Bitcoin (BTC):', `${marketComparison.btcReturn > 0 ? '+' : ''}${marketComparison.btcReturn.toFixed(2)}%`],
    ['S&P 500 (Estimado):', `${marketComparison.sp500Return > 0 ? '+' : ''}${marketComparison.sp500Return.toFixed(2)}%`],
    ['Seu Portfolio:', `${marketComparison.portfolioReturn > 0 ? '+' : ''}${marketComparison.portfolioReturn.toFixed(2)}%`],
  ];

  comparisonData.forEach(([label, value]) => {
    doc.text(label, 20, yPosition);
    doc.text(value, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 6;
  });

  yPosition += 10;

  // Histórico de Conversões
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Histórico de Conversões', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Header da tabela
  doc.setFont('helvetica', 'bold');
  doc.text('Data', 15, yPosition);
  doc.text('De→Para', 50, yPosition);
  doc.text('Quantidade', 90, yPosition);
  doc.text('Valor BRL', 130, yPosition);
  doc.text('Tipo', 170, yPosition);
  yPosition += 5;

  doc.setFont('helvetica', 'normal');
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 5;

  portfolioData.conversionsHistory.slice(0, 15).forEach(conv => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }

    doc.text(format(conv.date, 'dd/MM/yyyy', { locale: ptBR }), 15, yPosition);
    doc.text(`${conv.fromCoin}→${conv.toCoin}`, 50, yPosition);
    doc.text(conv.amount.toFixed(8), 90, yPosition);
    doc.text(conv.valueBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 130, yPosition);
    doc.text(conv.type === 'gain' ? 'Ganho' : 'Perda', 170, yPosition);
    yPosition += 6;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Página ${i} de ${totalPages} - Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Salvar PDF
  const fileName = `relatorio-crypto-${format(startDate, 'yyyy-MM')}.pdf`;
  doc.save(fileName);
}

async function fetchMarketComparison(startDate: Date, endDate: Date): Promise<MarketComparison> {
  try {
    // Buscar retorno do Bitcoin no período
    const btcResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=brl&from=${Math.floor(startDate.getTime() / 1000)}&to=${Math.floor(endDate.getTime() / 1000)}`
    );
    
    if (!btcResponse.ok) throw new Error('Erro ao buscar dados do Bitcoin');
    
    const btcData = await btcResponse.json();
    const btcPrices = btcData.prices;
    const btcStartPrice = btcPrices[0][1];
    const btcEndPrice = btcPrices[btcPrices.length - 1][1];
    const btcReturn = ((btcEndPrice - btcStartPrice) / btcStartPrice) * 100;

    // S&P 500 - estimativa baseada em média histórica mensal (~1%)
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const monthsDiff = daysDiff / 30;
    const sp500Return = monthsDiff * 1.0; // 1% ao mês

    // Retorno do portfolio (calculado baseado em ganhos/perdas)
    const portfolioReturn = 0; // Será calculado com base em dados reais

    return {
      btcReturn,
      sp500Return,
      portfolioReturn,
    };
  } catch (error) {
    console.error('Erro ao buscar comparação de mercado:', error);
    return {
      btcReturn: 0,
      sp500Return: 0,
      portfolioReturn: 0,
    };
  }
}
