import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middlewares/auth';
import { logger } from '../utils/logger';

const router = Router();

// Metrics para o dashboard principal (ROI tráfego vs vendas)
router.get('/metrics', authenticate, async (req: Request, res: Response) => {
  try {
    console.log('📊 Carregando metrics para usuário:', req.user?.id);
    
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate as string);
      dateFilter.lte = new Date(endDate as string);
    } else {
      const now = new Date();
      dateFilter.gte = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter.lte = now;
    }

    const vendas = await prisma.sale.findMany({
      where: {
        purchaseDate: dateFilter,
        status: 'APPROVED'
      }
    });

    const faturamento = vendas.reduce((sum, sale) => sum + Number(sale.grossValue || 0), 0);
    const investimento = vendas.reduce((sum, sale) => sum + Number(sale.fees || 0), 0);
    const lucro = faturamento - investimento;
    const totalVendas = vendas.length;
    const ticketMedio = totalVendas > 0 ? faturamento / totalVendas : 0;
    const roi = investimento > 0 ? ((lucro / investimento) * 100) : 0;
    const roas = investimento > 0 ? (faturamento / investimento) : 0;

    res.json({
      investimento,
      faturamento,
      lucro,
      roi: Math.round(roi),
      roas: Number(roas.toFixed(2)),
      vendas: totalVendas,
      ticketMedio: Math.round(ticketMedio)
    });
  } catch (error) {
    logger.error('Erro ao buscar metrics:', error);
    res.json({
      investimento: 0,
      faturamento: 0,
      lucro: 0,
      roi: 0,
      roas: 0,
      vendas: 0,
      ticketMedio: 0
    });
  }
});

// Criativos (placeholder - retorna vazio até ter integração com Ads)
router.get('/creatives', authenticate, async (req: Request, res: Response) => {
  try {
    res.json([]);
  } catch (error) {
    logger.error('Erro ao buscar criativos:', error);
    res.json([]);
  }
});

// Stats gerais
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    // Contar leads ativos (geral)
    const leadsAtivos = await prisma.lead.count({
      where: { 
        isActive: true 
      }
    });

    // Receita do mês atual (geral)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const vendas = await prisma.sale.findMany({
      where: {
        purchaseDate: {
          gte: firstDay
        },
        status: 'APPROVED'
      }
    });

    const receitaMensal = vendas.reduce((sum, sale) => {
      return sum + Number(sale.netValue);
    }, 0);

    // Taxa de conversão (geral)
    const totalLeads = await prisma.lead.count();
    const totalVendas = await prisma.sale.count({
      where: { 
        status: 'APPROVED' 
      }
    });
    const taxaConversao = totalLeads > 0 ? (totalVendas / totalLeads) * 100 : 0;

    // Mensagens hoje (geral)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const mensagensHoje = await prisma.message.count({
      where: {
        sentAt: {
          gte: today
        }
      }
    });

    res.json({
      leadsAtivos,
      receitaMensal,
      taxaConversao,
      mensagensHoje
    });
  } catch (error) {
    logger.error('Erro ao buscar stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Dados de filas
router.get('/queues', authenticate, async (req: Request, res: Response) => {
  try {
    const queues = [
      { type: 'PRE_VENDA', name: 'Pré-Venda', color: 'bg-blue-500' },
      { type: 'CHECKOUT', name: 'Checkout', color: 'bg-yellow-500' },
      { type: 'POS_VENDA', name: 'Pós-Venda', color: 'bg-green-500' },
      { type: 'SUPORTE', name: 'Suporte', color: 'bg-red-500' }
    ];

    const queueData = await Promise.all(
      queues.map(async (queue) => {
        const count = await prisma.lead.count({
          where: { 
            currentQueue: queue.type as any,
            isActive: true
          }
        });
        return { ...queue, count };
      })
    );

    const total = queueData.reduce((sum, q) => sum + q.count, 0);

    const result = queueData.map(queue => ({
      name: queue.name,
      count: queue.count,
      color: queue.color,
      percentage: total > 0 ? (queue.count / total) * 100 : 0
    }));

    res.json(result);
  } catch (error) {
    logger.error('Erro ao buscar filas:', error);
    res.status(500).json({ error: 'Erro ao buscar dados de filas' });
  }
});

// Atividade recente
router.get('/activity', authenticate, async (req: Request, res: Response) => {
  try {
    const activities = await prisma.message.findMany({
      take: 10,
      orderBy: { sentAt: 'desc' },
      include: {
        lead: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    });

    res.json(activities);
  } catch (error) {
    logger.error('Erro ao buscar atividades:', error);
    res.status(500).json({ error: 'Erro ao buscar atividades' });
  }
});

export default router;
