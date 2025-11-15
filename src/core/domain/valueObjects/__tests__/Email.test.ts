import { describe, it, expect } from 'vitest';
import { Email } from '../Email';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create valid email', () => {
      const email = Email.create('user@example.com');
      expect(email.getValue()).toBe('user@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = Email.create('USER@EXAMPLE.COM');
      expect(email.getValue()).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create('  user@example.com  ');
      expect(email.getValue()).toBe('user@example.com');
    });

    it('should throw error for invalid email', () => {
      expect(() => Email.create('invalid')).toThrow('Email inválido');
      expect(() => Email.create('invalid@')).toThrow('Email inválido');
      expect(() => Email.create('@example.com')).toThrow('Email inválido');
      expect(() => Email.create('')).toThrow('Email inválido');
    });
  });

  describe('isValid', () => {
    it('should validate correct emails', () => {
      expect(Email.isValid('user@example.com')).toBe(true);
      expect(Email.isValid('user.name@example.com')).toBe(true);
      expect(Email.isValid('user+tag@example.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(Email.isValid('')).toBe(false);
      expect(Email.isValid('invalid')).toBe(false);
      expect(Email.isValid('invalid@')).toBe(false);
      expect(Email.isValid('@example.com')).toBe(false);
      expect(Email.isValid('user@')).toBe(false);
    });
  });

  describe('getDomain', () => {
    it('should return domain part', () => {
      const email = Email.create('user@example.com');
      expect(email.getDomain()).toBe('example.com');
    });
  });

  describe('getLocalPart', () => {
    it('should return local part', () => {
      const email = Email.create('user@example.com');
      expect(email.getLocalPart()).toBe('user');
    });
  });

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = Email.create('user@example.com');
      const email2 = Email.create('user@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('user1@example.com');
      const email2 = Email.create('user2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
});
