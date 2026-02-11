import OpenAI from 'openai';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-development'
});

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  functionCall?: {
    name: string;
    arguments: any;
  };
}

export class OpenAIService {
  private model: string;

  constructor() {
    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
  }

  async generateResponse(
    userMessage: string,
    lead: any,
    agentType: 'prevenda' | 'posvenda' | 'suporte'
  ): Promise<string> {
    try {
      const systemPrompts = {
        prevenda: `Você é um vendedor consultivo especializado em conversão de leads.
Seu objetivo é entender a necessidade do cliente e conduzi-lo para a compra.
Seja empático, faça perguntas, identifique objeções e mostre o valor do produto.
Use uma linguagem natural e friendly. Responda em português brasileiro.`,

        posvenda: `Você é um especialista em sucesso do cliente.
Seu objetivo é onboarding, retenção, identificar oportunidades de upsell e renovação.
Seja proativo, solícito e focado na experiência do cliente.
Use uma linguagem natural e friendly. Responda em português brasileiro.`,

        suporte: `Você é um suporte técnico especializado.
Seu objetivo é resolver dúvidas técnicas e operacionais rapidamente.
Seja claro, objetivo e forneça soluções práticas passo a passo.
Use uma linguagem natural e friendly. Responda em português brasileiro.`
      };

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: systemPrompts[agentType]
        },
        {
          role: 'system',
          content: `Contexto do lead:
Nome: ${lead.name}
Status: ${lead.status}
Fila atual: ${lead.currentQueue}
Origem: ${lead.source}`
        },
        {
          role: 'user',
          content: userMessage
        }
      ];

      const response = await openai.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content || 'Desculpe, não consegui processar sua mensagem.';
    } catch (error) {
      logger.error('Erro ao gerar resposta:', error);
      return 'Desculpe, estou com dificuldades técnicas no momento. Tente novamente em instantes.';
    }
  }

  async chat(messages: AIMessage[], functions?: any[]): Promise<AIResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages,
        functions,
        temperature: 0.7,
        max_tokens: 1000
      });

      const choice = response.choices[0];
      const message = choice.message;

      return {
        content: message.content || '',
        functionCall: message.function_call ? {
          name: message.function_call.name,
          arguments: JSON.parse(message.function_call.arguments)
        } : undefined
      };
    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('OpenAI Embedding error:', error);
      throw error;
    }
  }
}

export const openAIService = new OpenAIService();
