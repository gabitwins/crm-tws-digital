import { prisma } from '../config/database';
import { openAIService, AIMessage } from '../services/openai.service';
import { logger } from '../utils/logger';
import { QueueService } from '../services/queue.service';
import { AgentType } from '@prisma/client';

interface AgentContext {
  leadId: string;
  leadName: string;
  products: string[];
  purchaseDate?: Date;
  conversationHistory: AIMessage[];
  tags: string[];
}

export class PosVendaAgent {
  private systemPrompt: string;
  private queueService: QueueService;

  constructor() {
    this.queueService = new QueueService();
    this.systemPrompt = `Você é um especialista em pós-venda, relacionamento e receita recorrente.

SEU OBJETIVO:
- Garantir excelente experiência do cliente
- Aumentar retenção e engajamento
- Gerar upsell e cross-sell
- Promover renovações e recompras
- Fortalecer relacionamento

REGRAS:
1. Seja proativo e atencioso
2. Acompanhe o progresso do aluno
3. Ofereça valor constantemente
4. Identifique oportunidades de upsell naturalmente
5. Mantenha relacionamento ativo
6. NÃO resolva problemas técnicos (isso é SUPORTE)

QUANDO TRANSFERIR PARA SUPORTE:
- Problemas de acesso
- Dúvidas técnicas sobre o produto
- Bugs ou erros
- Questões operacionais

AÇÕES DISPONÍVEIS:
- apply_tag: aplicar tag
- send_campaign: enviar campanha/oferta
- schedule_follow_up: agendar follow-up
- transfer_to_support: transferir para suporte

Seja sempre cordial, prestativo e focado em valor.`;
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

      await this.analyzeIntent(context, userMessage);

      return response.content;
    } catch (error) {
      logger.error('PosVendaAgent error:', error);
      throw error;
    }
  }

  private buildContextMessage(context: AgentContext): string {
    return `
CONTEXTO DO CLIENTE:
- Nome: ${context.leadName}
- Produtos: ${context.products.join(', ')}
- Data da compra: ${context.purchaseDate?.toLocaleDateString() || 'N/A'}
- Tags: ${context.tags.join(', ')}

Personalize sua resposta com base no histórico do cliente.
`;
  }

  private getAvailableFunctions() {
    return [
      {
        name: 'apply_tag',
        description: 'Aplica tag ao cliente',
        parameters: {
          type: 'object',
          properties: {
            tag: { type: 'string' }
          },
          required: ['tag']
        }
      },
      {
        name: 'send_campaign',
        description: 'Envia campanha ou oferta especial',
        parameters: {
          type: 'object',
          properties: {
            campaignType: { 
              type: 'string',
              enum: ['upsell', 'cross-sell', 'renewal', 'engagement']
            }
          },
          required: ['campaignType']
        }
      },
      {
        name: 'transfer_to_support',
        description: 'Transfere para suporte técnico',
        parameters: {
          type: 'object',
          properties: {
            issue: { type: 'string', description: 'Descrição do problema' }
          },
          required: ['issue']
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
      case 'send_campaign':
        await this.sendCampaign(context.leadId, args.campaignType);
        break;
      case 'transfer_to_support':
        await this.transferToSupport(context.leadId, args.issue);
        break;
    }
  }

  private async analyzeIntent(context: AgentContext, userMessage: string) {
    const lowerMessage = userMessage.toLowerCase();

    const technicalIssues = ['não consigo acessar', 'erro', 'bug', 'problema técnico', 'não funciona'];
    const upsellInterest = ['outros cursos', 'mais treinamentos', 'upgrade', 'versão premium'];

    if (technicalIssues.some(k => lowerMessage.includes(k))) {
      await this.transferToSupport(context.leadId, userMessage);
    } else if (upsellInterest.some(k => lowerMessage.includes(k))) {
      await this.applyTag(context.leadId, 'interesse-upsell');
    }
  }

  private async applyTag(leadId: string, tagName: string) {
    try {
      let tag = await prisma.tag.findUnique({ where: { name: tagName } });

      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: tagName,
            category: 'pos-venda',
            color: '#10b981'
          }
        });
      }

      await prisma.leadTag.upsert({
        where: {
          leadId_tagId: { leadId, tagId: tag.id }
        },
        create: { leadId, tagId: tag.id },
        update: {}
      });
    } catch (error) {
      logger.error('Error applying tag:', error);
    }
  }

  private async sendCampaign(leadId: string, campaignType: string) {
    await prisma.activity.create({
      data: {
        leadId,
        type: 'campaign_sent',
        description: `Campanha de ${campaignType} enviada`,
        metadata: { campaignType }
      }
    });

    logger.info(`Campaign ${campaignType} sent to lead ${leadId}`);
  }

  private async transferToSupport(leadId: string, issue: string) {
    await prisma.ticket.create({
      data: {
        leadId,
        title: 'Ticket via Pós-Venda',
        description: issue,
        status: 'OPEN',
        priority: 'MEDIUM',
        category: 'technical'
      }
    });

    await this.queueService.moveToQueue(leadId, 'SUPORTE' as any);

    logger.info(`Lead ${leadId} transferred to support`);
  }
}
