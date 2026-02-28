# DATA MIGRATION DEBT

## Blocking Reason
Supabase connection string is not available. Real data cannot be migrated at this moment.

## Schema Status
Schema reconstructed from  to unblock Fases 2-5.

## Contingency Plans
- **OPÇÃO A: Migração Assíncrona (Recomendada)**
  - Continuar desenvolvimento com schema reconstruído + dados demo
  - Criar pipeline ETL isolado para migração de dados (quando connection string disponível)
  - Usar pg_dump + pg_restore com mapeamento de tenant_id
  - Validação: Checksums MD5 por tabela antes/após migração

- **OPÇÃO B: Greenfield com Importação Controlada**
  - Tratar VM201 como banco "novo" (sem dados históricos iniciais)
  - Criar interface de importação CSV/Excel para clínicas migrarem seus próprios dados

- **OPÇÃO C: Hybrid (Dump Parcial via Supabase CLI)**
  - Tentar extração via Supabase CLI se projeto estiver acessível.

## Target Sprint
End of Phase 4

