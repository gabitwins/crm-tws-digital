import { prisma } from '../config/database';
import { openAIService, AIMessage } from '../services/openai.service';
import { logger } from '../utils/logger';
import { QueueService } from '../services/queue.service';
import { LeadStatus, QueueType, AgentType } from '@prisma/client';

interface AgentContext {
  leadId: string;
  leadName: string;
  leadStatus: LeadStatus;
  currentQueue: QueueType | null;
  conversationHistory: AIMessage[];
  tags: string[];
  metadata?: any;
}

export class PreVendaAgent {
  private systemPrompt: string;
  private queueService: QueueService;

  constructor() {
    this.queueService = new QueueService();
    this.systemPrompt = `Você é um especialista em pré-venda e conversão.

SEU OBJETIVO:
- Converter leads em clientes
- Entender a dor do lead
- Qualificar o interesse
- Identificar objeções
- Apresentar o produto correto
- Direcionar para checkout

REGRAS:
1. Seja empático e consultivo
2. Faça perguntas qualificadoras
3. Identifique objeções e as supere
4. Mostre valor, não apenas preço
5. Crie urgência quando apropriado
6. Use linguagem natural e próxima

AÇÕES DISPONÍVEIS:
- apply_tag: aplicar tag ao lead
- move_to_queue: mover para outra fila
- create_activity: registrar atividade
- transfer_to_human: transferir para atendente humano

Responda sempre de forma profissional, clara e focada em conversão.`;
  }

  async processMessage(context: AgentContext, userMessage: string): Promise<string> {
    try {
      const messages: AIMessage[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'system', content: this.buildContextMessage(context) },
        ...context.conversationHistory,
        { role: 'user', content: userMessage }
      ];

      const functions = this.getAvailableFunctions();
      const response = await openAIService.chat(messages, functions);

      if (response.functionCall) {
        await this.handleFunctionCall(context, response.functionCall);
      }

      await this.analyzeAndUpdateLead(context, userMessage, response.content);

      return response.content;
    } catch (error) {
      logger.error('PreVendaAgent error:', error);
      throw error;
    }
  }

  private buildContextMessage(context: AgentContext): string {
    return `
CONTEXTO DO LEAD:
- Nome: ${context.leadName}
- Status: ${context.leadStatus}
- Fila: ${context.currentQueue}
- Tags: ${context.tags.join(', ')}

Analise o contexto e responda de forma personalizada.
`;
  }

  private getAvailableFunctions() {
    return [
      {
        name: 'apply_tag',
        description: 'Aplica uma tag ao lead',
        parameters: {
          type: 'object',
          properties: {
            tag: { type: 'string', description: 'Nome da tag' }
          },
          required: ['tag']
        }
      },
      {
        name: 'move_to_queue',
        description: 'Move o lead para outra fila',
        parameters: {
          type: 'object',
          properties: {
            queue: { 
              type: 'string', 
              enum: ['CHECKOUT', 'HUMANA', 'SUPORTE'],
              description: 'Fila de destino'
            }
          },
          required: ['queue']
        }
      },
      {
        name: 'transfer_to_human',
        description: 'Transfere para atendente humano',
        parameters: {
          type: 'object',
          properties: {
            reason: { type: 'string', description: 'Motivo da transferência' }
          },
          required: ['reason']
        }
      }
    ];
  }

  private async handleFunctionCall(context: AgentContext, functionCall: any) {
    const { name, arguments: args } = functionCall;

    switch (name) {
      case 'apply_tag':
        await this.applyTag(context.leadId, args.tag);
        break;
      case 'move_to_queue':
        await this.queueService.moveToQueue(context.leadId, args.queue as QueueType);
        break;
      case 'transfer_to_human':
        await this.queueService.moveToQueue(context.leadId, QueueType.HUMANA);
        await this.createActivity(context.leadId, 'Transferido para humano', args.reason);
        break;
    }
  }

  private async analyzeAndUpdateLead(
    context: AgentContext, 
    userMessage: string, 
    aiResponse: string
  ) {
    const intentKeywords = {
      checkout: ['quero comprar', 'como pago', 'fazer pedido', 'preço', 'valor'],
      objection: ['caro', 'não tenho tempo', 'não sei', 'talvez depois'],
      interest: ['interessado', 'quero saber mais', 'me conta', 'fale sobre']
    };

    const lowerMessage = userMessage.toLowerCase();

    if (intentKeywords.checkout.some(k => lowerMessage.includes(k))) {
      await this.applyTag(context.leadId, 'intencao-compra');
      await this.queueService.moveToQueue(context.leadId, QueueType.CHECKOUT);
    } else if (intentKeywords.objection.some(k => lowerMessage.includes(k))) {
      await this.applyTag(context.leadId, 'objecao-identificada');
    } else if (intentKeywords.interest.some(k => lowerMessage.includes(k))) {
      await this.applyTag(context.leadId, 'lead-quente');
    }
  }

  private async applyTag(leadId: string, tagName: string) {
    try {
      let tag = await prisma.tag.findUnique({ where: { name: tagName } });

      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: tagName,
            category: 'auto',
            color: '#3b82f6'
          }
        });
      }

      await prisma.leadTag.upsert({
        where: {
          leadId_tagId: {
            leadId,
            tagId: tag.id
          }
        },
        create: {
          leadId,
          tagId: tag.id
        },
        update: {}
      });

      logger.info(`Tag ${tagName} applied to lead ${leadId}`);
    } catch (error) {
      logger.error('Error applying tag:', error);
    }
  }

  private async createActivity(leadId: string, type: string, description: string) {
    await prisma.activity.create({
      data: {
        leadId,
        type,
        description
      }
    });
  }
}
