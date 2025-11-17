# Guia do Usuário: Teleodontologia

**Módulo:** Teleodontologia  
**Roles permitidas:** ADMIN, MEMBER (com permissão)  
**Versão:** 4.0.0

---

## Visão Geral

O módulo de Teleodontologia permite realizar consultas odontológicas remotas via videochamada, incluindo:

- Agendamento de teleconsultas
- Triagem pré-consulta online
- Videochamada integrada
- Receitas digitais
- Prescrições eletrônicas
- Histórico de teleconsultas

---

## Agendar Teleconsulta

### Passo 1: Criar Agendamento

1. Acesse **Teleodontologia → Agendamentos**
2. Clique em **"+ Nova Teleconsulta"**
3. Preencha:

```
Paciente: João Silva
Dentista: Dr. Carlos Mendes
Data: 20/12/2025
Horário: 14:00
Duração: 30 minutos
Tipo: Avaliação Inicial / Retorno / Urgência
Motivo: "Dor no dente 36"
```

4. Clique em **"Agendar"**

### Passo 2: Envio Automático de Notificações

O sistema envia automaticamente:
- ✉️ **Email** para paciente com:
  - Link da triagem pré-consulta
  - Link da videochamada (disponível 15min antes)
  - Instruções de acesso
- 📱 **WhatsApp** (se configurado)
- 🔔 **Notificação in-app**

---

## Triagem Pré-Consulta

### Como Funciona

**Para o Paciente:**
1. Recebe email com link único da triagem
2. Clica no link e preenche formulário online
3. Envia antes da consulta

**Para o Dentista:**
1. Acessa **Teleconsultas → Agenda do Dia**
2. Vê triagens completadas (✅) e pendentes (⏳)
3. Revisa informações antes da consulta

### Campos da Triagem

```
Queixa Principal:
- Descreva o motivo da consulta
- Quando começou?
- Intensidade da dor (0-10)

Sintomas:
☐ Dor
☐ Sensibilidade
☐ Sangramento
☐ Inchaço
☐ Mau hálito

Medicamentos Atuais:
- Lista de medicamentos em uso

Alergias:
- Alergias conhecidas

Foto/Vídeo (Opcional):
- Upload de imagem da região afetada
```

---

## Realizar Teleconsulta

### Iniciar Videochamada

1. **15 minutos antes** do horário agendado:
   - Link da videochamada fica **ativo**
   - Paciente recebe notificação

2. **Dentista:**
   - Acessa **Teleconsultas → Consultas de Hoje**
   - Clica em **"Iniciar Consulta"**
   - Testa áudio/vídeo
   - Clica em **"Entrar na Sala"**

3. **Paciente:**
   - Clica no link recebido por email
   - Autoriza câmera/microfone
   - Aguarda dentista entrar

### Ferramentas Durante a Consulta

**Barra de Ferramentas:**
- 🎥 Ligar/desligar câmera
- 🎤 Mutar/desmutar microfone
- 🖥️ Compartilhar tela
- 💬 Chat de texto
- 📋 Visualizar triagem
- 📝 Fazer anotações
- 🖼️ Ver imagens enviadas pelo paciente
- ⏱️ Timer de consulta

---

## Prescrição Eletrônica

### Durante ou Após a Consulta

1. Clique em **"Nova Prescrição"**
2. Preencha:

```
Medicamento: Amoxicilina 500mg
Posologia: 1 comprimido a cada 8 horas
Duração: 7 dias
Quantidade Total: 21 comprimidos
Orientações: Tomar com alimentos. Não interromper o tratamento.

Medicamento: Ibuprofeno 400mg
Posologia: 1 comprimido a cada 6 horas (se dor)
Duração: 5 dias
Quantidade Total: 20 comprimidos
Orientações: Tomar após refeições.
```

3. Clique em **"Gerar Receita Digital"**

### Assinatura Digital

- Sistema usa **certificado ICP-Brasil** (se configurado)
- Receita é válida legalmente
- PDF é enviado automaticamente ao paciente por email
- Código de verificação único

---

## Atestado Odontológico Digital

### Gerar Atestado

1. Durante/após consulta, clique em **"Novo Atestado"**
2. Preencha:

```
CID-10: K04.0 (Pulpite)
Descrição: Paciente necessita de tratamento endodôntico.
Dias de Afastamento: 2 dias
Data Início: 20/12/2025
Data Fim: 21/12/2025
Recomendações: Repouso e medicação conforme prescrição.
```

3. Clique em **"Gerar Atestado"**
4. PDF é gerado e enviado ao paciente

---

## Encerrar Consulta

### Finalização

1. Clique em **"Encerrar Consulta"**
2. Sistema registra:
   - Duração real da consulta
   - Diagnóstico
   - Conduta
   - Prescrições geradas
   - Próximas ações

3. Preencha campos obrigatórios:

```
Diagnóstico: Pulpite irreversível no dente 36
Conduta: Prescrição de antibiótico e anti-inflamatório. 
          Agendamento de tratamento endodôntico presencial.
Retorno: Agendar em 3 dias para reavaliação
Observações: Paciente relata dor intensa há 2 dias. 
             Não consegue mastigar do lado esquerdo.
```

4. Clique em **"Salvar e Encerrar"**

---

## Histórico de Teleconsultas

### Visualizar Histórico

**Por Paciente:**
1. Acesse perfil do paciente
2. Aba **"Teleconsultas"**
3. Lista cronológica de todas as teleconsultas

**Informações Disponíveis:**
- Data e hora
- Duração
- Dentista responsável
- Diagnóstico
- Prescrições emitidas
- Gravação (se habilitado)
- Triagem pré-consulta

---

## Gravação de Consultas

### Configurar Gravação

⚠️ **IMPORTANTE - LGPD:**
- Gravação requer **consentimento expresso** do paciente
- Consentimento deve ser coletado **antes** da consulta
- Gravações são armazenadas com criptografia

**Ativar Gravação:**
1. **Configurações → Teleodontologia → Gravação**
2. Marque **"Solicitar consentimento para gravar"**
3. No início da consulta, paciente vê popup:
   ```
   "Esta consulta será gravada para fins de 
   registro médico. Você autoriza a gravação?"
   
   [Aceito] [Recuso]
   ```

### Acessar Gravações

1. **Teleconsultas → Histórico**
2. Clique na consulta desejada
3. Botão **"Assistir Gravação"** (se disponível)

**Segurança:**
- Apenas ADMIN e dentista da consulta podem acessar
- Acesso é registrado em audit log
- Gravações expiram após 5 anos (configurável)

---

## Sala de Espera Virtual

### Gestão de Fila

**Dentista vê:**
- Pacientes aguardando na sala de espera
- Tempo de espera de cada paciente
- Triagem completada (✅) ou pendente (⏳)

**Paciente vê:**
- Mensagem: "Aguarde, o Dr. Carlos entrará em breve"
- Posição na fila (se múltiplos pacientes)
- Vídeos educativos (opcional)

---

## Integração com Agenda Presencial

### Converter Teleconsulta em Presencial

Após teleconsulta, se necessário atendimento presencial:

1. Clique em **"Agendar Consulta Presencial"**
2. Sistema pré-preenche:
   - Paciente
   - Dentista
   - Motivo (baseado na teleconsulta)
3. Escolha data/horário disponível
4. Clique em **"Confirmar Agendamento"**

Paciente recebe notificação automática.

---

## Relatórios de Teleconsultas

### Relatórios Disponíveis

| Relatório | Descrição |
|-----------|-----------|
| **Total de Teleconsultas** | Quantidade por período |
| **Duração Média** | Tempo médio de atendimento |
| **Taxa de Conclusão** | % de consultas realizadas vs canceladas |
| **Conversão Presencial** | % que agendaram consulta presencial após |
| **Satisfação do Paciente** | NPS e feedback |

### Exportar Relatório

1. **Teleconsultas → Relatórios**
2. Escolha período: Últimos 7/30/90 dias
3. Formato: PDF / Excel
4. Clique em **"Gerar Relatório"**

---

## Requisitos Técnicos

### Para Dentistas

**Hardware Mínimo:**
- Computador/Notebook com webcam
- Microfone (headset recomendado)
- Conexão de internet: 5 Mbps (download/upload)

**Software:**
- Navegador atualizado: Chrome, Firefox, Edge
- Sistema Operacional: Windows 10+, macOS 10.15+, Linux

### Para Pacientes

**Hardware Mínimo:**
- Smartphone, tablet ou computador com câmera
- Microfone integrado ou externo
- Conexão de internet: 3 Mbps

**Software:**
- Navegador moderno (Chrome, Safari, Firefox)
- Não requer instalação de apps

---

## Conformidade Legal (CFO)

### Resolução CFO 226/2020

O módulo de Teleodontologia do Ortho+ está em conformidade com:

✅ **Cadastro no e-DENTALCFO:**
- Dentistas devem estar cadastrados
- Clínica deve ter registro de atendimento remoto

✅ **Consentimento Informado:**
- Paciente assina termo antes da primeira teleconsulta
- Termo explica limitações do atendimento remoto

✅ **Prescrição Eletrônica:**
- Assinatura digital ICP-Brasil
- Código de verificação único

✅ **Registro em Prontuário:**
- Todas as teleconsultas são registradas no PEP
- Inclui data, hora, duração, diagnóstico e conduta

✅ **Privacidade (LGPD):**
- Videochamadas criptografadas (TLS 1.3)
- Dados armazenados com criptografia AES-256

---

## Troubleshooting

### ❌ Câmera/Microfone não funciona

**Solução:**
1. Verifique se navegador tem permissão:
   - Chrome: `chrome://settings/content/camera`
   - Firefox: Configurações → Privacidade → Permissões
2. Feche outros apps que usam câmera (Zoom, Teams)
3. Teste em: [webcamtests.com](https://webcamtests.com)

### ❌ Vídeo está travando

**Solução:**
1. Teste velocidade: [fast.com](https://fast.com)
2. Feche abas desnecessárias
3. Desative câmera e use apenas áudio
4. Reduza qualidade: Configurações → Vídeo → Baixa Qualidade

### ❌ Paciente não recebeu link

**Solução:**
1. Verifique email na caixa de spam
2. Reenvie notificação: Consulta → **"Reenviar Link"**
3. Copie link manualmente: Consulta → **"Copiar Link"** → Envie via WhatsApp

---

## Dicas e Boas Práticas

✅ **Ambiente Profissional:**
- Fundo neutro ou imagem institucional
- Iluminação adequada (frontal, não de trás)
- Ambiente silencioso

✅ **Comunicação Clara:**
- Fale pausadamente e de forma clara
- Use termos simples, evite jargões
- Confirme que paciente entendeu

✅ **Gestão de Tempo:**
- Reserve 5 minutos entre consultas
- Defina limite de duração (30-40 min)
- Priorize casos urgentes

✅ **Documentação:**
- Registre tudo no prontuário
- Tire screenshots se relevante
- Salve imagens enviadas pelo paciente

✅ **Segurança:**
- Nunca compartilhe links de consulta publicamente
- Use conexão segura (evite WiFi público)
- Faça logout após cada atendimento

---

## Casos de Uso Comuns

### 1. Avaliação Inicial de Dor

Paciente relata dor de dente. Dentista:
- Solicita descrever localização e intensidade
- Pede para mostrar região afetada na câmera
- Analisa foto enviada na triagem
- Prescreve medicação de alívio
- Agenda consulta presencial para exame detalhado

### 2. Retorno Pós-Operatório

Paciente fez extração há 3 dias. Dentista:
- Pergunta sobre dor, sangramento, inchaço
- Pede para mostrar região operada
- Avalia se cicatrização está normal
- Orienta cuidados adicionais
- Decide se precisa retorno presencial ou não

### 3. Segunda Opinião

Paciente quer segunda opinião sobre tratamento. Dentista:
- Revisa radiografias enviadas anteriormente
- Analisa orçamento de outro profissional
- Explica opções de tratamento
- Esclarece dúvidas técnicas
- Oferece agendar avaliação presencial

---

## Integração com Outros Módulos

### PEP (Prontuário Eletrônico)
- Teleconsultas ficam registradas no prontuário
- Histórico unificado (presencial + remoto)

### Agenda
- Teleconsultas aparecem na agenda geral
- Sincronização automática

### Financeiro
- Gerar cobrança de teleconsulta
- Emitir recibo

### Notificações
- Lembretes automáticos 24h antes
- Confirmação de agendamento

---

## Próximos Passos

- [Tutorial: Como Configurar Teleodontologia](../TUTORIAIS/05-CONFIGURAR-TELEODONTO.md)
- [Guia: IA para Análise de Radiografias](09-IA-RADIOGRAFIA.md)
- [Guia: Prescrições Digitais](11-PRESCRICOES-DIGITAIS.md)

---

**Dúvidas?** Acesse o [FAQ para Clínicas](13-FAQ-CLINICA.md)
