/**
 * Lovable AI Service
 * Integração com modelos de IA via Lovable AI (sem API key necessária)
 */

export type AIModel = 
  | 'google/gemini-2.5-pro'        // Top-tier: multimodal + reasoning
  | 'google/gemini-2.5-flash'      // Balanced: speed + quality
  | 'google/gemini-2.5-flash-lite' // Fastest: simple tasks
  | 'openai/gpt-5'                 // Powerful all-rounder
  | 'openai/gpt-5-mini'            // Middle ground
  | 'openai/gpt-5-nano';           // Speed + cost saving

interface AIAnalysisRequest {
  imageBase64: string;
  model?: AIModel;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

interface AIAnalysisResponse {
  model: string;
  analysis: any;
  confidence: number;
  processingTimeMs: number;
  tokensUsed?: number;
}

export class LovableAIService {
  private defaultModel: AIModel = 'google/gemini-2.5-pro';
  private apiEndpoint = '/api/lovable-ai/analyze'; // Edge Function

  /**
   * Analisa uma radiografia usando IA
   */
  async analyzeRadiografia(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model || this.defaultModel,
          image: request.imageBase64,
          prompt: request.prompt,
          maxTokens: request.maxTokens || 2000,
          temperature: request.temperature || 0.3, // Baixa temperatura para análises médicas
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      const processingTimeMs = Date.now() - startTime;

      return {
        model: request.model || this.defaultModel,
        analysis: data.analysis,
        confidence: data.confidence || 0,
        processingTimeMs,
        tokensUsed: data.tokensUsed,
      };
    } catch (error) {
      console.error('LovableAI Error:', error);
      throw new Error('Falha ao processar análise de IA');
    }
  }

  /**
   * Gera um prompt otimizado para análise de radiografia
   */
  generateRadiografiaPrompt(tipoRx: string): string {
    const basePrompt = `
Você é um especialista em análise de radiografias odontológicas. Analise a imagem fornecida e retorne um JSON estruturado com:

1. **problemas_detectados**: Array de objetos com:
   - tipo: tipo do problema (cárie, fratura, reabsorção, etc.)
   - localizacao: dente(s) afetado(s)
   - severidade: baixa | moderada | alta | crítica
   - descricao: descrição detalhada
   - recomendacao: tratamento recomendado

2. **observacoes_gerais**: String com observações gerais sobre a radiografia

3. **dentes_avaliados**: Array com números dos dentes visíveis na imagem

4. **qualidade_imagem**: baixa | regular | boa | excelente

5. **requer_avaliacao_especialista**: boolean (true se detectar algo crítico)

IMPORTANTE:
- Seja preciso e conservador nas análises
- Sempre indique quando há necessidade de avaliação humana
- Classifique a confiança da análise
- Use nomenclatura odontológica padrão (FDI)
`;

    const specificPrompts = {
      PERIAPICAL: '\nFoque em: ápices radiculares, lesões periapicais, tratamentos endodônticos.',
      BITE_WING: '\nFoque em: cáries interproximais, crista óssea alveolar, adaptação de restaurações.',
      PANORAMICA: '\nFoque em: visão geral, dentes inclusos, lesões ósseas, ATM, seios maxilares.',
      OCLUSAL: '\nFoque em: fraturas, dentes inclusos, lesões na área oclusal.',
    };

    return basePrompt + (specificPrompts[tipoRx as keyof typeof specificPrompts] || '');
  }

  /**
   * Valida se o modelo está disponível
   */
  isModelAvailable(model: AIModel): boolean {
    const availableModels: AIModel[] = [
      'google/gemini-2.5-pro',
      'google/gemini-2.5-flash',
      'google/gemini-2.5-flash-lite',
      'openai/gpt-5',
      'openai/gpt-5-mini',
      'openai/gpt-5-nano',
    ];
    return availableModels.includes(model);
  }

  /**
   * Recomenda o melhor modelo baseado no caso de uso
   */
  recommendModel(complexity: 'simple' | 'moderate' | 'complex'): AIModel {
    switch (complexity) {
      case 'simple':
        return 'google/gemini-2.5-flash-lite';
      case 'moderate':
        return 'google/gemini-2.5-flash';
      case 'complex':
        return 'google/gemini-2.5-pro';
      default:
        return this.defaultModel;
    }
  }
}
