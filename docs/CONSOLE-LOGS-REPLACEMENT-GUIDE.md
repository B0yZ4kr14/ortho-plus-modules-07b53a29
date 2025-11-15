# Guia de Substituição de Console.logs

## ✅ Status Atual

**Total de console.* no código**: 343 ocorrências em 129 arquivos
**Substituídos até agora**: 8 ocorrências (2.3%)

## 📋 Módulos Substituídos

### ✅ Concluídos
1. **src/lib/performance.ts** - 7 substituições
   - console.log → logger.log/info
   - console.warn → logger.warn
   
2. **src/components/crypto/CryptoPortfolioDashboard.tsx** - 3 substituições
   - console.error → logger.error

## 🎯 Próximas Prioridades

### ALTA PRIORIDADE (Dados Sensíveis)

#### 1. Módulo Crypto (32 ocorrências)
```bash
src/components/crypto/
├── BitcoinQRCodeDialog.tsx (2 console.error)
├── CryptoCalculator.tsx (2 console.error)
├── CryptoPerformanceReport.tsx (1 console.error)
├── DCABacktesting.tsx (1 console.error)
└── VolatilityAlerts.tsx (4 console.error)
```

**Padrão de Substituição**:
```typescript
// ❌ Antes
console.error('Error generating QR code:', error);

// ✅ Depois
import { logger } from '@/lib/logger';
logger.error('Error generating QR code', error);
```

#### 2. Módulo Financeiro (15 ocorrências)
```bash
src/components/financeiro/
├── PaymentDialog.tsx (1 console.error)
├── pdv/CupomFiscal.tsx (1 console.error)
├── pdv/ImpressoraFiscalConfig.tsx (2 console.error)
├── pdv/IntegracaoContabilConfig.tsx (2 console.error)
└── pdv/IntegracaoTEF.tsx (1 console.error)
```

#### 3. Use Cases (21 ocorrências)
```bash
src/application/use-cases/
├── agenda/SendConfirmacaoWhatsAppUseCase.ts (1 console.log)
├── crypto/ProcessWebhookUseCase.ts (1 console.log)
└── ... (outras use cases)
```

### MÉDIA PRIORIDADE (UI Components)

#### 4. Componentes BI (15 ocorrências)
```bash
src/components/bi/
├── ExportDashboardDialog.tsx (3 console.error)
└── ... (outros componentes BI)
```

#### 5. Componentes Settings (28 ocorrências)
```bash
src/components/settings/
├── BackupDiffViewer.tsx (1 console.error)
├── BackupIntegrityChecker.tsx (1 console.error)
├── BackupRestoreDialog.tsx (3 console.error)
├── DataMigrationWizard.tsx (2 console.error)
├── ModulePermissionsManager.tsx (4 console.error)
└── ... (outros)
```

### BAIXA PRIORIDADE (Utilities & Outros)

#### 6. Demais Componentes (238 ocorrências)
- GlobalSearch, CryptoRatesWidget, MarketRatesWidget, etc.

---

## 🔧 Script de Substituição em Massa

### Opção 1: Substituição Manual Seletiva (RECOMENDADO)
```bash
# 1. Substituir em crypto/* (ALTA PRIORIDADE)
find src/components/crypto -name "*.tsx" -exec sed -i \
  's/console\.error(\([^,]*\),/logger.error(\1,/g' {} +

# 2. Adicionar imports onde necessário
# (Fazer manualmente arquivo por arquivo)
```

### Opção 2: Script Automatizado (Cuidado!)
```typescript
// scripts/replace-console-logs.ts
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/integrations/supabase/**']
});

files.forEach(file => {
  let content = readFileSync(file, 'utf-8');
  
  // Adicionar import se não existir
  if (content.includes('console.') && !content.includes("from '@/lib/logger'")) {
    content = content.replace(
      /(import .* from .*;\n)/,
      `$1import { logger } from '@/lib/logger';\n`
    );
  }
  
  // Substituir console.*
  content = content.replace(/console\.log\(/g, 'logger.log(');
  content = content.replace(/console\.error\(/g, 'logger.error(');
  content = content.replace(/console\.warn\(/g, 'logger.warn(');
  content = content.replace(/console\.info\(/g, 'logger.info(');
  
  writeFileSync(file, content);
});
```

---

## ✅ Checklist de Validação

Após cada substituição, verificar:

- [ ] Import do logger adicionado
- [ ] Sintaxe correta (sem vírgula extra no final)
- [ ] Build sem erros TypeScript
- [ ] ESLint sem warnings
- [ ] Funcionalidade preservada (testar manualmente)

---

## 📊 Progresso Esperado

| Módulo | Total | Concluído | % |
|--------|-------|-----------|---|
| performance.ts | 7 | 7 | 100% |
| crypto/* | 32 | 3 | 9% |
| financeiro/* | 15 | 0 | 0% |
| use-cases/* | 21 | 0 | 0% |
| bi/* | 15 | 0 | 0% |
| settings/* | 28 | 0 | 0% |
| outros | 238 | 0 | 0% |
| **TOTAL** | **356** | **10** | **2.8%** |

---

## 🎯 Meta FASE 1

**Objetivo**: Substituir 100% dos console.* em módulos de ALTA PRIORIDADE
- ✅ performance.ts (100%)
- ⏳ crypto/* (9%)
- ⏳ financeiro/* (0%)
- ⏳ use-cases/* (0%)

**Timeline Estimado**: 2-3 horas para módulos de alta prioridade

---

**Última Atualização**: 2025-11-15
