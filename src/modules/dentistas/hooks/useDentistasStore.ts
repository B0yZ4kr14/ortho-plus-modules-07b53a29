import { useState, useEffect } from 'react';
import { Dentista, DentistaFilters } from '../types/dentista.types';
import { toast } from 'sonner';

const STORAGE_KEY = 'orthoplus_dentistas';

// Mock data for demonstration
const mockDentistas: Dentista[] = [
  {
    id: '1',
    nome: 'Dr. Carlos Silva',
    cro: 'CRO-SP 12345',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    dataNascimento: '1980-05-15',
    sexo: 'M',
    telefone: '(11) 3456-7890',
    celular: '(11) 98765-4321',
    email: 'carlos.silva@clinica.com',
    endereco: {
      cep: '01234-567',
      logradouro: 'Rua dos Dentistas',
      numero: '100',
      complemento: 'Sala 5',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    especialidades: ['Ortodontia', 'Clínico Geral'],
    corCalendario: '#3b82f6',
    diasAtendimento: [1, 2, 3, 4, 5],
    horariosAtendimento: {
      inicio: '08:00',
      fim: '18:00',
    },
    valorConsulta: 250,
    observacoes: 'Especialista em ortodontia com 15 anos de experiência',
    status: 'Ativo',
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00',
  },
  {
    id: '2',
    nome: 'Dra. Ana Santos',
    cro: 'CRO-SP 54321',
    cpf: '987.654.321-00',
    dataNascimento: '1985-08-22',
    sexo: 'F',
    telefone: '(11) 2345-6789',
    celular: '(11) 97654-3210',
    email: 'ana.santos@clinica.com',
    endereco: {
      cep: '04567-890',
      logradouro: 'Av. Paulista',
      numero: '2000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    especialidades: ['Endodontia', 'Clínico Geral'],
    corCalendario: '#10b981',
    diasAtendimento: [1, 3, 5],
    horariosAtendimento: {
      inicio: '09:00',
      fim: '17:00',
    },
    valorConsulta: 300,
    status: 'Ativo',
    createdAt: '2024-02-10T14:20:00',
    updatedAt: '2024-02-10T14:20:00',
  },
  {
    id: '3',
    nome: 'Dr. Pedro Costa',
    cro: 'CRO-SP 67890',
    cpf: '456.789.123-00',
    dataNascimento: '1978-11-30',
    sexo: 'M',
    telefone: '(11) 3210-9876',
    celular: '(11) 96543-2109',
    email: 'pedro.costa@clinica.com',
    endereco: {
      cep: '02345-678',
      logradouro: 'Rua das Américas',
      numero: '500',
      bairro: 'Jardins',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    especialidades: ['Implantodontia', 'Cirurgia Oral'],
    corCalendario: '#f59e0b',
    diasAtendimento: [2, 4, 6],
    horariosAtendimento: {
      inicio: '08:00',
      fim: '16:00',
    },
    valorConsulta: 400,
    observacoes: 'Especialista em implantes e cirurgias complexas',
    status: 'Ativo',
    createdAt: '2024-03-05T11:00:00',
    updatedAt: '2024-03-05T11:00:00',
  },
];

export function useDentistasStore() {
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dentistas from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDentistas(JSON.parse(stored));
      } else {
        // Initialize with mock data
        setDentistas(mockDentistas);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDentistas));
      }
    } catch (error) {
      console.error('Error loading dentistas:', error);
      toast.error('Erro ao carregar dentistas');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveDentistas = (updatedDentistas: Dentista[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDentistas));
      setDentistas(updatedDentistas);
    } catch (error) {
      console.error('Error saving dentistas:', error);
      toast.error('Erro ao salvar dentistas');
      throw error;
    }
  };

  const addDentista = (dentista: Dentista) => {
    const newDentista = {
      ...dentista,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveDentistas([...dentistas, newDentista]);
    toast.success('Dentista cadastrado com sucesso');
    return newDentista;
  };

  const updateDentista = (id: string, dentista: Partial<Dentista>) => {
    const updated = dentistas.map(d =>
      d.id === id ? { ...d, ...dentista, updatedAt: new Date().toISOString() } : d
    );
    saveDentistas(updated);
    toast.success('Dentista atualizado com sucesso');
  };

  const deleteDentista = (id: string) => {
    const updated = dentistas.filter(d => d.id !== id);
    saveDentistas(updated);
    toast.success('Dentista removido com sucesso');
  };

  const getDentista = (id: string) => {
    return dentistas.find(d => d.id === id);
  };

  const filterDentistas = (filters: DentistaFilters) => {
    return dentistas.filter(dentista => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !dentista.nome.toLowerCase().includes(searchLower) &&
          !dentista.cro.toLowerCase().includes(searchLower) &&
          !dentista.cpf.includes(filters.search) &&
          !dentista.email.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      if (filters.status && dentista.status !== filters.status) {
        return false;
      }
      if (filters.especialidade) {
        if (!dentista.especialidades.includes(filters.especialidade)) {
          return false;
        }
      }
      return true;
    });
  };

  return {
    dentistas,
    loading,
    addDentista,
    updateDentista,
    deleteDentista,
    getDentista,
    filterDentistas,
  };
}
