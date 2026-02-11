import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { whatsappService } from '../services/whatsapp.service';
import { hotmartService } from '../services/hotmart.service';
import { kiwifyService } from '../services/kiwify.service';
import { PreVendaAgent } from '../agents/prevenda.agent';
import { PosVendaAgent } from '../agents/posvenda.agent';
import { SuporteAgent } from '../agents/suporte.agent';
import { QueueService } from '../services/queue.service';
import { logger } from '../utils/logger';
import { MessageDirection, MessageStatus, QueueType, LeadStatus, AgentType } from '@prisma/client';

export class WebhookController {
  private queueService: QueueService;
  private preVendaAgent: PreVendaAgent;
  private posVendaAgent: PosVendaAgent;
  private suporteAgent: SuporteAgent;

  constructor() {
    this.queueService = new QueueService();
    this.preVendaAgent = new PreVendaAgent();
    this.posVendaAgent = new PosVendaAgent();
    this.suporteAgent = new SuporteAgent();
  }

  async verifyWhatsApp(req: Request, res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const result = whatsappService.verifyWebhook(
      mode as string,
      token as string,
      challenge as string
    );

    if (result) {
      res.status(200).send(result);
    } else {
      res.sendStatus(403);
    }
  }

  async handleWhatsApp(req: Request, res: Response, next: NextFunction) {
    try {
      const incomingMessage = whatsappService.parseIncomingWebhook(req.body);

      if (!incomingMessage) {
        return res.sendStatus(200);
      }

      const { from, text, type } = incomingMessage;

      if (type !== 'text' || !text?.body) {
        return res.sendStatus(200);
      }

      let lead = await prisma.lead.findUnique({
        where: { whatsappId: from }
      });

      if (!lead) {
        lead = await prisma.lead.create({
          data: {
            whatsappId: from,
            name: 'Lead WhatsApp',
            phone: from,
            status: LeadStatus.lead,
            currentQueue: QueueType.PRE_VENDA,
            currentAgent: AgentType.PRE_VENDA,
            firstMessage: new Date(),
            lastInteraction: new Date()
          }
        });

        await this.queueService.moveToQueue(lead.id, QueueType.PRE_VENDA);
      } else {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { lastInteraction: new Date() }
        });
      }

      await prisma.message.create({
        data: {
          leadId: lead.id,
          direction: MessageDirection.INBOUND,
          content: text.body,
          messageType: 'text',
          status: MessageStatus.DELIVERED
        }
      });

      const conversationHistory = await this.getConversationHistory(lead.id);
      const tags = await this.getLeadTags(lead.id);

      let aiResponse: string = '';

      if (lead.currentAgent === AgentType.PRE_VENDA) {
        aiResponse = await this.preVendaAgent.processMessage({
          leadId: lead.id,
          leadName: lead.name,
          leadStatus: lead.status,
          currentQueue: lead.currentQueue,
          conversationHistory,
          tags
        }, text.body);
      } else if (lead.currentAgent === AgentType.POS_VENDA) {
        const products = await this.getLeadProducts(lead.id);
        aiResponse = await this.posVendaAgent.processMessage({
          leadId: lead.id,
          leadName: lead.name,
          products,
          conversationHistory,
          tags
        }, text.body);
      } else if (lead.currentAgent === AgentType.SUPORTE) {
        const ticket = await this.getActiveTicket(lead.id);
        aiResponse = await this.suporteAgent.processMessage({
          leadId: lead.id,
          leadName: lead.name,
          ticketId: ticket?.id,
          issue: ticket?.description || '',
          conversationHistory,
          knowledgeBase: []
        }, text.body);
      }

      if (aiResponse) {
        await whatsappService.sendTextMessage(from, aiResponse);

        await prisma.message.create({
          data: {
            leadId: lead.id,
            direction: MessageDirection.OUTBOUND,
            content: aiResponse,
            messageType: 'text',
            status: MessageStatus.SENT,
            aiGenerated: true,
            agentType: lead.currentAgent
          }
        });
      }

      res.sendStatus(200);
    } catch (error) {
      logger.error('WhatsApp webhook error:', error);
      res.sendStatus(500);
    }
  }

  async handleHotmart(req: Request, res: Response, next: NextFunction) {
    try {
      const webhookData = hotmartService.parseWebhook(req.body);

      let lead = await prisma.lead.findFirst({
        where: {
          OR: [
            { email: webhookData.buyer.email },
            { phone: webhookData.buyer.phone }
          ]
        }
      });

      if (!lead && webhookData.buyer.phone) {
        lead = await prisma.lead.create({
          data: {
            name: webhookData.buyer.name,
            email: webhookData.buyer.email,
            phone: webhookData.buyer.phone,
            status: LeadStatus.cliente,
            currentQueue: QueueType.POS_VENDA,
            currentAgent: AgentType.POS_VENDA
          }
        });
      }

      if (lead) {
        let product = await prisma.product.findUnique({
          where: { hotmartId: webhookData.productId }
        });

        if (!product) {
          product = await prisma.product.create({
            data: {
              name: webhookData.productName,
              hotmartId: webhookData.productId,
              price: webhookData.grossValue
            }
          });
        }

        await prisma.sale.create({
          data: {
            leadId: lead.id,
            productId: product.id,
            platform: 'hotmart',
            platformSaleId: webhookData.platformSaleId,
            grossValue: webhookData.grossValue,
            fees: webhookData.commission,
            netValue: webhookData.netValue,
            status: webhookData.status as any,
            purchaseDate: webhookData.purchaseDate,
            approvalDate: webhookData.approvalDate
          }
        });

        if (webhookData.status === 'APPROVED') {
          await this.queueService.moveToQueue(lead.id, QueueType.POS_VENDA);
        }
      }

      res.sendStatus(200);
    } catch (error) {
      logger.error('Hotmart webhook error:', error);
      res.sendStatus(500);
    }
  }

  async handleKiwify(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-kiwify-signature'] as string;
      const bodyString = JSON.stringify(req.body);

      if (!kiwifyService.verifyWebhookSignature(signature, bodyString)) {
        return res.sendStatus(401);
      }

      const webhookData = kiwifyService.parseWebhook(req.body);

      let lead = await prisma.lead.findFirst({
        where: {
          OR: [
            { email: webhookData.buyer.email },
            { phone: webhookData.buyer.phone }
          ]
        }
      });

      if (!lead && webhookData.buyer.phone) {
        lead = await prisma.lead.create({
          data: {
            name: webhookData.buyer.name,
            email: webhookData.buyer.email,
            phone: webhookData.buyer.phone,
            status: LeadStatus.cliente,
            currentQueue: QueueType.POS_VENDA,
            currentAgent: AgentType.POS_VENDA
          }
        });
      }

      if (lead) {
        let product = await prisma.product.findUnique({
          where: { kiwifyId: webhookData.productId }
        });

        if (!product) {
          product = await prisma.product.create({
            data: {
              name: webhookData.productName,
              kiwifyId: webhookData.productId,
              price: webhookData.grossValue
            }
          });
        }

        await prisma.sale.create({
          data: {
            leadId: lead.id,
            productId: product.id,
            platform: 'kiwify',
            platformSaleId: webhookData.platformSaleId,
            grossValue: webhookData.grossValue,
            fees: webhookData.fees,
            netValue: webhookData.netValue,
            installments: webhookData.installments,
            status: webhookData.status as any,
            purchaseDate: webhookData.purchaseDate,
            approvalDate: webhookData.approvalDate
          }
        });

        if (webhookData.status === 'APPROVED') {
          await this.queueService.moveToQueue(lead.id, QueueType.POS_VENDA);
        }
      }

      res.sendStatus(200);
    } catch (error) {
      logger.error('Kiwify webhook error:', error);
      res.sendStatus(500);
    }
  }

  private async getConversationHistory(leadId: string) {
    const messages = await prisma.message.findMany({
      where: { leadId },
      orderBy: { sentAt: 'asc' },
      take: 20
    });

    return messages.map(m => ({
      role: m.direction === MessageDirection.INBOUND ? 'user' as const : 'assistant' as const,
      content: m.content
    }));
  }

  private async getLeadTags(leadId: string): Promise<string[]> {
    const leadTags = await prisma.leadTag.findMany({
      where: { leadId },
      include: { tag: true }
    });

    return leadTags.map(lt => lt.tag.name);
  }

  private async getLeadProducts(leadId: string): Promise<string[]> {
    const sales = await prisma.sale.findMany({
      where: { leadId, status: 'APPROVED' },
      include: { product: true }
    });

    return sales.map(s => s.product.name);
  }

  private async getActiveTicket(leadId: string) {
    return prisma.ticket.findFirst({
      where: {
        leadId,
        status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING'] }
      },
      orderBy: { openedAt: 'desc' }
    });
  }
}
