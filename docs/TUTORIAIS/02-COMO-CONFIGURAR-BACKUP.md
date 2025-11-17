# Tutorial: Como Configurar Backups Automáticos

**Nível:** Administrador  
**Tempo estimado:** 10 minutos  
**Módulo:** Configurações → Backups

---

## Objetivo

Neste tutorial, você aprenderá a configurar backups automáticos da sua clínica para garantir a segurança dos dados.

---

## Pré-requisitos

- Ter role **ADMIN** no sistema
- Módulo "Backups Avançados" ativado
- (Opcional) Credenciais de cloud storage (AWS S3, Google Drive, Dropbox)

---

## Passo 1: Acessar Configurações de Backup

1. No menu lateral, clique em **Configurações** (⚙️)
2. Selecione a aba **"Backups e Banco de Dados"**
3. Clique em **"Configurar Novo Backup"**

---

## Passo 2: Escolher Tipo de Backup

### Opções disponíveis:

| Tipo | Descrição | Recomendado para |
|------|-----------|------------------|
| **Full** | Backup completo de todos os dados | Primeira execução, backup semanal |
| **Incremental** | Apenas mudanças desde último backup | Backups diários automáticos |
| **Diferencial** | Mudanças desde último backup full | Backup intermediário |

**Recomendação padrão:**
- **Full**: 1x por semana (domingo 23h)
- **Incremental**: Diário (todo dia 2h da manhã)

---

## Passo 3: Configurar Destino de Armazenamento

### Opção 1: Armazenamento Local (Mais simples)
- Selecione: **"Armazenar localmente"**
- Backups ficam no servidor do sistema

### Opção 2: Cloud Storage (Recomendado para produção)

#### AWS S3:
1. Selecione **"AWS S3"**
2. Insira:
   - Access Key ID
   - Secret Access Key
   - Nome do Bucket
   - Região (ex: `us-east-1`)

#### Google Drive:
1. Selecione **"Google Drive"**
2. Clique em **"Conectar com Google"**
3. Autorize o acesso à sua conta

#### Dropbox:
1. Selecione **"Dropbox"**
2. Insira o Access Token da API Dropbox

---

## Passo 4: Configurar Segurança

### Criptografia (Altamente recomendado)
- ✅ Ativar criptografia AES-256-GCM
- Defina uma senha forte (mínimo 12 caracteres)
- **⚠️ IMPORTANTE:** Guarde esta senha em local seguro! Sem ela, os backups não podem ser restaurados.

### Compressão (Opcional)
- ✅ Ativar compressão ZIP
- Reduz tamanho dos backups em até 70%

---

## Passo 5: Configurar Agendamento

### Frequência:
- **Diário**: Executa todo dia no horário escolhido
- **Semanal**: Escolha o dia da semana
- **Mensal**: Escolha o dia do mês (1-28)

### Horário recomendado:
- Entre **02h-04h** (menor movimento da clínica)

### Retenção:
- **Backups diários**: Manter últimos 7 dias
- **Backups semanais**: Manter últimos 4 semanas
- **Backups mensais**: Manter últimos 12 meses

---

## Passo 6: Testar o Backup

Antes de salvar, faça um teste:

1. Clique em **"Executar Backup Teste"**
2. Aguarde conclusão (2-5 minutos)
3. Verifique o status: **✅ Sucesso**
4. Clique em **"Download do Backup Teste"** para validar

---

## Passo 7: Ativar e Salvar

1. Revise todas as configurações
2. Clique em **"Ativar Backup Automático"**
3. Aguarde confirmação: **"Backup agendado com sucesso!"**

---

## Monitoramento

### Dashboard de Backups

Acesse **Configurações → Backups → Dashboard Executivo** para visualizar:

- 📊 Taxa de sucesso dos backups
- 📦 Tamanho médio dos arquivos
- ⏱️ Tempo médio de execução
- 🚨 Falhas recentes (se houver)

### Notificações

Você receberá emails automáticos:
- ✅ Quando backup completar com sucesso
- ❌ Se houver falha (com detalhes do erro)
- ⚠️ Se espaço de armazenamento estiver baixo

---

## Restauração de Backup

### Em caso de necessidade:

1. Acesse **Configurações → Backups**
2. Clique na aba **"Histórico & Restauração"**
3. Selecione o backup desejado
4. Clique em **"Visualizar Conteúdo"**
5. Escolha o que restaurar (ou "Tudo")
6. Clique em **"Restaurar Selecionado"**

**⚠️ CUIDADO:** Restauração sobrescreve dados atuais!

---

## Troubleshooting

### ❌ Erro: "Falha ao conectar com AWS S3"
- Verifique suas credenciais Access Key/Secret Key
- Confirme que o bucket existe e está na região correta
- Valide permissões IAM (necessário `s3:PutObject`, `s3:GetObject`)

### ❌ Erro: "Espaço insuficiente"
- Libere espaço no servidor
- Configure política de retenção mais agressiva
- Ative compressão ZIP

### ❌ Erro: "Senha de criptografia inválida"
- A senha usada na restauração deve ser EXATAMENTE a mesma configurada no backup

---

## Boas Práticas

✅ **Regra 3-2-1:**
- 3 cópias dos dados
- 2 tipos de mídia diferentes
- 1 cópia offsite (cloud)

✅ **Teste restaurações periodicamente:**
- Mensalmente, faça um teste de restauração completo
- Valide que os dados estão íntegros

✅ **Monitore notificações:**
- Não ignore emails de falha de backup
- Configure alertas no Telegram/WhatsApp para backup crítico

✅ **Rotação de senhas:**
- Troque senha de criptografia a cada 6 meses
- Use gerenciador de senhas (1Password, Bitwarden)

---

## Conclusão

Backups automáticos configurados com sucesso! 🎉

Seus dados agora estão protegidos contra:
- Falhas de hardware
- Exclusões acidentais
- Ataques ransomware
- Desastres naturais

**Próximos passos:**
- [Tutorial: Como Migrar Dados Entre Clínicas](05-MIGRACAO-DADOS.md)
- [Tutorial: Como Configurar Auditoria LGPD](06-AUDITORIA-LGPD.md)

---

## Suporte

**Dúvidas?** Acesse o [FAQ de DevOps](../GUIAS-TECNICO/12-FAQ-DEVOPS.md) ou entre em contato com suporte técnico.
