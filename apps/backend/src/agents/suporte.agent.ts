import { prisma } from '../config/database';
import { openAIService, AIMessage } from '../services/openai.service';
import { logger } from '../utils/logger';
import { QueueService } from '../services/queue.service';

interface AgentContext {
  leadId: string;
  leadName: string;
  ticketId?: string;
  issue: string;
  conversationHistory: AIMessage[];
  knowledgeBase: string[];
}

export class SuporteAgent {
  private systemPrompt: string;
  private queueService: QueueService;

  constructor() {
    this.queueService = new QueueService();
    this.systemPrompt = `Você é um especialista em suporte técnico e operacional.

SEU OBJETIVO:
- Resolver problemas técnicos dos alunos
- Responder dúvidas sobre o treinamento
- Orientar uso correto da plataforma
- Solucionar questões operacionais

REGRAS:
1. Use APENAS informações da base de conhecimento
2. Seja claro e objetivo
3. Dê passo a passo quando necessário
4. Se não souber, peça para consultar um humano
5. Nunca invente informações
6. Foque na solução, não no problema

QUANDO ESCALAR PARA HUMANO:
- Questão fora da base de conhecimento
- Problema complexo que requer análise técnica
- Cliente insistente ou insatisfeito

AÇÕES DISPONÍVEIS:
- search_knowledge: buscar na base de conhecimento
- update_ticket: atualizar status do ticket
- escalate_to_human: escalar para humano
- resolve_ticket: marcar como resolvido

Seja sempre prestativo e focado em resolver.`;
  }

  async processMessage(context: AgentContext, userMessage: string): Promise<string> {
    try {
      const knowledgeContext = await this.searchKnowledge(userMessage);

      const messages: AIMessage[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'system', content: this.buildContextMessage(context, knowledgeContext) },
        ...context.conversationHistory,
        { role: 'user', content: userMessage }
      ];

      const functions = this.getAvailableFunctions();
      const response = await openAIService.chat(messages, functions);

      if (response.functionCall) {
        await this.handleFunctionCall(context, response.functionCall);
      }

      return response.content;
    } catch (error) {
      logger.error('SuporteAgent error:', error);
      throw error;
    }
  }

  private buildContextMessage(context: AgentContext, knowledgeContext: string): string {
    return `
CONTEXTO DO ATENDIMENTO:
- Cliente: ${context.leadName}
- Ticket: ${context.ticketId || 'N/A'}
- Problema: ${context.issue}

BASE DE CONHECIMENTO RELEVANTE:
${knowledgeContext}

Use APENAS as informações acima para responder.
`;
  }

  private async searchKnowledge(query: string): Promise<string> {
    try {
      const results = await prisma.knowledgeBase.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 3
      });

      if (results.length === 0) {
        return 'Nenhuma informação encontrada na base de conhecimento.';
      }

      return results
        .map(r => `**${r.title}**\n${r.content}`)
        .join('\n\n---\n\n');
    } catch (error) {
      logger.error('Knowledge base search error:', error);
      return 'Erro ao buscar na base de conhecimento.';
    }
  }

  private getAvailableFunctions() {
    return [
      {
        name: 'update_ticket',
        description: 'Atualiza status do ticket',
        parameters: {
          type: 'object',
          properties: {
            status: { 
              type: 'string',
              enum: ['IN_PROGRESS', 'WAITING', 'RESOLVED']
            }
          },
          required: ['status']
        }
      },
      {
        name: 'escalate_to_human',
        description: 'Escala para atendente humano',
        parameters: {
          type: 'object',
          properties: {
            reason: { type: 'string' }
          },
          required: ['reason']
        }
      },
      {
        name: 'resolve_ticket',
        description: 'Marca ticket como resolvido',
        parameters: {
          type: 'object',
          properties: {
            solution: { type: 'string' }
          },
          required: ['solution']
        }
      }
    ];
  }

  private async handleFunctionCall(context: AgentContext, functionCall: any) {
    const { name, arguments: args } = functionCall;

    if (!context.ticketId) return;

    switch (name) {
      case 'update_ticket':
        await prisma.ticket.update({
          where: { id: context.ticketId },
          data: { status: args.status }
        });
        break;

      case 'escalate_to_human':
        await prisma.ticket.update({
          where: { id: context.ticketId },
          data: { 
            status: 'WAITING',
            priority: 'HIGH'
          }
        });
        await this.queueService.moveToQueue(context.leadId, 'HUMANA' as any);
        break;

      case 'resolve_ticket':
        await prisma.ticket.update({
          where: { id: context.ticketId },
          data: { 
            status: 'RESOLVED',
            resolvedAt: new Date()
          }
        });
        await this.queueService.moveToQueue(context.leadId, 'POS_VENDA' as any);
        break;
    }
  }
}
