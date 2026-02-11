import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { PRE_VENDA_AGENT, POS_VENDA_AGENT, SUPORTE_AGENT } from '../services/ai-agent.service';
import { logger } from '../utils/logger';

const router = Router();

// Webhook WhatsApp
router.post('/whatsapp', async (req: Request, res: Response) => {
  try {
    const { phone, message, name } = req.body;

    // Verificar/criar lead
    let lead = await prisma.lead.findUnique({
      where: { phone }
    });

    if (!lead) {
      // Criar novo lead
      lead = await prisma.lead.create({
        data: {
          phone,
          name: name || phone,
          status: 'lead',
          currentQueue: 'PRE_VENDA',
          currentAgent: 'PRE_VENDA',
          source: 'whatsapp'
        }
      });

      // Criar tags de origem
      const tagOrigem = await prisma.tag.findFirst({ where: { name: 'origem-whatsapp' } });
      if (tagOrigem) {
        await prisma.leadTag.create({
          data: {
            leadId: lead.id,
            tagId: tagOrigem.id
          }
        });
      }
    }

    // Salvar mensagem recebida
    await prisma.message.create({
      data: {
        leadId: lead.id,
        content: message,
        direction: 'INBOUND',
        status: 'DELIVERED'
      }
    });

    // Determinar qual agente deve responder
    const agent = await getAgentForLead(lead);

    // Buscar histórico de conversas
    const history = await prisma.message.findMany({
      where: { leadId: lead.id },
      orderBy: { sentAt: 'desc' },
      take: 10
    });

    const conversationHistory = history.reverse().map(msg => ({
      role: msg.direction === 'INBOUND' ? 'user' : 'assistant',
      content: msg.content
    })) as any;

    // Processar com IA
    const response = await agent.processMessage(lead.id, message, conversationHistory);

    // Retornar resposta para ser enviada via WhatsApp
    res.json({
      success: true,
      response: response.response,
      actions: response.actions
    });

  } catch (error) {
    logger.error('Erro webhook WhatsApp:', error);
    res.status(500).json({ success: false, error: 'Erro ao processar mensagem' });
  }
});

// Webhook Instagram
router.post('/instagram', async (req: Request, res: Response) => {
  try {
    const { sender_id, message, sender_name } = req.body;

    // Usar sender_id como identificador único
    const phone = `instagram_${sender_id}`;

    // Verificar/criar lead
    let lead = await prisma.lead.findUnique({
      where: { phone }
    });

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          phone,
          name: sender_name || sender_id,
          status: 'lead',
          currentQueue: 'PRE_VENDA',
          currentAgent: 'PRE_VENDA',
          source: 'instagram'
        }
      });

      // Criar tags de origem
      const tagOrigem = await prisma.tag.findFirst({ where: { name: 'origem-instagram' } });
      if (tagOrigem) {
        await prisma.leadTag.create({
          data: {
            leadId: lead.id,
            tagId: tagOrigem.id
          }
        });
      }
    }

    await prisma.message.create({
      data: {
        leadId: lead.id,
        content: message,
        direction: 'INBOUND',
        status: 'DELIVERED'
      }
    });

    const agent = await getAgentForLead(lead);

    const history = await prisma.message.findMany({
      where: { leadId: lead.id },
      orderBy: { sentAt: 'desc' },
      take: 10
    });

    const conversationHistory = history.reverse().map(msg => ({
      role: msg.direction === 'INBOUND' ? 'user' : 'assistant',
      content: msg.content
    })) as any;

    const response = await agent.processMessage(lead.id, message, conversationHistory);

    res.json({
      success: true,
      response: response.response,
      actions: response.actions
    });

  } catch (error) {
    logger.error('Erro webhook Instagram:', error);
    res.status(500).json({ success: false, error: 'Erro ao processar mensagem' });
  }
});

// Webhook Facebook Ads (captura de leads)
router.post('/facebook-ads', async (req: Request, res: Response) => {
  try {
    const { leadgen_id, field_data, ad_id, adset_id, campaign_id } = req.body;

    // Extrair dados do lead
    const phone = field_data.find((f: any) => f.name === 'phone_number')?.values[0];
    const name = field_data.find((f: any) => f.name === 'full_name')?.values[0];
    const email = field_data.find((f: any) => f.name === 'email')?.values[0];

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Telefone não fornecido' });
    }

    // Criar lead
    const lead = await prisma.lead.create({
      data: {
        phone,
        name: name || phone,
        email: email || undefined,
        status: 'lead',
        currentQueue: 'PRE_VENDA',
        currentAgent: 'PRE_VENDA',
        source: 'facebook-ads',
        customFields: {
          leadgen_id,
          ad_id,
          adset_id,
          campaign_id
        }
      }
    });

    // Criar tags
    const tagOrigem = await prisma.tag.findFirst({ where: { name: 'origem-facebook-ads' } });
    if (tagOrigem) {
      await prisma.leadTag.create({
        data: {
          leadId: lead.id,
          tagId: tagOrigem.id
        }
      });
    }

    res.json({ success: true, leadId: lead.id });

  } catch (error) {
    logger.error('Erro webhook Facebook Ads:', error);
    res.status(500).json({ success: false, error: 'Erro ao processar lead' });
  }
});

// Webhook Hotmart
router.post('/hotmart', async (req: Request, res: Response) => {
  try {
    const { event, data } = req.body;

    if (event === 'PURCHASE_COMPLETE' || event === 'PURCHASE_APPROVED') {
      const { buyer, product, purchase } = data;

      // Buscar lead pelo email ou telefone
      let lead = await prisma.lead.findFirst({
        where: {
          OR: [
            { email: buyer.email },
            { phone: buyer.phone }
          ]
        }
      });

      if (!lead) {
        // Criar lead se não existir
        lead = await prisma.lead.create({
          data: {
            phone: buyer.phone || `hotmart_${buyer.email}`,
            name: buyer.name,
            email: buyer.email,
            status: 'cliente',
            currentQueue: 'POS_VENDA',
            currentAgent: 'POS_VENDA',
            source: 'hotmart'
          }
        });

        // Criar tags
        const tagCliente = await prisma.tag.findFirst({ where: { name: 'cliente' } });
        if (tagCliente) {
          await prisma.leadTag.create({
            data: {
              leadId: lead.id,
              tagId: tagCliente.id
            }
          });
        }
      } else {
        // Atualizar status para cliente
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            status: 'aluno_ativo',
            currentQueue: 'POS_VENDA',
            currentAgent: 'POS_VENDA'
          }
        });

        // Adicionar tags
        const tagCliente = await prisma.tag.findFirst({ where: { name: 'cliente' } });
        if (tagCliente) {
          await prisma.leadTag.upsert({
            where: {
              leadId_tagId: {
                leadId: lead.id,
                tagId: tagCliente.id
              }
            },
            create: {
              leadId: lead.id,
              tagId: tagCliente.id
            },
            update: {}
          });
        }
      }

      // Registrar venda
      // Buscar ou criar produto
      let productRecord = await prisma.product.findFirst({ where: { name: product.name } });
      if (!productRecord) {
        productRecord = await prisma.product.create({
          data: {
            name: product.name,
            price: purchase.price.value,
            hotmartId: product.id || product.name
          }
        });
      }

      await prisma.sale.create({
        data: {
          leadId: lead.id,
          productId: productRecord.id,
          grossValue: purchase.price.value,
          fees: purchase.commission.value,
          netValue: purchase.price.value - purchase.commission.value,
          platform: 'Hotmart',
          platformSaleId: purchase.transaction,
          installments: purchase.payment.installments_number,
          status: 'APPROVED',
          purchaseDate: new Date(purchase.order_date),
          metadata: data
        }
      });

      // Mover para fila de Pós-Venda
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          currentQueue: 'POS_VENDA',
          currentAgent: 'POS_VENDA'
        }
      });

      // Enviar mensagem de boas-vindas automática
      const response = await POS_VENDA_AGENT.processMessage(
        lead.id,
        'Compra realizada com sucesso',
        []
      );

      res.json({ success: true, message: 'Venda processada', response: response.response });
    } else {
      res.json({ success: true, message: 'Evento ignorado' });
    }

  } catch (error) {
    logger.error('Erro webhook Hotmart:', error);
    res.status(500).json({ success: false, error: 'Erro ao processar venda' });
  }
});

// Webhook Kiwify
router.post('/kiwify', async (req: Request, res: Response) => {
  try {
    const { event_type, Customer, Product, Sale } = req.body;

    if (event_type === 'sale.approved') {
      let lead = await prisma.lead.findFirst({
        where: {
          OR: [
            { email: Customer.email },
            { phone: Customer.mobile }
          ]
        }
      });

      if (!lead) {
        lead = await prisma.lead.create({
          data: {
            phone: Customer.mobile || `kiwify_${Customer.email}`,
            name: Customer.full_name,
            email: Customer.email,
            status: 'cliente',
            currentQueue: 'POS_VENDA',
            currentAgent: 'POS_VENDA',
            source: 'kiwify'
          }
        });

        // Criar tags
        const tagCliente = await prisma.tag.findFirst({ where: { name: 'cliente' } });
        if (tagCliente) {
          await prisma.leadTag.create({
            data: {
              leadId: lead.id,
              tagId: tagCliente.id
            }
          });
        }
      } else {
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            status: 'aluno_ativo',
            currentQueue: 'POS_VENDA',
            currentAgent: 'POS_VENDA'
          }
        });

        // Adicionar tags
        const tagCliente = await prisma.tag.findFirst({ where: { name: 'cliente' } });
        if (tagCliente) {
          await prisma.leadTag.upsert({
            where: {
              leadId_tagId: {
                leadId: lead.id,
                tagId: tagCliente.id
              }
            },
            create: {
              leadId: lead.id,
              tagId: tagCliente.id
            },
            update: {}
          });
        }
      }

      // Buscar ou criar produto
      let productRecord = await prisma.product.findFirst({ where: { name: Product.product_name } });
      if (!productRecord) {
        productRecord = await prisma.product.create({
          data: {
            name: Product.product_name,
            price: Sale.sale_amount,
            kiwifyId: Product.product_id || Product.product_name
          }
        });
      }

      await prisma.sale.create({
        data: {
          leadId: lead.id,
          productId: productRecord.id,
          grossValue: Sale.sale_amount,
          fees: Sale.sale_amount * 0.06,
          netValue: Sale.sale_amount * 0.94,
          platform: 'Kiwify',
          platformSaleId: Sale.sale_id,
          installments: 1,
          status: 'APPROVED',
          purchaseDate: new Date(Sale.created_at),
          metadata: req.body
        }
      });

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          currentQueue: 'POS_VENDA',
          currentAgent: 'POS_VENDA'
        }
      });

      const response = await POS_VENDA_AGENT.processMessage(
        lead.id,
        'Compra realizada com sucesso',
        []
      );

      res.json({ success: true, message: 'Venda processada', response: response.response });
    } else {
      res.json({ success: true, message: 'Evento ignorado' });
    }

  } catch (error) {
    logger.error('Erro webhook Kiwify:', error);
    res.status(500).json({ success: false, error: 'Erro ao processar venda' });
  }
});

// Função auxiliar para determinar agente
async function getAgentForLead(lead: any) {
  const status = lead.status;

  if (status === 'aluno_ativo' || status === 'cliente' || status === 'pos_venda') {
    return POS_VENDA_AGENT;
  } else if (status === 'suporte') {
    return SUPORTE_AGENT;
  } else {
    return PRE_VENDA_AGENT;
  }
}

export default router;
