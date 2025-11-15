import { describe, it, expect } from 'vitest';
import { CPF } from '../CPF';

describe('CPF Value Object', () => {
  describe('create', () => {
    it('should create valid CPF', () => {
      const cpf = CPF.create('123.456.789-09');
      expect(cpf.getValue()).toBe('12345678909');
    });

    it('should throw error for invalid CPF', () => {
      expect(() => CPF.create('123.456.789-00')).toThrow('CPF inválido');
      expect(() => CPF.create('111.111.111-11')).toThrow('CPF inválido');
      expect(() => CPF.create('')).toThrow('CPF inválido');
    });
  });

  describe('isValid', () => {
    it('should validate correct CPFs', () => {
      expect(CPF.isValid('123.456.789-09')).toBe(true);
      expect(CPF.isValid('12345678909')).toBe(true);
    });

    it('should reject invalid CPFs', () => {
      expect(CPF.isValid('123.456.789-00')).toBe(false);
      expect(CPF.isValid('000.000.000-00')).toBe(false);
      expect(CPF.isValid('111.111.111-11')).toBe(false);
      expect(CPF.isValid('12345')).toBe(false);
      expect(CPF.isValid('')).toBe(false);
    });

    it('should reject CPFs with all same digits', () => {
      for (let i = 0; i <= 9; i++) {
        const cpf = i.toString().repeat(11);
        expect(CPF.isValid(cpf)).toBe(false);
      }
    });
  });

  describe('getFormatted', () => {
    it('should format CPF correctly', () => {
      const cpf = CPF.create('12345678909');
      expect(cpf.getFormatted()).toBe('123.456.789-09');
    });
  });

  describe('clean', () => {
    it('should remove non-digit characters', () => {
      expect(CPF.clean('123.456.789-09')).toBe('12345678909');
      expect(CPF.clean('123 456 789 09')).toBe('12345678909');
    });
  });

  describe('equals', () => {
    it('should return true for equal CPFs', () => {
      const cpf1 = CPF.create('12345678909');
      const cpf2 = CPF.create('123.456.789-09');
      expect(cpf1.equals(cpf2)).toBe(true);
    });
  });
});
