import { describe, it, expect } from 'vitest';
import { Lead } from '../Lead';

describe('Lead Aggregate', () => {
  describe('create', () => {
    it('should create a new lead with NOVO status', () => {
      const lead = Lead.create({
        clinicId: 'clinic-1',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '11987654321',
        source: 'SITE',
      });

      expect(lead.id).toBeDefined();
      expect(lead.status).toBe('NOVO');
      expect(lead.score).toBe(0);
    });
  });

  describe('updateStatus', () => {
    it('should update status and increase score', () => {
      const lead = Lead.create({
        clinicId: 'clinic-1',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '11987654321',
        source: 'SITE',
      });

      lead.updateStatus('QUALIFICADO');

      expect(lead.status).toBe('QUALIFICADO');
      expect(lead.score).toBe(20);
    });

    it('should not allow status change if converted', () => {
      const lead = Lead.create({
        clinicId: 'clinic-1',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '11987654321',
        source: 'SITE',
      });

      lead.convert('test-user', 'patient-1');

      expect(() => lead.updateStatus('PROPOSTA')).toThrow('convertido');
    });
  });

  describe('convert', () => {
    it('should convert lead and raise event', () => {
      const lead = Lead.create({
        clinicId: 'clinic-1',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '11987654321',
        source: 'SITE',
      });

      lead.convert('test-user', 'patient-1');

      expect(lead.status).toBe('CONVERTIDO');
      expect(lead.score).toBe(100);

      const events = lead.pullDomainEvents();
      expect(events.some(e => e.eventName === 'LeadConverted')).toBe(true);
    });

    it('should not allow double conversion', () => {
      const lead = Lead.create({
        clinicId: 'clinic-1',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '11987654321',
        source: 'SITE',
      });

      lead.convert('test-user', 'patient-1');

      expect(() => lead.convert('test-user', 'patient-1')).toThrow('já foi convertido');
    });
  });

  describe('assignTo', () => {
    it('should assign lead to user', () => {
      const lead = Lead.create({
        clinicId: 'clinic-1',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '11987654321',
        source: 'SITE',
      });

      lead.assignTo('user-1');

      const persistence = lead.toPersistence();
      expect(persistence.assigned_to).toBe('user-1');
    });
  });
});
