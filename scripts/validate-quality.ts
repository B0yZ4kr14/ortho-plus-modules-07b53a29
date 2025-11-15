/**
 * ORTHO+ V4.0 - SCRIPT DE VALIDAÇÃO DE QUALIDADE
 * 
 * Executa validações automáticas de:
 * - Segurança (RLS, search_path, extensions)
 * - Performance (queries N+1, memoização)
 * - Arquitetura (DDD, modularização)
 * - Documentação (cobertura, atualização)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  category: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
  details?: string;
}

const results: ValidationResult[] = [];

// ========================================
// 1. VALIDAÇÕES DE SEGURANÇA
// ========================================

function validateSecurity() {
  console.log('🔐 Validando Segurança...\n');

  // 1.1 Verificar search_path em functions
  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
  const migrationFiles = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

  let functionsWithoutSearchPath = 0;
  migrationFiles.forEach(file => {
    const content = readFileSync(join(migrationsDir, file), 'utf-8');
    const functions = content.match(/CREATE( OR REPLACE)? FUNCTION[\s\S]*?\$\$/g) || [];
    
    functions.forEach(fn => {
      if (!fn.includes('SET search_path')) {
        functionsWithoutSearchPath++;
      }
    });
  });

  results.push({
    category: 'Security',
    status: functionsWithoutSearchPath === 0 ? 'PASS' : 'FAIL',
    message: `Functions sem search_path: ${functionsWithoutSearchPath}`,
    details: functionsWithoutSearchPath > 0 ? 'Adicione SET search_path = public, pg_temp' : undefined
  });

  // 1.2 Verificar RLS habilitado
  let tablesWithoutRLS = 0;
  migrationFiles.forEach(file => {
    const content = readFileSync(join(migrationsDir, file), 'utf-8');
    const createTables = content.match(/CREATE TABLE (public\.)?(\w+)/g) || [];
    const enableRLS = content.match(/ALTER TABLE (public\.)?(\w+) ENABLE ROW LEVEL SECURITY/g) || [];
    
    if (createTables.length > enableRLS.length) {
      tablesWithoutRLS += (createTables.length - enableRLS.length);
    }
  });

  results.push({
    category: 'Security',
    status: tablesWithoutRLS === 0 ? 'PASS' : 'WARN',
    message: `Tabelas sem RLS: ${tablesWithoutRLS}`,
    details: tablesWithoutRLS > 0 ? 'Habilite RLS em todas as tabelas sensíveis' : undefined
  });
}

// ========================================
// 2. VALIDAÇÕES DE PERFORMANCE
// ========================================

function validatePerformance() {
  console.log('⚡ Validando Performance...\n');

  // 2.1 Verificar uso de React.memo
  const componentFiles = getFilesRecursive(join(process.cwd(), 'src', 'components'), '.tsx');
  let componentsWithMemo = 0;
  let totalComponents = 0;

  componentFiles.forEach(file => {
    const content = readFileSync(file, 'utf-8');
    if (content.includes('export function') || content.includes('export const')) {
      totalComponents++;
      if (content.includes('React.memo') || content.includes('memo(')) {
        componentsWithMemo++;
      }
    }
  });

  const memoPercentage = Math.round((componentsWithMemo / totalComponents) * 100);
  results.push({
    category: 'Performance',
    status: memoPercentage >= 30 ? 'PASS' : 'WARN',
    message: `Componentes com React.memo: ${componentsWithMemo}/${totalComponents} (${memoPercentage}%)`,
    details: memoPercentage < 30 ? 'Considere adicionar React.memo em componentes pesados' : undefined
  });

  // 2.2 Verificar queries com JOIN
  const repoFiles = getFilesRecursive(join(process.cwd(), 'src', 'infrastructure', 'repositories'), '.ts');
  let queriesWithJoin = 0;
  let totalQueries = 0;

  repoFiles.forEach(file => {
    const content = readFileSync(file, 'utf-8');
    const selects = content.match(/\.select\(/g) || [];
    totalQueries += selects.length;
    
    const joins = content.match(/\.select\(`[\s\S]*?,[\s\S]*?\(/g) || [];
    queriesWithJoin += joins.length;
  });

  const joinPercentage = totalQueries > 0 ? Math.round((queriesWithJoin / totalQueries) * 100) : 0;
  results.push({
    category: 'Performance',
    status: joinPercentage >= 40 ? 'PASS' : 'WARN',
    message: `Queries com JOIN: ${queriesWithJoin}/${totalQueries} (${joinPercentage}%)`,
    details: joinPercentage < 40 ? 'Otimize queries para evitar N+1' : undefined
  });
}

// ========================================
// 3. VALIDAÇÕES DE ARQUITETURA
// ========================================

function validateArchitecture() {
  console.log('🏗️  Validando Arquitetura...\n');

  // 3.1 Verificar estrutura DDD
  const requiredDirs = [
    'src/domain/entities',
    'src/domain/repositories',
    'src/application/use-cases',
    'src/infrastructure/repositories',
  ];

  const missingDirs: string[] = [];
  requiredDirs.forEach(dir => {
    try {
      statSync(join(process.cwd(), dir));
    } catch {
      missingDirs.push(dir);
    }
  });

  results.push({
    category: 'Architecture',
    status: missingDirs.length === 0 ? 'PASS' : 'FAIL',
    message: `Estrutura DDD: ${missingDirs.length === 0 ? 'Completa' : 'Incompleta'}`,
    details: missingDirs.length > 0 ? `Faltando: ${missingDirs.join(', ')}` : undefined
  });

  // 3.2 Verificar use cases
  const useCaseFiles = getFilesRecursive(join(process.cwd(), 'src', 'application', 'use-cases'), '.ts');
  results.push({
    category: 'Architecture',
    status: useCaseFiles.length >= 10 ? 'PASS' : 'WARN',
    message: `Use Cases implementados: ${useCaseFiles.length}`,
    details: useCaseFiles.length < 10 ? 'Implemente mais use cases' : undefined
  });
}

// ========================================
// 4. VALIDAÇÕES DE DOCUMENTAÇÃO
// ========================================

function validateDocumentation() {
  console.log('📚 Validando Documentação...\n');

  // 4.1 Verificar documentos criados
  const docsDir = join(process.cwd(), 'docs');
  const docsFiles = getFilesRecursive(docsDir, '.md');

  results.push({
    category: 'Documentation',
    status: docsFiles.length >= 10 ? 'PASS' : 'WARN',
    message: `Documentos criados: ${docsFiles.length}`,
    details: docsFiles.length < 10 ? 'Crie mais documentação' : undefined
  });

  // 4.2 Verificar README
  try {
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf-8');
    results.push({
      category: 'Documentation',
      status: readme.length > 1000 ? 'PASS' : 'WARN',
      message: `README: ${readme.length} caracteres`,
      details: readme.length <= 1000 ? 'README muito curto, adicione mais informações' : undefined
    });
  } catch {
    results.push({
      category: 'Documentation',
      status: 'FAIL',
      message: 'README.md não encontrado',
      details: 'Crie um README.md com instruções de instalação e uso'
    });
  }
}

// ========================================
// UTILITÁRIOS
// ========================================

function getFilesRecursive(dir: string, ext: string): string[] {
  const files: string[] = [];
  
  try {
    const items = readdirSync(dir);
    items.forEach(item => {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...getFilesRecursive(fullPath, ext));
      } else if (item.endsWith(ext)) {
        files.push(fullPath);
      }
    });
  } catch (error) {
    // Diretório não existe, retornar array vazio
  }

  return files;
}

// ========================================
// EXECUÇÃO E RELATÓRIO
// ========================================

function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO DE QUALIDADE - ORTHO+ V4.0');
  console.log('='.repeat(60) + '\n');

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, ValidationResult[]>);

  Object.entries(grouped).forEach(([category, items]) => {
    console.log(`\n### ${category}`);
    items.forEach(item => {
      const icon = item.status === 'PASS' ? '✅' : item.status === 'WARN' ? '⚠️' : '❌';
      console.log(`${icon} ${item.message}`);
      if (item.details) {
        console.log(`   └─ ${item.details}`);
      }
    });
  });

  // Score final
  const passed = results.filter(r => r.status === 'PASS').length;
  const total = results.length;
  const score = Math.round((passed / total) * 100);

  console.log('\n' + '='.repeat(60));
  console.log(`SCORE FINAL: ${score}% (${passed}/${total} checks passaram)`);
  console.log('='.repeat(60) + '\n');

  if (score >= 90) {
    console.log('🏆 EXCELENTE! Sistema pronto para produção.');
  } else if (score >= 70) {
    console.log('✅ BOM! Corrija os warnings para produção.');
  } else {
    console.log('⚠️  ATENÇÃO! Corrija os erros críticos antes de deploy.');
  }
}

// EXECUTAR VALIDAÇÕES
validateSecurity();
validatePerformance();
validateArchitecture();
validateDocumentation();
generateReport();
