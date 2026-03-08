import { Router } from 'express';
import { FinanceiroController } from './FinanceiroController';

export function createFinanceiroRouter(): Router {
  const router = Router();
  const c = new FinanceiroController();

  // Transactions (financial_transactions)
  router.get('/transactions', (req, res) => c.listTransactions(req, res));
  router.get('/transactions/:id', (req, res) => c.getTransaction(req, res));
  router.post('/transactions', (req, res) => c.createTransaction(req, res));
  router.patch('/transactions/:id', (req, res) => c.updateTransaction(req, res));
  router.delete('/transactions/:id', (req, res) => c.deleteTransaction(req, res));
  router.patch('/transactions/:id/pay', (req, res) => c.markTransactionAsPaid(req, res));

  // Categories (financial_categories)
  router.get('/categories', (req, res) => c.listCategories(req, res));
  router.get('/categories/:id', (req, res) => c.getCategory(req, res));
  router.post('/categories', (req, res) => c.createCategory(req, res));
  router.patch('/categories/:id', (req, res) => c.updateCategory(req, res));
  router.delete('/categories/:id', (req, res) => c.deleteCategory(req, res));

  // Cash Registers
  router.get('/cash-registers', (req, res) => c.listCashRegisters(req, res));
  router.get('/cash-registers/:id', (req, res) => c.getCashRegister(req, res));
  router.post('/cash-registers', (req, res) => c.createCashRegister(req, res));
  router.patch('/cash-registers/:id', (req, res) => c.updateCashRegister(req, res));
  router.delete('/cash-registers/:id', (req, res) => c.deleteCashRegister(req, res));

  // Caixa Movimentos
  router.get('/movimentos', (req, res) => c.listMovimentos(req, res));
  router.get('/movimentos/:id', (req, res) => c.getMovimento(req, res));
  router.post('/movimentos', (req, res) => c.createMovimento(req, res));
  router.patch('/movimentos/:id', (req, res) => c.updateMovimento(req, res));
  router.delete('/movimentos/:id', (req, res) => c.deleteMovimento(req, res));

  // Caixa Incidentes
  router.get('/incidentes', (req, res) => c.listIncidentes(req, res));
  router.get('/incidentes/:id', (req, res) => c.getIncidente(req, res));
  router.post('/incidentes', (req, res) => c.createIncidente(req, res));
  router.patch('/incidentes/:id', (req, res) => c.updateIncidente(req, res));
  router.delete('/incidentes/:id', (req, res) => c.deleteIncidente(req, res));

  // Contas a Receber
  router.get('/contas-receber', (req, res) => c.listContasReceber(req, res));
  router.post('/contas-receber', (req, res) => c.createContaReceber(req, res));
  router.patch('/contas-receber/:id', (req, res) => c.updateContaReceber(req, res));
  router.delete('/contas-receber/:id', (req, res) => c.deleteContaReceber(req, res));

  // Contas a Pagar
  router.get('/contas-pagar', (req, res) => c.listContasPagar(req, res));
  router.post('/contas-pagar', (req, res) => c.createContaPagar(req, res));
  router.patch('/contas-pagar/:id', (req, res) => c.updateContaPagar(req, res));
  router.delete('/contas-pagar/:id', (req, res) => c.deleteContaPagar(req, res));

  // Notas Fiscais
  router.get('/notas-fiscais', (req, res) => c.listNotasFiscais(req, res));
  router.post('/notas-fiscais', (req, res) => c.createNotaFiscal(req, res));
  router.patch('/notas-fiscais/:id', (req, res) => c.updateNotaFiscal(req, res));
  router.delete('/notas-fiscais/:id', (req, res) => c.deleteNotaFiscal(req, res));

  // PDV Vendas
  router.get('/vendas-pdv', (req, res) => c.listVendasPDV(req, res));

  // Banco Extratos
  router.get('/extratos', (req, res) => c.listExtratos(req, res));
  router.patch('/extratos/:id', (req, res) => c.updateExtrato(req, res));

  // Analytics
  router.get('/cash-flow', (req, res) => c.getCashFlow(req, res));

  return router;
}
