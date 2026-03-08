# Guia do Usuário: Backup e Recuperação de Dados

**Módulo:** Configurações → Backups  
**Roles permitidas:** ADMIN  
**Versão:** 4.0.0

---

## Visão Geral

O sistema de Backup e Recuperação garante que os dados da sua clínica estejam protegidos contra perdas, incluindo:

- Backup automático agendado
- Backup manual sob demanda
- Múltiplos destinos (cloud, local, FTP)
- Backups incrementais (apenas mudanças)
- Criptografia AES-256
- Restauração completa ou seletiva
- Teste automático de backups
- Retenção configurável (GFS)

---

## Tipos de Backup

### 1. Backup Completo (Full)

**O que inclui:**
- ✅ Todos os pacientes e prontuários
- ✅ Agenda completa
- ✅ Histórico financeiro
- ✅ Estoque e inventários
- ✅ Configurações do sistema
- ✅ Usuários e permissões
- ✅ Arquivos e imagens (radiografias, fotos)

**Quando usar:** Primeira vez ou mensalmente

**Tamanho médio:** 2-10 GB (varia conforme volume de dados)

---

### 2. Backup Incremental

**O que inclui:**
- ✅ Apenas registros **novos ou modificados** desde último backup

**Quando usar:** Diariamente para economizar espaço

**Tamanho médio:** 50-500 MB

**Exemplo:**
```
Segunda: FULL (5 GB)
Terça: INCREMENTAL (100 MB) → apenas mudanças desde segunda
Quarta: INCREMENTAL (80 MB) → apenas mudanças desde terça
Quinta: INCREMENTAL (120 MB) → apenas mudanças desde quarta
```

---

### 3. Backup Diferencial

**O que inclui:**
- ✅ Tudo que mudou desde último backup **completo**

**Quando usar:** Semanalmente como ponto intermediário

**Tamanho médio:** 500 MB - 2 GB

---

## Configurar Backup Automático

### Passo 1: Acessar Configurações

1. Acesse **Configurações → Backups**
2. Clique em **"+ Novo Agendamento"**

### Passo 2: Configurar Periodicidade

```
┌────────────────────────────────────────────┐
│ CONFIGURAÇÃO DE BACKUP AUTOMÁTICO          │
├────────────────────────────────────────────┤
│                                            │
│ Nome: Backup Diário Automático             │
│                                            │
│ Tipo de Backup:                            │
│   ☑️ Incremental                           │
│   ☐ Completo                               │
│   ☐ Diferencial                            │
│                                            │
│ Frequência:                                │
│   ☐ Diária                                 │
│   ☐ Semanal (Domingo, 02:00)               │
│   ☑️ Mensal (Dia 1, 03:00)                │
│   ☐ Customizada (Cron)                     │
│                                            │
│ Horário: [02:00] (madrugada, menos uso)   │
│                                            │
│ Próxima Execução: 01/01/2026 às 03:00     │
│                                            │
└────────────────────────────────────────────┘
```

### Passo 3: Escolher Destinos

**Múltiplos destinos para redundância:**

```
Destino 1: ☑️ MinIO Storage (padrão)
  - Automático, sem configuração adicional
  - Armazenamento na nuvem (Brasil)
  - Custo: Incluído no plano

Destino 2: ☑️ AWS S3
  - Região: sa-east-1 (São Paulo)
  - Bucket: orthoplus-backups
  - Access Key: [configurar]
  - Secret Key: [configurar]

Destino 3: ☑️ Google Drive
  - Conta: backups@clinica.com.br
  - Pasta: /Backups Ortho Plus
  - [Conectar Google Account]

Destino 4: ☐ Dropbox
Destino 5: ☐ FTP/SFTP
Destino 6: ☐ Armazenamento Local (HD Externo)
```

### Passo 4: Configurar Criptografia

```
🔒 CRIPTOGRAFIA

☑️ Ativar criptografia AES-256

Senha de Criptografia: [**************]
  ⚠️ Guarde esta senha em local seguro!
     Sem ela, não será possível restaurar o backup.

Confirmar Senha: [**************]

[Gerar Senha Forte Aleatória]
```

### Passo 5: Política de Retenção (GFS)

**Grandfather-Father-Son (GFS):** Sistema inteligente de retenção

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POLÍTICA DE RETENÇÃO

Manter backups:
  Diários:   Últimos 7 dias
  Semanais:  Últimos 4 semanas
  Mensais:   Últimos 12 meses
  Anuais:    Últimos 5 anos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Exemplo prático:
- Hoje: Backup diário
- +7 dias: Backup ainda existe
- +8 dias: Backup diário deletado
- Mas: Se for domingo, vira "semanal" e fica + 4 semanas
- Se for dia 1, vira "mensal" e fica + 12 meses
- Se for 01/Jan, vira "anual" e fica + 5 anos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

☑️ Deletar backups automaticamente após período de retenção
```

### Passo 6: Notificações

```
📧 NOTIFICAÇÕES

Enviar email para: admin@clinica.com.br

Notificar quando:
☑️ Backup concluído com sucesso
☑️ Backup falhou
☑️ Espaço de armazenamento baixo (< 10%)
☐ Backup demorou mais de 2 horas (lento)
```

### Passo 7: Salvar

Clique em **"Salvar Agendamento"**

Sistema confirma:
```
✅ Agendamento criado com sucesso!

Próxima execução: 01/01/2026 às 03:00
```

---

## Realizar Backup Manual

**Quando fazer:** Antes de atualizações importantes ou migrações

1. Acesse **Configurações → Backups**
2. Clique em **"Backup Manual Agora"**
3. Escolha tipo: **Completo**
4. Escolha destinos: **Todos os configurados**
5. Clique em **"Iniciar Backup"**

**Progresso:**
```
🔄 Backup em andamento...

Exportando dados: ████████████░░░ 85%

Módulo: Pacientes          ✅ 12.543 registros
Módulo: Prontuários        ✅ 45.231 registros
Módulo: Agenda             ✅ 8.765 registros
Módulo: Financeiro         🔄 Processando... 23.456/45.000
Módulo: Estoque            ⏳ Aguardando
Módulo: Configurações      ⏳ Aguardando

Tamanho atual: 2.3 GB
Tempo decorrido: 5min 32s
Tempo estimado restante: 2min 18s
```

**Conclusão:**
```
✅ Backup concluído com sucesso!

Arquivo: backup_20251215_143205.zip
Tamanho: 3.2 GB (comprimido)
Tempo total: 7min 50s
Checksum SHA-256: abc123def456...

Enviado para:
✅ MinIO Storage
✅ AWS S3 (sa-east-1)
✅ Google Drive

[Baixar Backup]  [Ver Detalhes]
```

---

## Visualizar Histórico de Backups

**Configurações → Backups → Histórico**

```
┌───────────────────────────────────────────────────────────┐
│ Data/Hora         Tipo         Tamanho  Status  Destinos  │
├───────────────────────────────────────────────────────────┤
│ 15/12/25 14:32   Full         3.2 GB   ✅      3/3       │
│ 14/12/25 03:00   Incremental  120 MB   ✅      3/3       │
│ 13/12/25 03:00   Incremental  95 MB    ✅      3/3       │
│ 12/12/25 03:00   Incremental  ❌ Falhou  -      0/3      │
│ 11/12/25 03:00   Incremental  110 MB   ✅      3/3       │
│ 10/12/25 03:00   Incremental  88 MB    ✅      3/3       │
└───────────────────────────────────────────────────────────┘

[Filtros: Tipo | Status | Período]  [Exportar Lista]
```

**Ações:**
- 👁️ Ver detalhes
- 💾 Baixar backup
- 🔄 Restaurar
- 🗑️ Deletar
- ✔️ Testar integridade

---

## Restaurar Backup

### Quando Restaurar?

- ❌ Dados corrompidos ou deletados acidentalmente
- ❌ Atualização causou problemas
- ❌ Migração de servidor
- ❌ Disaster recovery (falha catastrófica)

### Passo 1: Escolher Backup

1. Acesse **Configurações → Backups → Histórico**
2. Encontre o backup desejado
3. Clique em **"Restaurar"**

### Passo 2: Escolher Modo de Restauração

```
┌────────────────────────────────────────────┐
│ MODO DE RESTAURAÇÃO                        │
├────────────────────────────────────────────┤
│                                            │
│ ☑️ Restauração Completa                    │
│    Apaga todos os dados atuais e restaura  │
│    backup completo.                        │
│    ⚠️ AÇÃO IRREVERSÍVEL                    │
│                                            │
│ ☐ Restauração Seletiva                     │
│    Escolhe apenas módulos específicos      │
│    (ex: apenas Pacientes)                  │
│                                            │
│ ☐ Restauração Merge                        │
│    Mescla dados do backup com atuais       │
│    (resolve conflitos manualmente)         │
│                                            │
└────────────────────────────────────────────┘
```

### Passo 3: Confirmar Restauração

```
⚠️⚠️⚠️ ATENÇÃO: RESTAURAÇÃO COMPLETA ⚠️⚠️⚠️

Você está prestes a APAGAR todos os dados atuais
e restaurar o backup de:

Data: 10/12/2025 03:00
Tamanho: 3.1 GB
Tipo: Full Backup

DADOS QUE SERÃO PERDIDOS:
- Todos os registros criados/modificados após 10/12/2025
- Configurações alteradas após 10/12/2025
- Uploads de arquivos após 10/12/2025

Esta ação NÃO PODE ser desfeita!

Digite "CONFIRMO RESTAURAÇÃO" para prosseguir:
[________________]

[Cancelar]  [Confirmar Restauração]
```

### Passo 4: Aguardar Restauração

```
🔄 Restaurando backup...

⏸️ Sistema em modo de manutenção
   Usuários foram desconectados

Restaurando: ███████████░░░░ 72%

Módulo: Banco de Dados     ✅ Restaurado
Módulo: Arquivos/Imagens   🔄 Restaurando... 1.2 GB / 1.8 GB
Módulo: Configurações      ⏳ Aguardando

Tempo decorrido: 12min 45s
Tempo estimado restante: 5min 12s
```

### Passo 5: Validação Pós-Restauração

```
✅ Restauração concluída!

Validando integridade dos dados...

✅ Banco de dados: OK (45.231 registros)
✅ Arquivos: OK (12.543 arquivos)
✅ Configurações: OK
✅ Estrutura de tabelas: OK
⚠️ Avisos: 3 arquivos não encontrados (deletados)

[Ver Relatório Completo]  [Reiniciar Sistema]
```

---

## Restauração Seletiva

**Quando usar:** Recuperar apenas dados específicos sem perder atualizações recentes

### Exemplo: Restaurar apenas Pacientes

1. Escolha backup
2. Selecione **"Restauração Seletiva"**
3. Marque módulos:
   ```
   Módulos para restaurar:
   ☑️ Pacientes (12.543 registros)
   ☐ Prontuários
   ☐ Agenda
   ☐ Financeiro
   ☐ Estoque
   ```

4. Escolha conflitos:
   ```
   Se houver conflito (mesmo ID):
   ☑️ Manter dados atuais
   ☐ Sobrescrever com backup
   ☐ Perguntar para cada caso
   ```

5. Restaurar

---

## Teste Automático de Backup

**Garantir que backups são restauráveis:**

1. Acesse **Configurações → Backups → Testes**
2. Clique em **"Agendar Teste Automático"**
3. Configure:
   ```
   Frequência: Mensal (dia 15, 04:00)
   
   Ações do teste:
   ☑️ Baixar backup mais recente
   ☑️ Validar checksums (SHA-256)
   ☑️ Descompactar e verificar estrutura
   ☑️ Restaurar em ambiente sandbox
   ☑️ Validar integridade de dados
   ☑️ Enviar relatório por email
   
   ⚠️ Não afeta ambiente de produção
   ```

4. Salvar

**Relatório de Teste:**
```
📊 RELATÓRIO DE TESTE DE BACKUP

Data: 15/12/2025 04:15
Backup Testado: backup_20251210_030000.zip

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESULTADOS:

✅ Download: OK (3.2 GB em 2min 12s)
✅ Checksums: OK (arquivo íntegro)
✅ Descompressão: OK (8.9 GB descomprimido)
✅ Estrutura: OK (todas as tabelas presentes)
✅ Restauração Sandbox: OK (18min 34s)
✅ Validação de Dados: OK (0 erros)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ESTATÍSTICAS:
- Pacientes: 12.543 (todos recuperados)
- Prontuários: 45.231 (todos recuperados)
- Imagens: 8.765 (todas recuperadas)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONCLUSÃO: ✅ BACKUP RESTAURÁVEL

Este backup pode ser usado com confiança
para recuperação de dados em caso de desastre.
```

---

## Backup Local (HD Externo)

### Configurar Destino Local

1. Conecte HD externo USB à máquina
2. Acesse **Configurações → Backups → Destinos**
3. Clique em **"+ Adicionar Destino Local"**
4. Configure:
   ```
   Nome: HD Externo Backups
   Caminho: E:\Backups_Ortho_Plus
   
   ☑️ Criar subpastas por data (YYYY/MM/DD)
   ☑️ Manter apenas últimos 30 dias localmente
   ```

**Vantagens:**
- ✅ Acesso offline
- ✅ Rápido (USB 3.0)
- ✅ Sem custos de cloud

**Desvantagens:**
- ❌ Risco de roubo/incêndio
- ❌ Precisa trocar HD periodicamente

---

## Monitoramento de Backups

### Dashboard de Status

**Configurações → Backups → Dashboard**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAÚDE DOS BACKUPS

Status Geral: ✅ SAUDÁVEL

Último Backup: Hoje às 03:00 (há 11 horas)
Próximo Backup: Amanhã às 03:00 (em 13 horas)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TAXA DE SUCESSO (últimos 30 dias)
✅ Sucessos: 29 (96.7%)
❌ Falhas: 1 (3.3%)

[Gráfico de Barras: Sucessos vs Falhas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARMAZENAMENTO

MinIO Storage:  2.3 GB / 10 GB (23%)
AWS S3:            8.9 GB / ∞
Google Drive:      4.2 GB / 15 GB (28%)

⚠️ Espaço ficando baixo em Google Drive!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TENDÊNCIA DE CRESCIMENTO

Média mensal: +500 MB
Estimativa 6 meses: +3 GB

[Gráfico de Linha: Crescimento ao Longo do Tempo]
```

---

## Troubleshooting

### ❌ Backup Falhou

**Erro:** "Timeout ao enviar para AWS S3"

**Soluções:**
1. Verificar conexão de internet
2. Verificar credenciais AWS
3. Aumentar timeout em Configurações
4. Tentar novamente manualmente

### ❌ Restauração Incompleta

**Erro:** "3 arquivos não encontrados"

**Causa:** Arquivos foram deletados após backup

**Solução:**
1. Usar backup mais antigo
2. Ou prosseguir sem esses arquivos

### ❌ Espaço Insuficiente

**Erro:** "Não há espaço para restaurar backup"

**Solução:**
1. Liberar espaço no servidor
2. Ou restaurar seletivamente (apenas módulos essenciais)

---

## Boas Práticas

✅ **Regra 3-2-1:**
- **3** cópias dos dados
- **2** tipos de mídia diferentes (cloud + local)
- **1** cópia off-site (fora da clínica)

✅ **Testar Backups Mensalmente:**
- Não confie cegamente, valide que são restauráveis

✅ **Criptografar Sempre:**
- Backups contêm dados sensíveis (LGPD)

✅ **Documentar Senha:**
- Guardar senha de criptografia em local seguro
- Sem senha = backup inútil

✅ **Monitorar Alertas:**
- Não ignorar emails de falha
- Investigar e corrigir imediatamente

---

## Próximos Passos

- [Tutorial: Como Configurar Backup](../TUTORIAIS/02-COMO-CONFIGURAR-BACKUP.md)
- [Guia: Segurança e LGPD](12-SEGURANCA-LGPD.md)
- [Guia Técnico: Disaster Recovery](../GUIAS-TECNICO/08-DISASTER-RECOVERY.md)

---

**Dúvidas?** Acesse o [FAQ](13-FAQ-CLINICA.md)
