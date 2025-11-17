# Guia do Usuário: IA para Análise de Radiografias

**Módulo:** IA Radiografia  
**Roles permitidas:** ADMIN, MEMBER (com permissão)  
**Versão:** 4.0.0

---

## Visão Geral

O módulo de IA para Análise de Radiografias utiliza inteligência artificial para auxiliar dentistas na detecção de problemas odontológicos em radiografias, incluindo:

- Detecção automática de cáries
- Identificação de fraturas
- Análise de perda óssea (doença periodontal)
- Avaliação de tratamentos endodônticos
- Comparação de radiografias ao longo do tempo

---

## Upload de Radiografia

### Enviar Nova Radiografia

1. Acesse **IA Radiografia → Análises**
2. Clique em **"+ Nova Análise"**
3. Preencha:

```
Paciente: João Silva
Tipo de Radiografia:
  ☐ Periapical
  ☐ Bite-Wing (Interproximal)
  ☐ Panorâmica
  ☐ Cefalométrica
  
Dente(s): 36 (se aplicável)
Data da Radiografia: 20/12/2025
Motivo: Avaliação de dor
```

4. **Arraste e solte** a imagem ou clique em **"Escolher Arquivo"**
5. Formatos aceitos: JPG, PNG, DICOM
6. Tamanho máximo: 10 MB
7. Clique em **"Enviar para Análise"**

---

## Análise Automática

### Como Funciona

**Processamento:**
1. IA recebe a imagem (processamento em ~30-60 segundos)
2. Algoritmo de Deep Learning analisa radiografia
3. Detecta padrões anormais
4. Gera relatório com achados

**Status:**
- 🔄 **Processando:** IA analisando
- ✅ **Concluída:** Relatório disponível
- ❌ **Erro:** Falha na análise (imagem ilegível)

### Visualizar Resultados

Após análise concluída:

1. Clique na análise da lista
2. Modal abre com:
   - **Imagem da radiografia** (com marcações)
   - **Problemas detectados** (lista)
   - **Nível de confiança** da IA (%)
   - **Sugestões de tratamento**

---

## Interpretação dos Resultados

### Marcações na Imagem

A IA adiciona marcações visuais na radiografia:

| Cor | Significado |
|-----|-------------|
| 🔴 **Vermelho** | Problema crítico detectado (ex: cárie profunda) |
| 🟡 **Amarelo** | Atenção necessária (ex: cárie inicial) |
| 🟢 **Verde** | Normal/saudável |
| 🔵 **Azul** | Tratamento já realizado (ex: restauração) |

### Nível de Confiança

```
Confiança Alta (85-100%):
✅ IA está muito confiante na detecção
Recomendação: Alta probabilidade de acerto

Confiança Média (60-84%):
⚠️ IA detectou algo, mas com dúvidas
Recomendação: Verificar clinicamente

Confiança Baixa (< 60%):
❓ IA não tem certeza
Recomendação: Análise humana essencial
```

---

## Problemas Detectados

### Tipos de Achados

**1. Cáries**
```
Localização: Dente 36, superfície oclusal
Severidade: Moderada
Confiança: 92%
Descrição: Lesão cariosa atingindo dentina
Tratamento Sugerido: Restauração de resina composta
```

**2. Fraturas**
```
Localização: Dente 11, terço cervical
Tipo: Fratura horizontal
Confiança: 78%
Descrição: Possível fratura na raiz
Tratamento Sugerido: Radiografia adicional, possível exodontia
```

**3. Perda Óssea**
```
Localização: Região posterior inferior direita
Severidade: Moderada a severa
Confiança: 88%
Descrição: Perda óssea horizontal de ~40%
Tratamento Sugerido: Raspagem e alisamento radicular, 
                      reavaliação periodontal
```

**4. Problemas Endodônticos**
```
Localização: Dente 36
Tipo: Lesão periapical
Confiança: 85%
Descrição: Radiolucência periapical compatível com 
          abscesso crônico
Tratamento Sugerido: Retratamento endodôntico ou exodontia
```

**5. Restaurações Defeituosas**
```
Localização: Dente 46, restauração oclusal
Problema: Cárie secundária detectada sob restauração
Confiança: 81%
Tratamento Sugerido: Remoção e substituição da restauração
```

---

## Feedback para a IA

### Melhorar Acurácia

Após análise clínica, você pode dar feedback:

1. Clique em **"Dar Feedback"**
2. Escolha:
   - ✅ **IA estava correta**: Concordo com detecção
   - ❌ **IA estava incorreta**: Discordo, é falso positivo
   - ⚠️ **IA perdeu algo**: Falso negativo, não detectou problema

3. Adicione observações:
```
"A cárie detectada pela IA foi confirmada clinicamente.
Porém, havia também uma fratura não detectada."
```

4. Clique em **"Enviar Feedback"**

**Benefícios:**
- Treina a IA para melhorar
- Contribui para acurácia do sistema
- Seus feedbacks melhoram análises futuras

---

## Comparação de Radiografias

### Acompanhar Evolução

Compare radiografias do mesmo paciente ao longo do tempo:

1. Acesse **IA Radiografia → Comparação**
2. Selecione:
   - **Paciente:** João Silva
   - **Radiografia 1:** 01/06/2025 (inicial)
   - **Radiografia 2:** 20/12/2025 (atual)

3. Sistema exibe:
   - Imagens lado a lado
   - Diferenças destacadas
   - Análise de tendências:
     ```
     Perda Óssea:
     - Junho: 25%
     - Dezembro: 40%
     - Tendência: PIORANDO ⚠️
     
     Cárie Dente 36:
     - Junho: Inicial
     - Dezembro: Profunda
     - Tendência: PROGREDINDO 🔴
     ```

4. **Exportar Relatório Comparativo:**
   - Clique em **"Gerar Relatório PDF"**
   - Documento inclui imagens, gráficos e métricas

---

## Dashboard de Insights da IA

### Padrões Detectados

Acesse **IA Radiografia → Insights** para ver:

**1. Problemas Mais Comuns na Clínica**
```
📊 Top 5 Achados (últimos 90 dias):
1. Cáries interproximais (42%)
2. Perda óssea periodontal (28%)
3. Lesões periapicais (15%)
4. Cálculo dentário (10%)
5. Fraturas radiculares (5%)
```

**2. Evolução Temporal**

Gráfico mostrando:
- Número de análises por mês
- Taxa de problemas detectados
- Acurácia da IA (baseada em feedbacks)

**3. Recomendações Preventivas**

IA sugere ações baseadas em padrões:
```
⚠️ ALERTA: Alta incidência de cáries interproximais

Recomendação:
- Intensificar orientação de uso de fio dental
- Considerar aplicação tópica de flúor preventivo
- Reduzir intervalo entre profilaxias

Baseado em: 45 análises nos últimos 3 meses
```

---

## Histórico de Análises

### Visualizar Histórico por Paciente

1. Acesse perfil do paciente
2. Aba **"Radiografias IA"**
3. Timeline completa de análises:

```
📅 20/12/2025 - Panorâmica
   ✅ Análise concluída
   Achados: 3 problemas detectados
   [Ver Detalhes]

📅 01/06/2025 - Bite-Wing
   ✅ Análise concluída
   Achados: 1 problema detectado
   [Ver Detalhes]

📅 15/01/2025 - Periapical (dente 36)
   ✅ Análise concluída
   Achados: 0 problemas
   [Ver Detalhes]
```

---

## Filtros e Busca

### Buscar Análises

**IA Radiografia → Análises → Filtros**

```
Status:
  ☐ Concluída
  ☐ Processando
  ☐ Com erro

Tipo de Radiografia:
  ☐ Periapical
  ☐ Bite-Wing
  ☐ Panorâmica

Período:
  [Data Inicial] a [Data Final]

Nível de Severidade:
  ☐ Crítico
  ☐ Alto
  ☐ Moderado
  ☐ Baixo
```

Clique em **"Aplicar Filtros"**

---

## Estatísticas de Acurácia

### Monitorar Performance da IA

**IA Radiografia → Estatísticas**

```
📊 Métricas Gerais:

Total de Análises: 1.234
Feedbacks Recebidos: 456 (37%)

Taxa de Acerto:
✅ Verdadeiros Positivos: 89%
❌ Falsos Positivos: 8%
⚠️ Falsos Negativos: 3%

Confiança Média: 84%

Tempo Médio de Análise: 42 segundos
```

**Gráfico de Evolução:**
- Taxa de acerto ao longo do tempo
- Melhoria contínua do modelo

---

## Exportar Relatório para Paciente

### Gerar Relatório Simplificado

1. Após análise, clique em **"Gerar Relatório"**
2. Escolha tipo:
   - **Técnico:** Com todos os detalhes (para dentistas)
   - **Simplificado:** Linguagem acessível (para pacientes)

3. Relatório simplificado inclui:
```
Paciente: João Silva
Data: 20/12/2025
Tipo: Radiografia Panorâmica

Resumo:
A análise identificou algumas áreas que necessitam atenção:

1. Início de cárie no dente 36
   O que significa? Início de deterioração do dente.
   O que fazer? Restauração simples resolve.

2. Inflamação na gengiva (região posterior)
   O que significa? Gengiva está inflamada.
   O que fazer? Limpeza profissional + higiene reforçada.

Próximos Passos:
- Agendar consulta para tratamento
- Melhorar escovação
- Usar fio dental diariamente
```

4. Clique em **"Enviar por Email ao Paciente"**

---

## Limitações da IA

### O Que a IA NÃO Substitui

⚠️ **IMPORTANTE:**

A IA é uma **ferramenta de auxílio**, não substitui:
- Exame clínico presencial
- Julgamento profissional do dentista
- Testes complementares (vitalidade, sondagem)
- Anamnese completa

**Casos que Requerem Cuidado Extra:**
- Confiança < 70%: Sempre verificar clinicamente
- Crianças e adolescentes: Anatomia em desenvolvimento
- Pós-operatórios recentes: Imagem pode confundir IA
- Radiografias de baixa qualidade: IA pode errar

---

## Troubleshooting

### ❌ Análise retornou "Erro"

**Causas comuns:**
- Imagem de baixa qualidade/borrada
- Formato de arquivo não suportado
- Radiografia muito escura ou clara

**Solução:**
1. Verifique qualidade da imagem
2. Converta para JPG/PNG (se DICOM der erro)
3. Ajuste brilho/contraste antes de upload
4. Tente novamente

### ❌ IA detectou problema inexistente (Falso Positivo)

**Solução:**
1. Confie no seu julgamento clínico
2. Dê feedback: "IA estava incorreta"
3. Adicione observação explicando
4. Sistema aprende com o feedback

### ❌ IA não detectou problema óbvio (Falso Negativo)

**Solução:**
1. Dê feedback: "IA perdeu algo"
2. Descreva o que foi perdido
3. Registre manualmente no prontuário
4. Sistema melhora para próximas análises

---

## Boas Práticas

✅ **Qualidade da Imagem:**
- Use radiografias nítidas e bem contrastadas
- Evite imagens com ruído excessivo
- Posicionamento correto é essencial

✅ **Sempre Confirme Clinicamente:**
- IA sugere, você decide
- Não trate baseado apenas na IA
- Correlacione com sintomas e exame físico

✅ **Dê Feedback Regularmente:**
- Quanto mais feedback, melhor a IA
- Ajuda outros profissionais da clínica
- Contribui para evolução do sistema

✅ **Use Comparação Temporal:**
- Acompanhe evolução de lesões
- Identifique tendências
- Documente progressão/regressão

✅ **Eduque o Paciente:**
- Use relatório simplificado
- Mostre marcações visuais
- Explique achados de forma clara

---

## Casos de Uso Reais

### 1. Detecção Precoce de Cárie

**Situação:** Paciente assintomático em profilaxia de rotina

**Processo:**
1. Bite-wing tirada durante consulta
2. Upload para IA enquanto paciente aguarda
3. IA detecta cárie interproximal inicial (dente 36)
4. Dentista confirma visualmente com lupa
5. Tratamento realizado na mesma sessão

**Benefício:** Prevenção de cárie profunda futura

### 2. Acompanhamento de Doença Periodontal

**Situação:** Paciente em tratamento periodontal há 6 meses

**Processo:**
1. Comparação de radiografias (inicial vs atual)
2. IA mostra redução de perda óssea de 45% para 38%
3. Relatório comparativo gerado
4. Paciente motivado ao ver melhora visual

**Benefício:** Engajamento do paciente no tratamento

### 3. Segunda Opinião Rápida

**Situação:** Dentista em dúvida sobre diagnóstico

**Processo:**
1. Upload de radiografia periapical
2. IA sugere lesão periapical com 88% confiança
3. Dentista solicita teste de vitalidade para confirmar
4. Diagnóstico confirmado, tratamento planejado

**Benefício:** Confirmação objetiva aumenta confiança

---

## Segurança e Privacidade

### LGPD e Dados Sensíveis

✅ **Imagens são criptografadas** (AES-256)
✅ **Apenas usuários autorizados** podem acessar
✅ **Logs de acesso** registrados (auditoria)
✅ **Backup automático** das análises
✅ **Retenção configurável** (padrão: 5 anos)

### Onde os Dados São Processados?

- **Armazenamento:** Supabase (Brasil)
- **Processamento IA:** Google Cloud (South America - São Paulo)
- **Conformidade:** LGPD, HIPAA-equivalent

---

## Próximos Passos

- [Tutorial: Como Treinar a IA com Feedback](../TUTORIAIS/06-TREINAR-IA-RADIOGRAFIA.md)
- [Guia: Teleodontologia](08-TELEODONTOLOGIA.md)
- [Guia: Integração com DICOM](12-INTEGRACAO-DICOM.md)

---

**Dúvidas?** Acesse o [FAQ para Clínicas](13-FAQ-CLINICA.md)
