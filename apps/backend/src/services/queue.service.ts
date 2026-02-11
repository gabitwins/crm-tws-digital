import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface Lead {
  id: string;
  currentQueue: string | null;
  status: string;
}

export class QueueService {
  getAgentTypeByQueue(queue: string): string {
    const queueMap: Record<string, string> = {
      'PRE_VENDA': 'prevenda',
      'CHECKOUT': 'prevenda',
      'POS_VENDA': 'posvenda',
      'RETENCAO': 'posvenda',
      'SUPORTE': 'suporte',
      'HUMANA': 'suporte'
    };
    return queueMap[queue] || 'prevenda';
  }

  async analyzeAndMoveQueue(lead: Lead, userMessage: string, aiResponse: string): Promise<void> {
    try {
      const lowerMessage = userMessage.toLowerCase();
      const lowerResponse = aiResponse.toLowerCase();

      let newQueue = lead.currentQueue;
      let newStatus = lead.status;

      if (lowerMessage.includes('comprar') || lowerMessage.includes('quero') || lowerMessage.includes('preço')) {
        newQueue = 'CHECKOUT';
        newStatus = 'pre_venda';
      }

      else if (lowerMessage.includes('problema') || lowerMessage.includes('erro') || lowerMessage.includes('não consigo')) {
        newQueue = 'SUPORTE';
        newStatus = 'suporte';
      }

      else if (lowerMessage.includes('cancelar') || lowerMessage.includes('reembolso')) {
        newQueue = 'HUMANA';
      }

      else if (lowerResponse.includes('obrigado pela compra') || lowerResponse.includes('venda concluída')) {
        newQueue = 'POS_VENDA';
        newStatus = 'aluno_ativo';
      }

      if (newQueue !== lead.currentQueue) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            currentQueue: newQueue as any,
            status: newStatus as any
          }
        });

        await prisma.queueHistory.create({
          data: {
            leadId: lead.id,
            queueType: newQueue as any,
            enteredAt: new Date()
          }
        });

        logger.info(`🔄 Lead ${lead.id} movido de ${lead.currentQueue} para ${newQueue}`);
      }

    } catch (error) {
      logger.error('Erro ao analisar fila:', error);
    }
  }

  async manualMoveQueue(leadId: string, toQueue: string, reason: string = 'manual'): Promise<void> {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead não encontrado');

    await prisma.lead.update({
      where: { id: leadId },
      data: { currentQueue: toQueue as any }
    });

    await prisma.queueHistory.create({
      data: {
        leadId,
        queueType: toQueue as any,
        enteredAt: new Date()
      }
    });

    logger.info(`✅ Lead ${leadId} movido manualmente para ${toQueue}`);
  }

  async moveToQueue(leadId: string, toQueue: string, reason: string = 'automatic'): Promise<void> {
    return this.manualMoveQueue(leadId, toQueue, reason);
  }

  async getAllQueuesStats(): Promise<Record<string, number>> {
    return this.getQueueStats();
  }

  async getQueueStats(): Promise<Record<string, number>> {
    const queues: string[] = ['PRE_VENDA', 'CHECKOUT', 'POS_VENDA', 'SUPORTE', 'RETENCAO', 'HUMANA'];
    const stats: Record<string, number> = {};

    for (const queue of queues) {
      const count = await prisma.lead.count({
        where: { currentQueue: queue as any, isActive: true }
      });
      stats[queue] = count;
    }

    return stats;
  }
}

export default new QueueService();
