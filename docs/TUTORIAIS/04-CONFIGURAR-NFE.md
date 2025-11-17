# Tutorial: Como Configurar Emissão de NFe

**Nível:** Avançado  
**Tempo estimado:** 45-60 minutos  
**Módulo:** Financeiro → NFe

---

## Objetivo

Neste tutorial, você aprenderá a configurar o módulo de emissão de Nota Fiscal Eletrônica (NFe) para sua clínica, incluindo instalação de certificado digital, configuração de ambiente SEFAZ e emissão da primeira NFe de teste.

---

## Pré-requisitos

- Ter role **ADMIN**
- Módulo "NFe" ativado
- CNPJ da clínica cadastrado
- **Certificado Digital A1** (ICP-Brasil) válido
- Inscrição Estadual da clínica

---

## Passo 1: Obter Certificado Digital A1

### O Que É?

Certificado Digital A1 é um arquivo `.pfx` que **assina digitalmente** suas notas fiscais, garantindo autenticidade e validade jurídica.

### Onde Comprar?

Autoridades Certificadoras homologadas ICP-Brasil:
- Certisign
- Serasa Experian
- Valid Certificadora
- Soluti (Safeweb)

**Preço médio:** R$ 200 - R$ 400/ano

### Como Obter?

1. Acesse site de uma Autoridade Certificadora
2. Escolha: **Certificado Digital A1 - e-CNPJ**
3. Validade: 1 ano (renovação anual obrigatória)
4. Validação presencial: Levar documentos:
   - Contrato Social da clínica
   - CNPJ
   - RG e CPF do representante legal
5. Após validação, receba certificado `.pfx` + senha

⚠️ **IMPORTANTE:** Guarde o arquivo `.pfx` e a senha em local seguro!

---

## Passo 2: Configurar Dados Fiscais da Clínica

1. Acesse **Financeiro → NFe → Configurações**
2. Aba **"Dados da Empresa"**
3. Preencha:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIFICAÇÃO

Razão Social: ORTHO PLUS CLINICA ODONTOLOGICA LTDA
Nome Fantasia: Ortho Plus Centro
CNPJ: 12.345.678/0001-90
Inscrição Estadual: 123.456.789.012
Inscrição Municipal: 987654 (se aplicável)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENDEREÇO

CEP: 01310-100
Logradouro: Avenida Paulista
Número: 1234
Complemento: Sala 56
Bairro: Bela Vista
Município: São Paulo
UF: SP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTATO

Telefone: (11) 3456-7890
Email NFe: nfe@orthoplus.com.br
  (Email para onde SEFAZ enviará retornos)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGIME TRIBUTÁRIO

Regime: 
  ☑️ Simples Nacional
  ☐ Lucro Presumido
  ☐ Lucro Real

CNAE Principal: 8630-5/04 (Atividade odontológica)
```

4. Clique em **"Salvar Dados da Empresa"**

---

## Passo 3: Fazer Upload do Certificado Digital

1. Ainda em **Configurações**, aba **"Certificado Digital"**
2. Clique em **"Fazer Upload do Certificado (.pfx)"**
3. Selecione o arquivo `.pfx` recebido da Autoridade Certificadora
4. Digite a senha do certificado: `********`
5. Sistema valida e extrai informações:

```
✅ Certificado Válido

Titular: ORTHO PLUS CLINICA ODONTOLOGICA LTDA
CNPJ: 12.345.678/0001-90
Validade: 10/12/2025 até 10/12/2026
Emissor: AC CERTISIGN RFB G5

[Salvar Certificado]
```

6. Clique em **"Salvar Certificado"**

⚠️ **Segurança:** Certificado é armazenado **criptografado** (AES-256) no Supabase.

---

## Passo 4: Configurar Ambiente SEFAZ

### Escolher Ambiente

Você deve começar no **ambiente de Homologação** (teste) antes de ir para Produção.

```
┌─────────────────────────────────────────────────┐
│ AMBIENTE SEFAZ                                  │
│                                                 │
│ Ambiente Atual:                                 │
│   ☑️ Homologação (Teste)                       │
│   ☐ Produção (Real)                            │
│                                                 │
│ ⚠️ Use Homologação para aprender e testar.     │
│    Mude para Produção apenas quando estiver    │
│    confiante.                                   │
└─────────────────────────────────────────────────┘
```

### Configurar Série e Numeração

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NUMERAÇÃO DE NFe

Série: 1 (padrão)
Próximo Número: 1
  (sistema incrementará automaticamente)

Ambiente: Homologação
```

Clique em **"Salvar Configurações"**

---

## Passo 5: Emitir NFe de Teste (Homologação)

### Criar Cliente/Paciente

1. Vá em **Financeiro → Contas a Receber**
2. Crie um recebimento de teste:

```
Paciente: João da Silva (CPF: 123.456.789-00)
Descrição: Consulta ortodôntica
Valor: R$ 150,00
Data: Hoje
Status: PAGA ✅
Forma de Pagamento: PIX
```

### Emitir NFe

1. Na linha do recebimento, clique em **"Emitir NFe"**
2. Sistema abre formulário pré-preenchido:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DADOS DO DESTINATÁRIO (Automático)

Nome: João da Silva
CPF: 123.456.789-00
Endereço: (se cadastrado)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITENS/SERVIÇOS

Item 1:
  Descrição: Consulta ortodôntica
  Quantidade: 1
  Valor Unitário: R$ 150,00
  Valor Total: R$ 150,00
  NCM: 9999 (serviço)
  CFOP: 5933 (Prestação de serviços - dentro do estado)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPOSTOS (Simples Nacional)

ICMS: Não destacado (Simples Nacional)
ISS: 5% (R$ 7,50) - Retido pela clínica
  Código Serviço Municipal: 04.02.02

Valor Total da NFe: R$ 150,00
Impostos Aproximados (Lei 12.741): R$ 35,00 (23.33%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBSERVAÇÕES

"Documento emitido por ME ou EPP optante pelo Simples 
Nacional. Não gera direito a crédito fiscal de IPI."
```

3. Revise os dados
4. Clique em **"Transmitir para SEFAZ"**

### Aguardar Processamento

```
🔄 Enviando NFe para SEFAZ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ NFe Autorizada com Sucesso!

Número: 000.000.001
Série: 1
Chave de Acesso: 35250112345678000190550010000000011234567890
Data/Hora Autorização: 15/12/2025 14:32:15
Protocolo SEFAZ: 135250123456789

[Baixar XML]  [Baixar PDF (DANFE)]  [Enviar por Email]
```

5. Clique em **"Enviar por Email"** para enviar ao paciente

---

## Passo 6: Validar NFe no Site da SEFAZ

### Testar Autenticidade

1. Acesse: [Portal da Nota Fiscal Eletrônica](http://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx)
2. Digite a **Chave de Acesso** da NFe:
   ```
   35250112345678000190550010000000011234567890
   ```
3. Clique em **"Consultar"**
4. SEFAZ mostra:
   ```
   ✅ Nota Fiscal Eletrônica AUTORIZADA
   
   Número: 1
   Série: 1
   Emitente: ORTHO PLUS CLINICA ODONTOLOGICA LTDA
   Destinatário: JOÃO DA SILVA
   Valor: R$ 150,00
   Data Emissão: 15/12/2025 14:32:15
   Ambiente: HOMOLOGAÇÃO
   ```

**Se aparecer isso, sucesso!** ✅ Sua NFe foi emitida corretamente.

---

## Passo 7: Ativar Ambiente de Produção

Após testar e validar no ambiente de homologação:

1. Acesse **Configurações → Ambiente SEFAZ**
2. Marque: ☑️ **Produção (Real)**
3. Sistema exibe confirmação:

```
⚠️ ATENÇÃO: MUDANÇA PARA AMBIENTE DE PRODUÇÃO

Ao ativar o ambiente de Produção:
- NFe emitidas terão validade fiscal REAL
- Numeração será diferente (reinicia do 1)
- Cancelamentos e correções têm prazo legal (24h)
- Erros podem gerar multas da Receita Federal

Certifique-se de que:
☑️ Testou emissão em Homologação
☑️ Validou NFe no site da SEFAZ
☑️ Dados da empresa estão corretos
☑️ Certificado Digital está válido

[Cancelar]  [Ativar Produção]
```

4. Clique em **"Ativar Produção"**

**Pronto! Agora suas NFe têm validade fiscal real.** 🎉

---

## Passo 8: Emitir Primeira NFe de Produção

Repita o processo do Passo 5, mas agora em produção:

1. Criar recebimento real (paciente real)
2. Clicar em **"Emitir NFe"**
3. Transmitir para SEFAZ
4. **DIFERENÇA:** Agora a NFe é REAL e tem validade fiscal

---

## Funcionalidades Avançadas

### 1. Cancelar NFe

**Prazo:** Até 24 horas após emissão

1. Encontre a NFe na listagem
2. Clique em **"Cancelar NFe"**
3. Informe justificativa (mínimo 15 caracteres):
   ```
   Justificativa: Emitida por engano, paciente não compareceu
   ```
4. Clique em **"Confirmar Cancelamento"**
5. Sistema envia pedido de cancelamento à SEFAZ
6. Status muda para: **CANCELADA** ❌

⚠️ **Após 24h não é possível cancelar!**

---

### 2. Carta de Correção Eletrônica (CC-e)

**Para corrigir erros pequenos** (endereço, telefone, observações)

**Não pode corrigir:** Valores, produtos, impostos, CNPJ/CPF

1. Encontre a NFe na listagem
2. Clique em **"Emitir Carta de Correção"**
3. Descreva a correção:
   ```
   Correção: 
   Onde se lê: "Rua das Flores, 123"
   Leia-se: "Rua das Flores, 456"
   ```
4. Clique em **"Enviar CC-e para SEFAZ"**
5. CC-e é vinculada à NFe original

---

### 3. Inutilizar Numeração

**Quando pular números** (ex: erro no sistema)

1. Acesse **Configurações → Inutilização**
2. Preencha:
   ```
   Série: 1
   Número Inicial: 15
   Número Final: 17
   Justificativa: Números pulados por erro no sistema
   ```
3. Clique em **"Inutilizar Numeração"**
4. SEFAZ registra que esses números não serão usados

---

### 4. Contingência Offline (FS-DA)

**Se SEFAZ estiver fora do ar**

1. Sistema detecta automaticamente:
   ```
   ⚠️ SEFAZ indisponível. Ativar modo contingência?
   [Sim, ativar FS-DA]
   ```
2. NFe é emitida localmente (não enviada à SEFAZ)
3. Status: **CONTINGÊNCIA** ⏳
4. Quando SEFAZ voltar, sistema transmite automaticamente
5. Status muda para: **AUTORIZADA** ✅

---

## Manutenção do Certificado Digital

### Renovação Anual

**45 dias antes do vencimento**, sistema alerta:

```
⚠️ Certificado Digital vence em 45 dias!

Validade atual: 10/12/2026
Providencie renovação para evitar interrupção.

[Renovar Agora]  [Lembrar Depois]
```

**Para renovar:**
1. Comprar novo certificado A1 na Autoridade Certificadora
2. Fazer upload do novo `.pfx` em **Configurações**
3. Sistema substitui automaticamente

---

## Relatórios Fiscais

### 1. Resumo Mensal de NFe

**Financeiro → NFe → Relatórios**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMO MENSAL - Dezembro/2025

Total de NFe Emitidas: 147
Valor Total: R$ 42.350,00

Por Status:
  ✅ Autorizadas: 142 (96.6%)
  ❌ Canceladas: 3 (2.0%)
  ⚠️ Rejeitadas: 2 (1.4%)

Impostos Recolhidos:
  ISS (5%): R$ 2.117,50
  Simples Nacional (8%): R$ 3.388,00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. SPED Fiscal (Geração Automática)

1. Acesse **Financeiro → NFe → SPED Fiscal**
2. Escolha período: Dezembro/2025
3. Clique em **"Gerar SPED Fiscal"**
4. Sistema compila todas as NFe do período
5. Arquivo `.txt` é gerado (formato Receita Federal)
6. Enviar para contador para declaração

---

## Troubleshooting

### ❌ Erro: "Certificado Digital inválido"

**Causa:** Certificado expirado ou arquivo corrompido

**Solução:**
1. Verificar validade do certificado
2. Se expirado, renovar
3. Fazer novo upload do `.pfx`

### ❌ Erro: "Rejeição 539 - CNPJ do emitente inválido"

**Causa:** CNPJ configurado não bate com certificado

**Solução:**
1. Conferir CNPJ em **Configurações → Dados da Empresa**
2. Certificar que é o mesmo do certificado digital
3. Corrigir e tentar novamente

### ❌ Erro: "Timeout ao conectar com SEFAZ"

**Causa:** SEFAZ fora do ar ou internet instável

**Solução:**
1. Verificar status da SEFAZ: [status.nfe.fazenda.gov.br](http://status.nfe.fazenda.gov.br)
2. Se SEFAZ estiver fora, ativar modo contingência
3. Se internet instável, aguardar e tentar novamente

### ❌ Erro: "Duplicidade de NFe"

**Causa:** Tentando emitir NFe com mesmo número de outra já autorizada

**Solução:**
1. Verificar se NFe não foi emitida anteriormente
2. Se foi, usar a existente
3. Se foi por erro, cancelar a antiga e emitir nova

---

## Checklist de Configuração Completa

- [ ] Certificado Digital A1 comprado e válido
- [ ] Dados da empresa cadastrados corretamente
- [ ] Certificado `.pfx` uploaded no sistema
- [ ] Ambiente configurado (Homologação → Produção)
- [ ] NFe de teste emitida e validada
- [ ] Numeração configurada (série e próximo número)
- [ ] Email para recebimento de retornos SEFAZ configurado
- [ ] Regime tributário correto (Simples Nacional)
- [ ] CNAE principal cadastrado
- [ ] Integração com contador configurada (opcional)

---

## Conclusão

Parabéns! 🎉 Sistema de emissão de NFe configurado com sucesso.

Agora você pode:
- Emitir NFe automaticamente para cada recebimento
- Cancelar e corrigir notas quando necessário
- Gerar relatórios fiscais automaticamente
- Enviar SPED Fiscal para contador

---

## Próximos Passos

- [Tutorial: Como Configurar NFCe (PDV)](05-CONFIGURAR-NFCE.md)
- [Guia: Gestão Financeira](../GUIAS-USUARIO/05-GESTAO-FINANCEIRA.md)
- [Guia: Integração com Contabilidade](../GUIAS-USUARIO/10-INTEGRACAO-CONTABIL.md)

---

**Dúvidas?** Entre em contato com suporte técnico ou acesse o [FAQ](../GUIAS-USUARIO/13-FAQ-CLINICA.md)
