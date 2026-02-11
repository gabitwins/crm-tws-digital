import { openAIService, AIMessage } from '../services/openai.service';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export interface AgentConfig {
  name: string;
  type: 'pre-venda' | 'pos-venda' | 'suporte';
  systemPrompt: string;
  functions?: any[];
}

export class AIAgent {
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async processMessage(leadId: string, message: string, conversationHistory: AIMessage[]): Promise<{ response: string; actions: any[] }> {
    try {
      // Buscar informações do lead
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
          messages: {
            orderBy: { sentAt: 'desc' },
            take: 10
          },
          tags: {
            include: {
              tag: true
            }
          }
        }
      });

      if (!lead) {
        throw new Error('Lead não encontrado');
      }

      // Construir contexto
      const contextMessage: AIMessage = {
        role: 'system',
        content: this.buildContext(lead)
      };

      // Preparar mensagens para a IA
      const messages: AIMessage[] = [
        { role: 'system', content: this.config.systemPrompt },
        contextMessage,
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      // Chamar OpenAI
      const aiResponse = await openAIService.chat(messages, this.config.functions);

      // Processar ações da IA (transferências de fila, tags, etc)
      const actions = await this.processAIActions(lead, aiResponse);

      // Salvar mensagem no banco
      await prisma.message.create({
        data: {
          leadId,
          content: aiResponse.content,
          direction: 'OUTBOUND',
          status: 'SENT',
          aiGenerated: true,
          agentType: this.config.type === 'pre-venda' ? 'PRE_VENDA' : this.config.type === 'pos-venda' ? 'POS_VENDA' : 'SUPORTE',
          metadata: {
            agent: this.config.name,
            model: 'gpt-4-turbo-preview'
          }
        }
      });

      return {
        response: aiResponse.content,
        actions
      };
    } catch (error) {
      logger.error(`Erro no agente ${this.config.name}:`, error);
      throw error;
    }
  }

  private buildContext(lead: any): string {
    const tagNames = lead.tags?.map((lt: any) => lt.tag.name) || [];
    const status = lead.status;
    const lastMessages = lead.messages?.map((m: any) => `${m.direction === 'INBOUND' ? 'Lead' : 'Você'}: ${m.content}`).join('\n') || '';

    return `
CONTEXTO DO LEAD:
- Nome: ${lead.name || 'Não informado'}
- Status: ${status}
- Tags: ${tagNames.join(', ')}
- Origem: ${tagNames.find((t: string) => t.startsWith('origem-')) || 'Não identificada'}

HISTÓRICO RECENTE:
${lastMessages}

INSTRUÇÕES:
- Seja natural, empático e profissional
- Foque em entender a dor e oferecer valor
- Identifique objeções e trate-as
- Conduza o lead para a próxima etapa do funil
    `.trim();
  }

  private async processAIActions(lead: any, aiResponse: any): Promise<any[]> {
    const actions: any[] = [];

    // Se a IA detectou que o lead está pronto para comprar
    if (aiResponse.content.includes('checkout') || aiResponse.content.includes('comprar')) {
      await this.moveToQueue(lead.id, 'CHECKOUT');
      actions.push({ type: 'queue_change', queue: 'CHECKOUT' });
    }

    // Detectar objeções e adicionar tags
    const objections = ['caro', 'preço', 'dinheiro', 'tempo', 'não consigo'];
    for (const obj of objections) {
      if (aiResponse.content.toLowerCase().includes(obj)) {
        await this.addTag(lead.id, `objecao-${obj}`);
        actions.push({ type: 'tag_added', tag: `objecao-${obj}` });
      }
    }

    return actions;
  }

  private async moveToQueue(leadId: string, queueType: string): Promise<void> {
    await prisma.lead.update({
      where: { id: leadId },
      data: { currentQueue: queueType as any }
    });
  }

  private async addTag(leadId: string, tagName: string): Promise<void> {
    // Buscar ou criar tag
    let tag = await prisma.tag.findFirst({ where: { name: tagName } });
    if (!tag) {
      tag = await prisma.tag.create({
        data: {
          name: tagName,
          category: 'auto',
          color: '#808080'
        }
      });
    }

    // Associar tag ao lead
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
  }
}

// Buscar agente do banco de dados (criado pelo usuario)
export async function getAgentFromDB(agentId: string): Promise<AIAgent | null> {
  try {
    const agentConfig = await prisma.agentConfig.findUnique({
      where: { id: agentId }
    });

    if (!agentConfig || !agentConfig.isActive) return null;

    const typeMap: Record<string, 'pre-venda' | 'pos-venda' | 'suporte'> = {
      'PRE_VENDA': 'pre-venda',
      'POS_VENDA': 'pos-venda',
      'SUPORTE': 'suporte',
      'REMARKETING': 'pre-venda'
    };

    return new AIAgent({
      name: agentConfig.name,
      type: typeMap[agentConfig.agentType] || 'pre-venda',
      systemPrompt: agentConfig.systemPrompt + (agentConfig.personality ? `\n\nPERSONALIDADE: ${agentConfig.personality}` : '') + (agentConfig.tone ? `\nTOM DE VOZ: ${agentConfig.tone}` : '') + (agentConfig.knowledgeBase ? `\n\nBASE DE CONHECIMENTO:\n${agentConfig.knowledgeBase}` : '') + (agentConfig.dosList?.length ? `\n\nO QUE FAZER:\n${agentConfig.dosList.map((d: string) => `- ${d}`).join('\n')}` : '') + (agentConfig.dontsList?.length ? `\n\nO QUE NAO FAZER:\n${agentConfig.dontsList.map((d: string) => `- ${d}`).join('\n')}` : '')
    });
  } catch (error) {
    logger.error('Erro ao buscar agente do banco:', error);
    return null;
  }
}

// Buscar agente ativo por tipo
export async function getActiveAgentByType(userId: string, agentType: string): Promise<AIAgent | null> {
  try {
    const agentConfig = await prisma.agentConfig.findFirst({
      where: { userId, agentType: agentType as any, isActive: true }
    });

    if (!agentConfig) return null;
    return getAgentFromDB(agentConfig.id);
  } catch (error) {
    logger.error('Erro ao buscar agente por tipo:', error);
    return null;
  }
}

// Configurações dos agentes padrão (fallback)
export const PRE_VENDA_AGENT = new AIAgent({
  name: 'Agente Pré-Venda',
  type: 'pre-venda',
  systemPrompt: `
Você é um agente de vendas altamente especializado em conversão de leads.

SEU OBJETIVO:
Converter leads em clientes através de uma abordagem consultiva e empática.

PROCESSO:
1. QUALIFICAÇÃO: Entenda a dor, necessidade e momento do lead
2. APRESENTAÇÃO: Apresente a solução de forma personalizada
3. OBJEÇÕES: Identifique e trate objeções com empatia
4. FECHAMENTO: Conduza para o checkout de forma natural

REGRAS:
- NUNCA seja agressivo ou insistente
- Sempre ofereça valor antes de pedir algo
- Use perguntas abertas para entender o lead
- Seja conciso (máximo 3 parágrafos)
- Use emojis com moderação (1-2 por mensagem)
- Identifique sinais de compra: interesse em preço, forma de pagamento, dúvidas sobre acesso
- Se o lead demonstrar interesse claro, conduza para o checkout

QUANDO TRANSFERIR:
- Lead pergunta sobre preço/pagamento → Continue na pré-venda mas prepare para checkout
- Lead demonstra interesse claro → Envie link de pagamento
- Lead tem dúvida técnica sobre produto → Transferir para Suporte
- Lead já é cliente → Transferir para Pós-Venda
  `.trim()
});

export const POS_VENDA_AGENT = new AIAgent({
  name: 'Agente Pós-Venda',
  type: 'pos-venda',
  systemPrompt: `
Você é um agente de relacionamento e retenção focado em sucesso do cliente.

SEU OBJETIVO:
Garantir satisfação, aumentar engajamento e gerar upsell/renovação.

PROCESSO:
1. ONBOARDING: Dê boas-vindas e explique primeiros passos
2. ACOMPANHAMENTO: Verifique progresso e ofereça ajuda
3. ENGAJAMENTO: Incentive uso contínuo do produto
4. UPSELL: Identifique oportunidades de upgrade/renovação

REGRAS:
- Seja caloroso e celebre conquistas do cliente
- Ofereça conteúdo e dicas de valor
- Identifique frustações e resolva proativamente
- NÃO resolva problemas técnicos (transferir para Suporte)
- Ofereça upgrades no momento certo

QUANDO TRANSFERIR:
- Cliente tem problema técnico → Transferir para Suporte
- Cliente pede reembolso → Escalar para humano
  `.trim()
});

export const SUPORTE_AGENT = new AIAgent({
  name: 'Agente Suporte',
  type: 'suporte',
  systemPrompt: `
Você é um agente de suporte técnico altamente capacitado.

SEU OBJETIVO:
Resolver dúvidas técnicas e operacionais rapidamente.

PROCESSO:
1. IDENTIFICAÇÃO: Entenda o problema específico
2. DIAGNÓSTICO: Faça perguntas diretas para diagnosticar
3. SOLUÇÃO: Forneça solução passo a passo
4. CONFIRMAÇÃO: Valide se o problema foi resolvido

REGRAS:
- Seja objetivo e técnico
- Use listas numeradas para instruções
- Pergunte se funcionou antes de encerrar
- Se não souber, seja honesto e escale para humano
- NÃO faça vendas ou ofertas

BASE DE CONHECIMENTO:
[Aqui você configurará a base de conhecimento do seu produto]

QUANDO TRANSFERIR:
- Problema complexo que você não consegue resolver → Escalar para humano
- Cliente pede reembolso → Escalar para humano
  `.trim()
});
