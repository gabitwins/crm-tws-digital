import axios from 'axios';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import { OpenAIService } from './openai.service';
import { QueueService } from './queue.service';

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
  webhookVerifyToken: string;
}

interface WhatsAppMessage {
  from: string;
  text: string;
  timestamp: string;
  messageId: string;
}

export class WhatsAppCloudService {
  private config: WhatsAppConfig | null = null;
  private baseUrl = 'https://graph.facebook.com/v21.0';
  private openAIService: OpenAIService;
  private queueService: QueueService;

  constructor() {
    this.openAIService = new OpenAIService();
    this.queueService = new QueueService();
  }

  async configure(config: WhatsAppConfig): Promise<void> {
    try {
      // Validar credenciais fazendo uma chamada de teste
      const response = await axios.get(
        `${this.baseUrl}/${config.phoneNumberId}`,
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`
          }
        }
      );

      if (response.status === 200) {
        this.config = config;
        
        // Salvar configuração no banco de dados
        await prisma.whatsAppConfig.upsert({
          where: { id: 'default' },
          create: {
            id: 'default',
            phoneNumberId: config.phoneNumberId,
            accessToken: config.accessToken,
            businessAccountId: config.businessAccountId,
            webhookVerifyToken: config.webhookVerifyToken,
            isActive: true
          },
          update: {
            phoneNumberId: config.phoneNumberId,
            accessToken: config.accessToken,
            businessAccountId: config.businessAccountId,
            webhookVerifyToken: config.webhookVerifyToken,
            isActive: true
          }
        });

        logger.info('✅ WhatsApp Cloud API configurado com sucesso');
      }
    } catch (error: any) {
      logger.error('❌ Erro ao configurar WhatsApp Cloud API:', error.response?.data || error.message);
      throw new Error('Credenciais inválidas ou erro na API do WhatsApp');
    }
  }

  async loadConfig(): Promise<void> {
    try {
      const savedConfig = await prisma.whatsAppConfig.findUnique({
        where: { id: 'default' }
      });

      if (savedConfig && savedConfig.isActive) {
        this.config = {
          phoneNumberId: savedConfig.phoneNumberId,
          accessToken: savedConfig.accessToken,
          businessAccountId: savedConfig.businessAccountId,
          webhookVerifyToken: savedConfig.webhookVerifyToken
        };
        logger.info('✅ Configuração do WhatsApp Cloud carregada do banco');
      } else {
        logger.warn('⚠️ Nenhuma configuração ativa encontrada');
      }
    } catch (error) {
      logger.error('Erro ao carregar configuração:', error);
    }
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  getConfig(): WhatsAppConfig | null {
    return this.config;
  }

  async sendMessage(to: string, text: string): Promise<void> {
    if (!this.config) {
      throw new Error('WhatsApp Cloud API não configurado. Configure primeiro via /integrations/whatsapp/configure');
    }

    try {
      // Limpar o número: remover +, espaços, traços
      const cleanPhone = to.replace(/[^\d]/g, '');

      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: text }
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`✅ Mensagem enviada para ${cleanPhone}:`, response.data);
    } catch (error: any) {
      logger.error('❌ Erro ao enviar mensagem:', error.response?.data || error.message);
      throw error;
    }
  }

  async handleIncomingMessage(webhookData: any): Promise<void> {
    try {
      const entry = webhookData.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value?.messages || value.messages.length === 0) {
        logger.info('📭 Webhook sem mensagens (status update ou outro evento)');
        return;
      }

      const message = value.messages[0];
      const from = message.from;
      const messageText = message.text?.body || '';
      const messageId = message.id;
      const timestamp = message.timestamp;

      if (!messageText) {
        logger.info('📭 Mensagem sem texto (pode ser mídia ou outro tipo)');
        return;
      }

      logger.info(`📩 Mensagem recebida de ${from}: ${messageText}`);

      // Verificar se o lead já existe
      let lead = await prisma.lead.findFirst({
        where: { phone: `+${from}` }
      });

      // Se não existe, criar novo lead
      if (!lead) {
        const contactName = value.contacts?.[0]?.profile?.name || 'Novo Lead';
        
        lead = await prisma.lead.create({
          data: {
            name: contactName,
            phone: `+${from}`,
            status: 'lead',
            currentQueue: 'PRE_VENDA',
            source: 'whatsapp',
            isActive: true
          }
        });

        logger.info(`✨ Novo lead criado: ${lead.name} (${lead.phone})`);
      }

      // Salvar mensagem recebida no banco
      await prisma.message.create({
        data: {
          leadId: lead.id,
          content: messageText,
          direction: 'INBOUND',
          status: 'DELIVERED',
          sentAt: new Date(parseInt(timestamp) * 1000)
        }
      });

      // Gerar resposta com IA
      const agentType = this.queueService.getAgentTypeByQueue(lead.currentQueue || 'PRE_VENDA');
      const aiResponse = await this.openAIService.generateResponse(
        messageText,
        lead,
        agentType as 'prevenda' | 'posvenda' | 'suporte'
      );

      // Enviar resposta
      await this.sendMessage(from, aiResponse);

      // Salvar resposta no banco
      await prisma.message.create({
        data: {
          leadId: lead.id,
          content: aiResponse,
          direction: 'OUTBOUND',
          status: 'SENT',
          sentAt: new Date(),
          aiGenerated: true,
          agentType: agentType as any
        }
      });

      // Analisar se deve mover de fila
      await this.queueService.analyzeAndMoveQueue(lead, messageText, aiResponse);

      logger.info(`🤖 Resposta enviada para ${from}`);

    } catch (error) {
      logger.error('❌ Erro ao processar mensagem do webhook:', error);
      throw error;
    }
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (!this.config) {
      logger.error('⚠️ Tentativa de verificação de webhook sem configuração');
      return null;
    }

    if (mode === 'subscribe' && token === this.config.webhookVerifyToken) {
      logger.info('✅ Webhook verificado com sucesso');
      return challenge;
    } else {
      logger.error('❌ Token de verificação inválido');
      return null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.config) {
      await prisma.whatsAppConfig.update({
        where: { id: 'default' },
        data: { isActive: false }
      });
      this.config = null;
      logger.info('WhatsApp Cloud API desconectado');
    }
  }
}

export default new WhatsAppCloudService();
