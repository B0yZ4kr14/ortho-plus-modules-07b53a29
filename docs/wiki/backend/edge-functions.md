# ⚡ Edge Functions - Ortho+ V4.0

## 🎯 Visão Geral

Edge Functions são funções serverless que rodam na borda (edge) da rede Supabase, próximas aos usuários finais. No Ortho+, elas são usadas para:

- 🔐 Lógica de negócio sensível (que não pode rodar no client)
- 🤖 Processamento de IA
- 📧 Envio de emails/SMS
- 🔗 Integração com APIs externas
- ⚙️ Tarefas agendadas (cron jobs)

---

## 📁 Estrutura de Arquivos

```
supabase/functions/
├── process-recalls/          # Processar recalls automáticos
│   └── index.ts
├── send-notification/        # Enviar notificações (email/SMS)
│   └── index.ts
├── analyze-radiography/      # Análise de radiografia com IA
│   └── index.ts
├── generate-tiss-guide/      # Gerar guia TISS
│   └── index.ts
└── toggle-module/            # Ativar/Desativar módulos
    └── index.ts
```

---

## 🛠️ Anatomia de uma Edge Function

### Estrutura Básica

```typescript
// supabase/functions/minha-funcao/index.ts

// 1. CORS Headers (obrigatório para web apps)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 2. Handler principal
Deno.serve(async (req) => {
  // 2.1 Tratar OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 2.2 Autenticação (se necessário)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autorizado');
    }

    // 2.3 Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Service role para bypass RLS
      { auth: { persistSession: false } }
    );

    // 2.4 Lógica de negócio
    const { data } = await req.json();
    const result = await processLogic(supabaseClient, data);

    // 2.5 Retornar resposta
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // 2.6 Tratamento de erros
    console.error('Erro na function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

---

## 📝 Exemplos Práticos

### 1. `process-recalls` - Processar Recalls Automáticos

**Propósito**: Identificar pacientes que precisam retornar e enviar notificações.

```typescript
// supabase/functions/process-recalls/index.ts

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Buscar tratamentos finalizados há 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: tratamentos, error } = await supabase
      .from('pep_tratamentos')
      .select('*, prontuarios(*)')
      .eq('status', 'CONCLUIDO')
      .lte('data_conclusao', sixMonthsAgo.toISOString());

    if (error) throw error;

    // Criar notificações de recall
    const recalls = tratamentos.map(t => ({
      patient_id: t.prontuarios.patient_id,
      type: 'RECALL',
      message: `Olá! Já faz 6 meses do seu tratamento de ${t.tipo_tratamento}. Agende uma consulta de retorno.`,
      scheduled_for: new Date(),
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(recalls);

    if (insertError) throw insertError;

    console.log(`✅ ${recalls.length} recalls processados`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: recalls.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro ao processar recalls:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

**Como agendar** (cron job):

```sql
-- Executar toda segunda às 9h
SELECT cron.schedule(
  'process-recalls-weekly',
  '0 9 * * 1', -- Segunda às 9h
  $$
  SELECT net.http_post(
    url := 'https://seu-projeto.supabase.co/functions/v1/process-recalls',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

---

### 2. `send-notification` - Enviar Notificações

**Propósito**: Enviar emails e SMS via Resend/Twilio.

```typescript
// supabase/functions/send-notification/index.ts

import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html } = await req.json();

    // Enviar email
    const { data, error } = await resend.emails.send({
      from: 'Ortho+ <noreply@orthoplus.com>',
      to,
      subject,
      html,
    });

    if (error) throw error;

    console.log(`✅ Email enviado para: ${to}`);

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

---

### 3. `analyze-radiography` - Análise de IA

**Propósito**: Analisar radiografias com OpenAI Vision.

```typescript
// supabase/functions/analyze-radiography/index.ts

import OpenAI from 'npm:openai@4.20.0';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, tipoRadiografia } = await req.json();

    // Análise com GPT-4 Vision
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analise esta radiografia ${tipoRadiografia} e identifique possíveis problemas.`
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 500,
    });

    const resultado = completion.choices[0].message.content;

    console.log(`✅ Radiografia analisada: ${tipoRadiografia}`);

    return new Response(
      JSON.stringify({ 
        resultado,
        confidence: 0.85,
        problemasDetectados: 2,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na análise de IA:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

---

## 🔐 Segurança em Edge Functions

### 1. Autenticação

**Sempre valide o JWT**:

```typescript
// Verificar se usuário está autenticado
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response('Unauthorized', { status: 401 });
}

// Extrair e validar JWT
const token = authHeader.replace('Bearer ', '');
const { data: { user }, error } = await supabase.auth.getUser(token);

if (error || !user) {
  return new Response('Invalid token', { status: 401 });
}
```

### 2. Validação de Input

**Sempre valide os inputs**:

```typescript
const { email, name } = await req.json();

// Validações
if (!email || !email.includes('@')) {
  return new Response(
    JSON.stringify({ error: 'Email inválido' }),
    { status: 400, headers: corsHeaders }
  );
}

if (!name || name.trim().length === 0) {
  return new Response(
    JSON.stringify({ error: 'Nome é obrigatório' }),
    { status: 400, headers: corsHeaders }
  );
}
```

### 3. Rate Limiting

**Proteger contra abuso**:

```typescript
// Verificar rate limit
const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';

const { count } = await supabase
  .from('rate_limit_log')
  .select('*', { count: 'exact', head: true })
  .eq('ip_address', ipAddress)
  .eq('endpoint', 'analyze-radiography')
  .gte('window_start', new Date(Date.now() - 60000).toISOString()); // Últimos 60s

if (count && count > 10) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded' }),
    { status: 429, headers: corsHeaders }
  );
}
```

---

## 🧪 Testando Edge Functions

### 1. Teste Local (Lovable Dev)

As Edge Functions são deployadas automaticamente quando você salva o código no Lovable.

### 2. Teste via cURL

```bash
# Testar function localmente
curl -X POST https://seu-projeto.supabase.co/functions/v1/process-recalls \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3. Teste via Código

```typescript
// No frontend
const { data, error } = await supabase.functions.invoke('process-recalls', {
  body: { clinicId: 'xxx' }
});

if (error) {
  console.error('Erro:', error);
} else {
  console.log('Sucesso:', data);
}
```

---

## 📊 Monitoramento

### 1. Logs em Tempo Real

```typescript
// Adicionar logs estruturados
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  function: 'process-recalls',
  action: 'processing',
  clinicId: 'xxx',
  recordsProcessed: 42,
}));
```

### 2. Métricas

Acessar via:
- **Lovable**: Cloud tab → Edge Functions → Logs
- **Supabase**: Dashboard → Edge Functions → Invocations

**Métricas importantes**:
- Invocations por minuto
- Tempo de execução médio
- Taxa de erro
- Cold start time

---

## ⚠️ Boas Práticas

### ✅ DO

- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` para bypass RLS (quando necessário)
- ✅ Sempre trate erros e retorne status HTTP corretos
- ✅ Use CORS headers em todas as functions web-facing
- ✅ Valide todos os inputs
- ✅ Adicione logs estruturados (JSON)
- ✅ Use tipos TypeScript
- ✅ Implemente timeout (evitar functions penduradas)

### ❌ DON'T

- ❌ Nunca exponha secrets em responses
- ❌ Não faça queries SQL raw (use Supabase client)
- ❌ Não processe arquivos grandes (> 10MB) sem streaming
- ❌ Não ignore erros silenciosamente
- ❌ Não use `console.log` para dados sensíveis
- ❌ Não execute loops infinitos ou recursão profunda

---

## 🚀 Deploy

### Automático (Lovable Cloud)

✅ **Deploy acontece automaticamente** quando você salva o código!

Não precisa fazer nada. O Lovable detecta mudanças em `supabase/functions/` e faz deploy automaticamente.

### Manual (Supabase CLI - Self-hosted)

```bash
# Deploy de uma function específica
supabase functions deploy process-recalls

# Deploy de todas
supabase functions deploy

# Verificar deploy
supabase functions list
```

---

## 🔗 Chamar Edge Functions do Frontend

### Método 1: `supabase.functions.invoke()` (Recomendado)

```typescript
import { supabase } from '@/integrations/supabase/client';

async function processRecalls() {
  const { data, error } = await supabase.functions.invoke('process-recalls', {
    body: { clinicId: 'xxx' }
  });

  if (error) {
    console.error('Erro:', error);
    return;
  }

  console.log('Recalls processados:', data.processed);
}
```

### Método 2: Fetch direto (não recomendado)

```typescript
// ❌ Evite usar fetch direto
const response = await fetch(
  'https://projeto.supabase.co/functions/v1/process-recalls',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clinicId: 'xxx' }),
  }
);
```

---

## 🛡️ Segurança Avançada

### 1. Validação de Role (ADMIN-only)

```typescript
// Verificar se usuário é ADMIN
const { data: profile } = await supabase
  .from('profiles')
  .select('app_role')
  .eq('id', user.id)
  .single();

if (profile?.app_role !== 'ADMIN') {
  return new Response(
    JSON.stringify({ error: 'Acesso negado' }),
    { status: 403, headers: corsHeaders }
  );
}
```

### 2. Validação de Tenant (Multi-tenancy)

```typescript
// Verificar se recurso pertence à clínica do usuário
const { data: resource } = await supabase
  .from('recursos')
  .select('clinic_id')
  .eq('id', resourceId)
  .single();

const { data: userProfile } = await supabase
  .from('profiles')
  .select('clinic_id')
  .eq('id', user.id)
  .single();

if (resource.clinic_id !== userProfile.clinic_id) {
  return new Response(
    JSON.stringify({ error: 'Recurso não pertence à sua clínica' }),
    { status: 403, headers: corsHeaders }
  );
}
```

---

## 📚 Referências

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Deploy](https://deno.com/deploy)
- [Lovable Cloud Functions](https://docs.lovable.dev/features/cloud)

---

**Autor**: Ortho+ Team  
**Versão**: 4.0  
**Data**: Novembro 2025
