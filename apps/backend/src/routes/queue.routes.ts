import { Router, Request, Response } from 'express';
import { QueueService } from '../services/queue.service';
import { authenticate } from '../middlewares/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const queueService = new QueueService();
const prisma = new PrismaClient();

// GET /queues - Retorna todas as filas com agentes ativos e leads em tempo real
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Buscar agentes ativos do usuário
    const activeAgents = await prisma.agentConfig.findMany({
      where: {
        userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        agentType: true
      }
    });

    if (activeAgents.length === 0) {
      return res.json([]);
    }

    // Mapear tipo de agente para fila
    const agentTypeToQueue: Record<string, string> = {
      'PREVENDA': 'PRE_VENDA',
      'PREVENTA': 'PRE_VENDA',
      'VENDAS': 'CHECKOUT',
      'POSVENDA': 'POS_VENDA',
      'SUPORTE': 'SUPORTE',
      'RETENCAO': 'RETENCAO',
    };

    const queueColors: Record<string, string> = {
      'PRE_VENDA': 'blue',
      'CHECKOUT': 'yellow',
      'POS_VENDA': 'green',
      'SUPORTE': 'red',
      'RETENCAO': 'purple',
      'HUMANA': 'gray'
    };

    const queueDescriptions: Record<string, string> = {
      'PRE_VENDA': 'Leads novos e prospecção inicial',
      'CHECKOUT': 'Leads prontos para fechar negócio',
      'POS_VENDA': 'Clientes ativos e pós-compra',
      'SUPORTE': 'Atendimento técnico e dúvidas',
      'RETENCAO': 'Retenção de clientes inativos',
      'HUMANA': 'Transferido para atendimento humano'
    };

    // Criar objeto com filas baseadas nos agentes
    const queuesMap: Record<string, any> = {};

    for (const agent of activeAgents) {
      const queueType = agentTypeToQueue[agent.agentType] || agent.agentType;
      
      if (!queuesMap[queueType]) {
        // Contar leads nessa fila
        const leadsCount = await prisma.lead.count({
          where: {
            currentQueue: queueType as any,
            isActive: true
          }
        });

        // Buscar últimas interações (últimas 10 mensagens)
        const recentMessages = await prisma.message.findMany({
          where: {
            lead: {
              currentQueue: queueType as any,
              isActive: true
            }
          },
          include: {
            lead: {
              select: {
                id: true,
                name: true,
                phone: true,
                currentQueue: true
              }
            }
          },
          orderBy: {
            sentAt: 'desc'
          },
          take: 10
        });

        // Calcular tempo médio de resposta (tempo entre última mensagem INBOUND e última OUTBOUND)
        const avgResponseTimeMs = await calculateAvgResponseTime(queueType);
        const avgWaitTime = formatTime(avgResponseTimeMs);

        // Calcular conversão (leads que viraram vendas nessa fila)
        const totalLeadsInQueue = await prisma.lead.count({
          where: { currentQueue: queueType as any }
        });
        
        const convertedLeads = await prisma.sale.count({
          where: {
            lead: {
              currentQueue: queueType as any
            },
            status: 'approved'
          }
        });

        const conversion = totalLeadsInQueue > 0 
          ? Math.round((convertedLeads / totalLeadsInQueue) * 100) 
          : 0;

        queuesMap[queueType] = {
          id: queueType,
          name: queueType.replace('_', '-'),
          description: queueDescriptions[queueType] || 'Fila operacional',
          leads: leadsCount,
          avgWaitTime,
          conversion,
          agent: agent.name,
          agentId: agent.id,
          status: 'active' as const,
          color: queueColors[queueType] || 'gray',
          recentInteractions: recentMessages.map(msg => ({
            id: msg.id,
            leadName: msg.lead.name,
            leadPhone: msg.lead.phone,
            direction: msg.direction,
            content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
            sentAt: msg.sentAt,
            aiGenerated: msg.aiGenerated
          }))
        };
      }
    }

    // Converter para array
    const queues = Object.values(queuesMap);

    res.json(queues);

  } catch (error: any) {
    console.error('Erro ao buscar filas:', error);
    res.status(500).json({ error: 'Erro ao buscar filas', details: error.message });
  }
});

// Helper: Calcular tempo médio de resposta
async function calculateAvgResponseTime(queueType: string): Promise<number> {
  try {
    const leads = await prisma.lead.findMany({
      where: {
        currentQueue: queueType as any,
        isActive: true
      },
      select: { id: true }
    });

    if (leads.length === 0) return 0;

    let totalResponseTime = 0;
    let count = 0;

    for (const lead of leads) {
      const lastInbound = await prisma.message.findFirst({
        where: { leadId: lead.id, direction: 'INBOUND' },
        orderBy: { sentAt: 'desc' }
      });

      const lastOutbound = await prisma.message.findFirst({
        where: { 
          leadId: lead.id, 
          direction: 'OUTBOUND',
          sentAt: lastInbound ? { gte: lastInbound.sentAt } : undefined
        },
        orderBy: { sentAt: 'asc' }
      });

      if (lastInbound && lastOutbound) {
        const diff = lastOutbound.sentAt.getTime() - lastInbound.sentAt.getTime();
        totalResponseTime += diff;
        count++;
      }
    }

    return count > 0 ? totalResponseTime / count : 0;
  } catch (error) {
    return 0;
  }
}

// Helper: Formatar tempo em ms para string legível
function formatTime(ms: number): string {
  if (ms === 0) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// PATCH /queues/:queueId/status - Ativar/pausar fila
router.patch('/:queueId/status', authenticate, async (req: Request, res: Response) => {
  try {
    const { queueId } = req.params;
    const { status } = req.body;

    if (!['active', 'paused'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    // Aqui você pode implementar lógica para pausar processamento de uma fila específica
    // Por enquanto, apenas retorna sucesso
    res.json({ success: true, queueId, status });

  } catch (error: any) {
    console.error('Erro ao atualizar status da fila:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// GET /queues/stats - Estatísticas antigas (compatibilidade)
router.get('/stats', authenticate, async (req, res) => {
  const stats = await queueService.getAllQueuesStats();
  res.json({ stats });
});

// POST /queues/:queueId/leads/:leadId/move - Mover lead manualmente para outra fila
router.post('/:queueId/leads/:leadId/move', authenticate, async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const { toQueue } = req.body;

    if (!toQueue) {
      return res.status(400).json({ error: 'toQueue obrigatório' });
    }

    await queueService.manualMoveQueue(leadId, toQueue, 'manual');

    res.json({ success: true, message: `Lead movido para ${toQueue}` });

  } catch (error: any) {
    console.error('Erro ao mover lead:', error);
    res.status(500).json({ error: 'Erro ao mover lead', details: error.message });
  }
});

export default router;
