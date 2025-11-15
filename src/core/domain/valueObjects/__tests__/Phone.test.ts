import { describe, it, expect } from 'vitest';
import { Phone } from '../Phone';

describe('Phone Value Object', () => {
  describe('create', () => {
    it('should create valid mobile phone', () => {
      const phone = Phone.create('(11) 99999-9999');
      expect(phone.getValue()).toBe('11999999999');
    });

    it('should create valid landline', () => {
      const phone = Phone.create('(11) 9999-9999');
      expect(phone.getValue()).toBe('1199999999');
    });

    it('should throw error for invalid phone', () => {
      expect(() => Phone.create('123')).toThrow('Telefone inválido');
      expect(() => Phone.create('(11) 8999-9999')).toThrow('Telefone inválido'); // Mobile must start with 9
      expect(() => Phone.create('')).toThrow('Telefone inválido');
    });
  });

  describe('isValid', () => {
    it('should validate correct mobile phones', () => {
      expect(Phone.isValid('11999999999')).toBe(true);
      expect(Phone.isValid('(11) 99999-9999')).toBe(true);
    });

    it('should validate correct landlines', () => {
      expect(Phone.isValid('1199999999')).toBe(true);
      expect(Phone.isValid('(11) 9999-9999')).toBe(true);
    });

    it('should reject invalid phones', () => {
      expect(Phone.isValid('123')).toBe(false);
      expect(Phone.isValid('1111111111')).toBe(false); // All same digit
      expect(Phone.isValid('11111111111')).toBe(false); // All same digit
      expect(Phone.isValid('')).toBe(false);
    });

    it('should reject invalid DDD', () => {
      expect(Phone.isValid('0199999999')).toBe(false);
      expect(Phone.isValid('1099999999')).toBe(false);
    });
  });

  describe('getFormatted', () => {
    it('should format mobile phone correctly', () => {
      const phone = Phone.create('11999999999');
      expect(phone.getFormatted()).toBe('(11) 99999-9999');
    });

    it('should format landline correctly', () => {
      const phone = Phone.create('1199999999');
      expect(phone.getFormatted()).toBe('(11) 9999-9999');
    });
  });

  describe('getInternational', () => {
    it('should return international format', () => {
      const phone = Phone.create('11999999999');
      expect(phone.getInternational()).toBe('+5511999999999');
    });
  });

  describe('isMobile', () => {
    it('should return true for mobile', () => {
      const phone = Phone.create('11999999999');
      expect(phone.isMobile()).toBe(true);
    });

    it('should return false for landline', () => {
      const phone = Phone.create('1199999999');
      expect(phone.isMobile()).toBe(false);
    });
  });

  describe('getDDD', () => {
    it('should return DDD', () => {
      const phone = Phone.create('11999999999');
      expect(phone.getDDD()).toBe('11');
    });
  });
});
