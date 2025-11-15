import { describe, it, expect } from 'vitest';
import { Transaction } from '../Transaction';

describe('Transaction Aggregate', () => {
  describe('create', () => {
    it('should create a new transaction with PENDENTE status', () => {
      const transaction = Transaction.create({
        clinicId: 'clinic-1',
        type: 'RECEITA',
        amount: 100,
        description: 'Consulta',
        dueDate: new Date('2025-12-01'),
        createdBy: 'user-1',
      });

      expect(transaction.id).toBeDefined();
      expect(transaction.type).toBe('RECEITA');
      expect(transaction.status).toBe('PENDENTE');
      expect(transaction.amount.toNumber()).toBe(100);
    });

    it('should raise TransactionCreatedEvent', () => {
      const transaction = Transaction.create({
        clinicId: 'clinic-1',
        type: 'RECEITA',
        amount: 100,
        description: 'Consulta',
        dueDate: new Date('2025-12-01'),
        createdBy: 'user-1',
      });

      const events = transaction.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('TransactionCreated');
    });
  });

  describe('markAsPaid', () => {
    it('should mark transaction as paid', () => {
      const transaction = Transaction.create({
        clinicId: 'clinic-1',
        type: 'RECEITA',
        amount: 100,
        description: 'Consulta',
        dueDate: new Date('2025-12-01'),
        createdBy: 'user-1',
      });

      transaction.markAsPaid('PIX');

      expect(transaction.status).toBe('PAGA');
      expect(transaction.paidDate).toBeDefined();
    });

    it('should raise TransactionPaidEvent', () => {
      const transaction = Transaction.create({
        clinicId: 'clinic-1',
        type: 'RECEITA',
        amount: 100,
        description: 'Consulta',
        dueDate: new Date('2025-12-01'),
        createdBy: 'user-1',
      });

      transaction.pullDomainEvents(); // Clear creation event
      transaction.markAsPaid('PIX');

      const events = transaction.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('TransactionPaid');
    });

    it('should throw error if already paid', () => {
      const transaction = Transaction.create({
        clinicId: 'clinic-1',
        type: 'RECEITA',
        amount: 100,
        description: 'Consulta',
        dueDate: new Date('2025-12-01'),
        createdBy: 'user-1',
      });

      transaction.markAsPaid('PIX');

      expect(() => transaction.markAsPaid('PIX')).toThrow('já está paga');
    });

    it('should throw error if cancelled', () => {
      const transaction = Transaction.create({
        clinicId: 'clinic-1',
        type: 'RECEITA',
        amount: 100,
        description: 'Consulta',
        dueDate: new Date('2025-12-01'),
        createdBy: 'user-1',
      });

      transaction.cancel();

      expect(() => transaction.markAsPaid('PIX')).toThrow('cancelada');
    });
  });

  describe('cancel', () => {
    it('should cancel pending transaction', () => {
      const transaction = Transaction.create({
        clinicId: 'clinic-1',
        type: 'RECEITA',
        amount: 100,
        description: 'Consulta',
        dueDate: new Date('2025-12-01'),
        createdBy: 'user-1',
      });

      transaction.cancel();

      expect(transaction.status).toBe('CANCELADA');
    });

    it('should throw error if already paid', () => {
      const transaction = Transaction.create({
        clinicId: 'clinic-1',
        type: 'RECEITA',
        amount: 100,
        description: 'Consulta',
        dueDate: new Date('2025-12-01'),
        createdBy: 'user-1',
      });

      transaction.markAsPaid('PIX');

      expect(() => transaction.cancel()).toThrow('paga');
    });
  });

  describe('isOverdue', () => {
    it('should return true for overdue pending transaction', () => {
      const transaction = Transaction.create({
        clinicId: 'clinic-1',
        type: 'RECEITA',
        amount: 100,
        description: 'Consulta',
        dueDate: new Date('2020-01-01'),
        createdBy: 'user-1',
      });

      expect(transaction.isOverdue()).toBe(true);
    });

    it('should return false for paid transaction', () => {
      const transaction = Transaction.create({
        clinicId: 'clinic-1',
        type: 'RECEITA',
        amount: 100,
        description: 'Consulta',
        dueDate: new Date('2020-01-01'),
        createdBy: 'user-1',
      });

      transaction.markAsPaid('PIX');

      expect(transaction.isOverdue()).toBe(false);
    });

    it('should return false for future transaction', () => {
      const transaction = Transaction.create({
        clinicId: 'clinic-1',
        type: 'RECEITA',
        amount: 100,
        description: 'Consulta',
        dueDate: new Date('2030-01-01'),
        createdBy: 'user-1',
      });

      expect(transaction.isOverdue()).toBe(false);
    });
  });
});
