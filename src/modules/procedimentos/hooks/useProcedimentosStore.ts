import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { Procedimento, CriarProcedimento } from '../types/procedimento.types';
import { getCurrentDate } from '@/lib/utils/date.utils';

const STORAGE_KEY = 'ortho-plus-procedimentos';

// Dados mock iniciais
const procedimentosIniciais: Procedimento[] = [
  {
    id: '1',
    codigo: 'PROC-001',
    nome: 'Limpeza e Profilaxia',
    categoria: 'Clínica Geral',
    descricao: 'Remoção de placa bacteriana, tártaro e polimento dos dentes',
    valor: 150.00,
    duracaoEstimada: 30,
    unidadeTempo: 'minutos',
    materiaisNecessarios: 'Kit de limpeza, pasta profilática, escova Robinson',
    status: 'Ativo',
    dataCriacao: '2024-01-15',
    dataAtualizacao: '2024-01-15',
  },
  {
    id: '2',
    codigo: 'PROC-002',
    nome: 'Tratamento de Canal',
    categoria: 'Endodontia',
    descricao: 'Remoção da polpa dentária infectada e preenchimento dos canais radiculares',
    valor: 800.00,
    duracaoEstimada: 1,
    unidadeTempo: 'horas',
    materiaisNecessarios: 'Limas endodônticas, guta-percha, cimento endodôntico, isolamento absoluto',
    observacoes: 'Pode necessitar de múltiplas sessões dependendo do caso',
    status: 'Ativo',
    dataCriacao: '2024-01-15',
    dataAtualizacao: '2024-01-15',
  },
  {
    id: '3',
    codigo: 'PROC-003',
    nome: 'Clareamento Dental',
    categoria: 'Estética',
    descricao: 'Clareamento profissional dos dentes com gel de peróxido',
    valor: 600.00,
    duracaoEstimada: 45,
    unidadeTempo: 'minutos',
    materiaisNecessarios: 'Gel clareador, moldeira, protetor gengival',
    status: 'Ativo',
    dataCriacao: '2024-01-20',
    dataAtualizacao: '2024-01-20',
  },
  {
    id: '4',
    codigo: 'PROC-004',
    nome: 'Extração Simples',
    categoria: 'Cirurgia',
    descricao: 'Extração de dente sem necessidade de cirurgia complexa',
    valor: 200.00,
    duracaoEstimada: 30,
    unidadeTempo: 'minutos',
    materiaisNecessarios: 'Anestésico, fórceps, elevadores, gaze',
    observacoes: 'Receitar analgésicos e antibióticos conforme necessário',
    status: 'Ativo',
    dataCriacao: '2024-01-22',
    dataAtualizacao: '2024-01-22',
  },
  {
    id: '5',
    codigo: 'PROC-005',
    nome: 'Aparelho Ortodôntico Fixo',
    categoria: 'Ortodontia',
    descricao: 'Instalação de aparelho ortodôntico fixo metálico',
    valor: 2500.00,
    duracaoEstimada: 2,
    unidadeTempo: 'horas',
    materiaisNecessarios: 'Brackets metálicos, arcos ortodônticos, bandas, cimento',
    observacoes: 'Requer manutenções mensais',
    status: 'Ativo',
    dataCriacao: '2024-01-25',
    dataAtualizacao: '2024-01-25',
  },
  {
    id: '6',
    codigo: 'PROC-006',
    nome: 'Implante Dentário',
    categoria: 'Implantodontia',
    descricao: 'Instalação cirúrgica de implante osseointegrado',
    valor: 3500.00,
    duracaoEstimada: 2,
    unidadeTempo: 'horas',
    materiaisNecessarios: 'Implante de titânio, kit cirúrgico, sutura',
    observacoes: 'Requer período de osseointegração de 3-6 meses',
    status: 'Ativo',
    dataCriacao: '2024-02-01',
    dataAtualizacao: '2024-02-01',
  },
  {
    id: '7',
    codigo: 'PROC-007',
    nome: 'Restauração em Resina',
    categoria: 'Clínica Geral',
    descricao: 'Restauração de cárie com resina composta fotopolimerizável',
    valor: 180.00,
    duracaoEstimada: 40,
    unidadeTempo: 'minutos',
    materiaisNecessarios: 'Resina composta, ácido fosfórico, adesivo, fotopolimerizador',
    status: 'Ativo',
    dataCriacao: '2024-02-05',
    dataAtualizacao: '2024-02-05',
  },
  {
    id: '8',
    codigo: 'PROC-008',
    nome: 'Raspagem Periodontal',
    categoria: 'Periodontia',
    descricao: 'Remoção de tártaro e placa subgengival',
    valor: 300.00,
    duracaoEstimada: 1,
    unidadeTempo: 'horas',
    materiaisNecessarios: 'Curetas periodontais, ultrassom, anestésico tópico',
    status: 'Ativo',
    dataCriacao: '2024-02-08',
    dataAtualizacao: '2024-02-08',
  },
];

export function useProcedimentosStore() {
  const [procedimentos, setProcedimentos] = useLocalStorage<Procedimento[]>(
    STORAGE_KEY,
    procedimentosIniciais
  );

  const adicionarProcedimento = (dados: CriarProcedimento): Procedimento => {
    const novoProcedimento: Procedimento = {
      ...dados,
      id: Date.now().toString(),
      dataCriacao: getCurrentDate(),
      dataAtualizacao: getCurrentDate(),
    };

    setProcedimentos([...procedimentos, novoProcedimento]);
    return novoProcedimento;
  };

  const atualizarProcedimento = (id: string, dados: Partial<CriarProcedimento>) => {
    setProcedimentos(
      procedimentos.map((proc) =>
        proc.id === id
          ? { ...proc, ...dados, dataAtualizacao: getCurrentDate() }
          : proc
      )
    );
  };

  const excluirProcedimento = (id: string) => {
    setProcedimentos(procedimentos.filter((proc) => proc.id !== id));
  };

  const buscarPorId = (id: string): Procedimento | undefined => {
    return procedimentos.find((proc) => proc.id === id);
  };

  const buscarPorCategoria = (categoria: string): Procedimento[] => {
    return procedimentos.filter((proc) => proc.categoria === categoria);
  };

  const buscarPorStatus = (status: string): Procedimento[] => {
    return procedimentos.filter((proc) => proc.status === status);
  };

  return {
    procedimentos,
    adicionarProcedimento,
    atualizarProcedimento,
    excluirProcedimento,
    buscarPorId,
    buscarPorCategoria,
    buscarPorStatus,
  };
}
