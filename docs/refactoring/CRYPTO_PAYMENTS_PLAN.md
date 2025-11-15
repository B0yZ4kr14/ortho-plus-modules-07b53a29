---

## **Pagamentos Descentralizados (Crypto) \- Ortho+**

Projeto: Ortho+ SaaS B2B Multitenant  
Foco: Integração de pagamentos não-custodiais (compatíveis com carteiras open-source) para otimização de fluxo de caixa e Split de Pagamento.

### **1\. Arquitetura da Solução e ADR (Architecture Decision Record)**

Antes de listar as tarefas, definimos a arquitetura, que será documentada conforme seu plano de ADRs.

**ADR-016: Pagamentos Descentralizados (Não-Custodiais)**

* **Status:** Proposto  
* **Contexto:** O SaaS precisa de um método de pagamento moderno, de baixo custo e com liquidação instantânea. A análise de mercado identifica o "Split de Pagamento" como uma funcionalidade crítica para evitar bitributação. Recebimentos de alto valor (implantes, HOF) também sofrem com altas taxas de cartão.  
* **Decisão:** Implementaremos um sistema de pagamentos não-custodial. **O SaaS Ortho+ (VPS) NUNCA armazenará chaves privadas.** A solução será:  
  1. **BTCPay Server:** Uma instância open-source do BTCPay Server será co-hospedada no VPS (via Docker) para cada *tenant* (clínica) ou de forma centralizada.  
  2. **Configuração da Clínica:** A clínica usará sua própria hardware wallet (Trezor, Coldcard, KRUX, etc.) para gerar e salvar uma **xPub (Extended Public Key)** no Ortho+.  
  3. **Geração de Faturas:** O Ortho+ usará a API do BTCPay Server para gerar endereços de recebimento *únicos* (derivados da xPub) para cada fatura.  
* **Justificativa:**  
  * **Segurança (LGPD):** O SaaS não tem custódia dos fundos, eliminando um vetor de ataque massivo e alinhando-se aos requisitos de segurança de dados. A clínica mantém a soberania.  
  * **Open-Source:** Alinha-se ao seu interesse em tecnologia verificável.  
  * **Eficiência:** Resolve o "Split de Pagamento" de forma programática, instantânea e com custo de centavos (via Stablecoins).  
  * **Baixo Custo:** Reduz taxas de transação de alto valor (ex: 4-8% do cartão) para \<1%.  
* **Consequências:** Requer a adição de um novo serviço (BTCPay Server) ao stack do VPS e a educação do cliente (clínica) sobre como exportar uma xPub com segurança.

---

### **2\. Integração ao Backlog de Refatoração**

Este novo módulo não é bloqueante para a **FASE 0 (Estabilização)**. Ele depende diretamente da **FASE 1 (Foundation)** e pode ser executado em paralelo com a **FASE 2 (Modularização)**.

Adicionamos uma nova fase: **FASE 2.5: Módulo de Pagamentos (Crypto)**.

### **3\. Novas Tarefas (Tasks) para o Backlog**

Estas tarefas devem ser adicionadas ao seu plano:

| ID | Tarefa | Prioridade | Esforço | Dependências |
| :---- | :---- | :---- | :---- | :---- |
| **T2.5.1** | Infra: Setup e Hardening do BTCPay Server (Docker) no VPS | 🔴 ALTO | 1d | Acesso VPS |
| **T2.5.2** | DB: Criar Migration (Novas Tabelas: clinic\_crypto\_config, crypto\_invoices) | 🔴 ALTO | 4h | T1.1 |
| **T2.5.3** | Domain: Criar Entidades (CryptoInvoice), VOs (CryptoAddress), e Interfaces (ICryptoPaymentGateway) | 🟡 MÉDIO | 6h | T1.1 |
| **T2.5.4** | Infra: Criar Adapter BTCPayAdapter.ts (Implementar ICryptoPaymentGateway) | 🟡 MÉDIO | 1d | T2.5.1, T2.5.3 |
| **T2.5.5** | Backend: Criar Edge Functions (create-crypto-invoice, get-crypto-invoice-status, save-xpub-config) | 🟡 MÉDIO | 1.5d | T2.5.4 |
| **T2.5.6** | App: Criar Use Cases (CreateCryptoInvoiceUseCase, CheckPaymentStatusUseCase, SaveClinicCryptoConfigUseCase) | 🟡 MÉDIO | 1d | T1.3, T2.5.5 |
| **T2.5.7** | UI: Criar Tela de Configuração (Salvar xPub) no Painel Admin | 🟢 BAIXO | 6h | T2.5.6 |
| **T2.5.8** | UI: Criar Componente CryptoPaymentModal.tsx (QR Code \+ Polling de Status) | 🟡 MÉDIO | 1.5d | T2.5.6 |
| **T2.5.9** | App: Integrar com Event Bus (payment.confirmed) para atualizar Fatura (Módulo Financeiro) | 🟡 MÉDIO | 4h | T2.4 (Event Bus), T2.5.6 |
| **T2.5.10** | App: Criar Use Case ConfirmPaymentAndSplitUseCase (para Split de Pagamento 2.0) | 🟡 MÉDIO | 1d | T2.5.9 |

---

### **4\. Detalhamento Técnico (Code-Level)**

Abaixo estão os artefatos técnicos desta integração, seguindo seu plano de refatoração.

#### **4.1. DB Migration (IaC)**

Conforme seu plano de migrations, você adicionará:

SQL

\-- supabase/migrations/\[timestamp\]\_add\_crypto\_payment\_tables.sql

\-- Armazena a configuração da xPub da clínica  
CREATE TABLE public.clinic\_crypto\_config (  
  id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
  clinic\_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,  
  btcpay\_store\_id TEXT NOT NULL,  
  \-- A xPub deve ser criptografada (ex: usando pgsodium)  
  encrypted\_xpub TEXT NOT NULL,  
  \-- Endereços para o Split de Pagamento  
  payout\_address\_clinic TEXT,  
  payout\_address\_dentist\_default TEXT,  
  created\_at TIMESTAMPTZ DEFAULT now()  
);

\-- Armazena cada fatura de cripto gerada  
CREATE TABLE public.crypto\_invoices (  
  id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
  \-- Link para a fatura principal no módulo financeiro  
  finance\_invoice\_id UUID NOT NULL REFERENCES public.invoices(id),  
  clinic\_id UUID NOT NULL REFERENCES public.clinics(id),  
  btcpay\_invoice\_id TEXT NOT NULL,  
  amount\_brl NUMERIC(10, 2) NOT NULL,  
  amount\_crypto NUMERIC(18, 8),  
  currency TEXT NOT NULL, \-- ex: 'BTC', 'USDC'  
  receive\_address TEXT NOT NULL,  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'expired', 'invalid')),  
  tx\_id TEXT,  
  paid\_at TIMESTAMPTZ,  
  expires\_at TIMESTAMPTZ NOT NULL,  
  created\_at TIMESTAMPTZ DEFAULT now()  
);

\-- Habilitar RLS  
ALTER TABLE public.clinic\_crypto\_config ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.crypto\_invoices ENABLE ROW LEVEL SECURITY;

\-- Políticas (Exemplos)  
CREATE POLICY "Admins podem gerenciar sua própria config de cripto"  
ON public.clinic\_crypto\_config FOR ALL  
USING (clinic\_id \= (SELECT clinic\_id FROM public.profiles WHERE id \= auth.uid()))  
WITH CHECK (clinic\_id \= (SELECT clinic\_id FROM public.profiles WHERE id \= auth.uid()));

CREATE POLICY "Usuários podem ver e criar faturas para sua própria clínica"  
ON public.crypto\_invoices FOR ALL  
USING (clinic\_id \= (SELECT clinic\_id FROM public.profiles WHERE id \= auth.uid()));

#### **4.2. Definição das Edge Functions**

Seguindo seu padrão kebab-case:

* supabase/functions/save-xpub-config/index.ts  
  * **Método:** POST  
  * **Auth:** Requer perfil de ADMIN.  
  * **Body:** { xpub: "...", btcpayStoreId: "..." }  
  * **Ação:** Criptografa a xPub e a salva na tabela clinic\_crypto\_config.  
  * **Retorno:** { success: true }  
* supabase/functions/create-crypto-invoice/index.ts  
  * **Método:** POST  
  * **Auth:** Requer perfil MEMBER ou ADMIN.  
  * **Body:** { invoiceId: "...", amountBRL: 1500.00, currency: "USDC" }  
  * **Ação:** Chama o CreateCryptoInvoiceUseCase, que usa o BTCPayAdapter para criar a fatura no BTCPay Server.  
  * **Retorno:** (DTO da CryptoInvoice, contendo receiveAddress, amountCrypto, expires\_at).  
* supabase/functions/get-crypto-invoice-status/index.ts  
  * **Método:** GET  
  * **Auth:** Requer MEMBER ou ADMIN.  
  * **Query Params:** ?invoiceId=...  
  * **Ação:** Chama o CheckPaymentStatusUseCase para verificar o status no BTCPay Server. Se pago, dispara o evento payment.confirmed.  
  * **Retorno:** { status: "pending" | "confirmed" | "expired" }

#### **4.3. Detalhamento do Componente de UI**

Este componente se encaixa na sua Camada de Apresentação.

TypeScript

// src/presentation/components/modules/financial/CryptoPaymentModal.tsx  
import { useQuery } from '@tanstack/react-query';  
import { QRCode } from 'qrcode.react';  
import { supabase } from '@/integrations/supabase/client'; //  
import { LoadingSpinner } from '@/components/shared';  
import { useEventBus } from '@/shared/events/EventBus'; //

interface Props {  
  invoiceId: string;  
  amountBRL: number;  
  onClose: () \=\> void;  
}

export function CryptoPaymentModal({ invoiceId, amountBRL, onClose }: Props) {  
  const eventBus \= useEventBus();

  // 1\. Cria a fatura de cripto ao abrir o modal  
  const { data: cryptoInvoice, isLoading } \= useQuery({  
    queryKey: \['cryptoInvoice', invoiceId\],  
    queryFn: async () \=\> {  
      const { data }\_ \= await supabase.functions.invoke('create-crypto-invoice', {  
        body: { invoiceId, amountBRL, currency: 'USDC' },  
      });  
      return data;  
    },  
    staleTime: 15 \* 60 \* 1000, // Fatura é válida por 15 min  
  });

  // 2\. Faz polling do status da fatura  
  const { data: status } \= useQuery({  
    queryKey: \['cryptoStatus', cryptoInvoice?.btcpay\_invoice\_id\],  
    queryFn: async () \=\> {  
      const { data }\_ \= await supabase.functions.invoke(  
        'get-crypto-invoice-status',  
        { query: { invoiceId: cryptoInvoice?.btcpay\_invoice\_id } }  
      );  
      return data;  
    },  
    enabled: \!\!cryptoInvoice,  
    refetchInterval: 10000, // Polling a cada 10 segundos  
    onSuccess: (data) \=\> {  
      if (data.status \=== 'confirmed') {  
        // Dispara evento local para fechar modal e atualizar UI  
        eventBus.publish('payment.confirmed.local', { invoiceId });  
        onClose();  
      }  
    },  
  });

  if (isLoading || \!cryptoInvoice) {  
    return ;  
  }

  if (status?.status \=== 'confirmed') {  
    return (  
        
        \<h3\>✅ Pagamento Confirmado\!\</h3\>  
        \<p\>Seu pagamento foi recebido com sucesso.\</p\>  
        
    );  
  }

  const paymentLink \= \`${cryptoInvoice.currency.toLowerCase()}:${cryptoInvoice.receiveAddress}?amount=${cryptoInvoice.amountCrypto}\`;

  return (  
      
      \<h3\>Pagar com Cripto\</h3\>  
      \<p\>Envie {cryptoInvoice.amountCrypto} {cryptoInvoice.currency}\</p\>  
      \<p\>Para o endereço abaixo (ou use o QR Code):\</p\>  
        
        \<QRCode value={paymentLink} size={256} /\>  
        
      \<code\>{cryptoInvoice.receiveAddress}\</code\>  
      \<p\>Aguardando pagamento... Não feche esta janela.\</p\>  
      
  );  
}

---

### **5\. Otimização: "Split de Pagamento 2.0"**

Esta é a funcionalidade *killer* que sua análise de mercado identificou.

1. **Gatilho:** O get-crypto-invoice-status (ou um webhook do BTCPay Server) confirma o pagamento e dispara o evento payment.confirmed no Event Bus.  
2. **Listener:** Um listener (em outro módulo ou no financeiro) captura este evento.  
3. **Use Case:** Ele chama o ConfirmPaymentAndSplitUseCase (Task T2.5.10).  
4. Ação: Este Use Case:  
   a. Busca a clinic\_crypto\_config para obter os endereços de split (ex: 60% para payout\_address\_clinic, 40% para o endereço do dentista-executante).  
   b. Chama a API de "Payouts" do BTCPay Server.  
   c. O BTCPay Server, que agora detém os 1.000 USDC recebidos, executa automaticamente o split, enviando 600 USDC para a carteira da clínica e 400 USDC para a carteira do dentista.  
5. **Resultado:** A bitributação é eliminada instantaneamente. A clínica e o dentista recebem seus valores líquidos em segundos, com taxas mínimas.

---

### **6\. Riscos e Considerações de Segurança (LGPD)**

* **Risco de Exposição da xPub:**  
  * **Mitigação:** A xPub DEVE ser criptografada em repouso no banco de dados (usando pgsodium, nativo do Supabase). As RLS Policies devem garantir que apenas o service\_role (usado pelas Edge Functions) possa descriptografá-la para uso, e o ADMIN da clínica só possa escrevê-la.  
* **Volatilidade de Preço:**  
  * **Mitigação:** Priorizar o recebimento em **Stablecoins (USDC, USDT)**. Para BTC, o BTCPay Server já "trava" a cotação BRL no momento da criação da fatura, que deve ter uma expiração curta (15 minutos).  
* **Conformidade Fiscal (NFCe):**  
  * **Mitigação:** A criptomoeda é o *meio de pagamento*, não o *fato gerador*. O evento payment.confirmed DEVE acionar o módulo fiscal existente para a emissão da NFCe pelo valor *total* em BRL (ex: R$ 1.500,00), exatamente como faria com um pagamento em cartão.