import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEstoque } from '@/modules/estoque/hooks/useEstoque';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

type ReportType = 'movimentacoes' | 'produtos-fornecedor' | 'valor-inventario' | 'historico-requisicoes';
type ReportFormat = 'pdf' | 'excel';

export function EstoqueRelatorios() {
  const { produtos, movimentacoes, requisicoes, fornecedores, categorias } = useEstoque();
  const [reportType, setReportType] = useState<ReportType>('movimentacoes');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');

  const generatePDFReport = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Cabeçalho
    doc.setFontSize(18);
    doc.text('Relatório de Estoque', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, yPos);
    yPos += 15;

    // Conteúdo baseado no tipo de relatório
    if (reportType === 'movimentacoes') {
      doc.setFontSize(14);
      doc.text('Movimentações por Período', 20, yPos);
      yPos += 10;

      const filteredMovs = movimentacoes.filter(m => {
        const dataMovimentacao = new Date(m.createdAt!);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return dataMovimentacao >= start && dataMovimentacao <= end;
      });

      doc.setFontSize(10);
      filteredMovs.slice(0, 30).forEach((mov) => {
        const produto = produtos.find(p => p.id === mov.produtoId);
        const text = `${new Date(mov.createdAt!).toLocaleDateString('pt-BR')} - ${mov.tipo} - ${produto?.nome || 'N/A'} - Qtd: ${mov.quantidade}`;
        doc.text(text, 20, yPos);
        yPos += 7;
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });

      doc.text(`Total de movimentações: ${filteredMovs.length}`, 20, yPos + 10);
    } else if (reportType === 'produtos-fornecedor') {
      doc.setFontSize(14);
      doc.text('Produtos por Fornecedor', 20, yPos);
      yPos += 10;

      const fornecedor = fornecedores.find(f => f.id === fornecedorId);
      if (fornecedor) {
        doc.setFontSize(12);
        doc.text(`Fornecedor: ${fornecedor.nome}`, 20, yPos);
        yPos += 10;
      }

      const filteredProds = fornecedorId 
        ? produtos.filter(p => p.fornecedorId === fornecedorId)
        : produtos;

      doc.setFontSize(10);
      filteredProds.forEach((prod) => {
        const categoria = categorias.find(c => c.id === prod.categoriaId);
        const text = `${prod.nome} - Cat: ${categoria?.nome || 'N/A'} - Qtd: ${prod.quantidadeAtual} - R$ ${prod.precoCompra.toFixed(2)}`;
        doc.text(text, 20, yPos);
        yPos += 7;
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });
    } else if (reportType === 'valor-inventario') {
      doc.setFontSize(14);
      doc.text('Valor do Inventário', 20, yPos);
      yPos += 10;

      const valorTotal = produtos.reduce((sum, p) => sum + (p.quantidadeAtual * p.precoCompra), 0);
      
      doc.setFontSize(12);
      doc.text(`Valor Total do Inventário: R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPos);
      yPos += 15;

      doc.setFontSize(10);
      produtos.forEach((prod) => {
        const valorProd = prod.quantidadeAtual * prod.precoCompra;
        const text = `${prod.nome} - Qtd: ${prod.quantidadeAtual} x R$ ${prod.precoCompra.toFixed(2)} = R$ ${valorProd.toFixed(2)}`;
        doc.text(text, 20, yPos);
        yPos += 7;
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });
    } else if (reportType === 'historico-requisicoes') {
      doc.setFontSize(14);
      doc.text('Histórico de Requisições', 20, yPos);
      yPos += 10;

      const filteredReqs = requisicoes.filter(r => {
        const dataRequisicao = new Date(r.createdAt!);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return dataRequisicao >= start && dataRequisicao <= end;
      });

      doc.setFontSize(10);
      filteredReqs.slice(0, 30).forEach((req) => {
        const produto = produtos.find(p => p.id === req.produtoId);
        const text = `${new Date(req.createdAt!).toLocaleDateString('pt-BR')} - ${produto?.nome || 'N/A'} - Qtd: ${req.quantidade} - Status: ${req.status}`;
        doc.text(text, 20, yPos);
        yPos += 7;
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });

      doc.text(`Total de requisições: ${filteredReqs.length}`, 20, yPos + 10);
    }

    doc.save(`relatorio-estoque-${reportType}-${Date.now()}.pdf`);
    toast.success('Relatório PDF gerado com sucesso!');
  };

  const generateExcelReport = () => {
    let data: any[] = [];
    let sheetName = 'Relatório';

    if (reportType === 'movimentacoes') {
      const filteredMovs = movimentacoes.filter(m => {
        const dataMovimentacao = new Date(m.createdAt!);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return dataMovimentacao >= start && dataMovimentacao <= end;
      });

      data = filteredMovs.map(mov => {
        const produto = produtos.find(p => p.id === mov.produtoId);
        const fornecedor = fornecedores.find(f => f.id === mov.fornecedorId);
        return {
          'Data': new Date(mov.createdAt!).toLocaleDateString('pt-BR'),
          'Tipo': mov.tipo,
          'Produto': produto?.nome || 'N/A',
          'Quantidade': mov.quantidade,
          'Lote': mov.lote || '-',
          'Fornecedor': fornecedor?.nome || '-',
          'Valor Unitário': mov.valorUnitario || 0,
          'Valor Total': mov.valorTotal || 0,
          'Motivo': mov.motivo,
        };
      });
      sheetName = 'Movimentações';
    } else if (reportType === 'produtos-fornecedor') {
      const filteredProds = fornecedorId 
        ? produtos.filter(p => p.fornecedorId === fornecedorId)
        : produtos;

      data = filteredProds.map(prod => {
        const categoria = categorias.find(c => c.id === prod.categoriaId);
        const fornecedor = fornecedores.find(f => f.id === prod.fornecedorId);
        return {
          'Código': prod.codigo,
          'Produto': prod.nome,
          'Categoria': categoria?.nome || 'N/A',
          'Fornecedor': fornecedor?.nome || 'N/A',
          'Quantidade Atual': prod.quantidadeAtual,
          'Quantidade Mínima': prod.quantidadeMinima,
          'Preço Compra': prod.precoCompra,
          'Preço Venda': prod.precoVenda || 0,
          'Valor Total': prod.quantidadeAtual * prod.precoCompra,
          'Status': prod.ativo ? 'Ativo' : 'Inativo',
        };
      });
      sheetName = 'Produtos';
    } else if (reportType === 'valor-inventario') {
      data = produtos.map(prod => {
        const categoria = categorias.find(c => c.id === prod.categoriaId);
        return {
          'Código': prod.codigo,
          'Produto': prod.nome,
          'Categoria': categoria?.nome || 'N/A',
          'Quantidade': prod.quantidadeAtual,
          'Preço Unitário': prod.precoCompra,
          'Valor Total': prod.quantidadeAtual * prod.precoCompra,
        };
      });
      sheetName = 'Inventário';
    } else if (reportType === 'historico-requisicoes') {
      const filteredReqs = requisicoes.filter(r => {
        const dataRequisicao = new Date(r.createdAt!);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return dataRequisicao >= start && dataRequisicao <= end;
      });

      data = filteredReqs.map(req => {
        const produto = produtos.find(p => p.id === req.produtoId);
        return {
          'Data': new Date(req.createdAt!).toLocaleDateString('pt-BR'),
          'Produto': produto?.nome || 'N/A',
          'Quantidade': req.quantidade,
          'Motivo': req.motivo,
          'Prioridade': req.prioridade,
          'Status': req.status,
          'Solicitado Por': req.solicitadoPor,
          'Aprovado Por': req.aprovadoPor || '-',
          'Data Aprovação': req.dataAprovacao ? new Date(req.dataAprovacao).toLocaleDateString('pt-BR') : '-',
        };
      });
      sheetName = 'Requisições';
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `relatorio-estoque-${reportType}-${Date.now()}.xlsx`);
    toast.success('Relatório Excel gerado com sucesso!');
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Geração de Relatórios</h2>

      <div className="space-y-6">
        <div>
          <Label>Tipo de Relatório</Label>
          <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="movimentacoes">Movimentações por Período</SelectItem>
              <SelectItem value="produtos-fornecedor">Produtos por Fornecedor</SelectItem>
              <SelectItem value="valor-inventario">Valor do Inventário</SelectItem>
              <SelectItem value="historico-requisicoes">Histórico de Requisições</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(reportType === 'movimentacoes' || reportType === 'historico-requisicoes') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data Início</Label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {reportType === 'produtos-fornecedor' && (
          <div>
            <Label>Fornecedor (Opcional)</Label>
            <Select value={fornecedorId} onValueChange={setFornecedorId}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os fornecedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os fornecedores</SelectItem>
                {fornecedores.map((forn) => (
                  <SelectItem key={forn.id} value={forn.id!}>
                    {forn.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button onClick={generatePDFReport} className="flex-1">
            <FileDown className="mr-2 h-4 w-4" />
            Gerar PDF
          </Button>
          <Button onClick={generateExcelReport} variant="outline" className="flex-1">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Gerar Excel
          </Button>
        </div>
      </div>
    </Card>
  );
}
