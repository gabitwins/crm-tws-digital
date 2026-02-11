import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  WASocket,
  proto,
  WAMessage,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import { OpenAIService } from './openai.service';
import { QueueService } from './queue.service';
import fs from 'fs/promises';
import path from 'path';

export class BaileysService {
  private sock: WASocket | null = null;
  private qrCode: string | null = null;
  private connected: boolean = false;
  private connecting: boolean = false;
  private authDir: string = 'auth_info_baileys';
  private openAIService: OpenAIService;
  private queueService: QueueService;

  constructor() {
    this.openAIService = new OpenAIService();
    this.queueService = new QueueService();
  }

  async connect(forceReset: boolean = false): Promise<void> {
    try {
      if (this.connecting || this.connected) {
        logger.warn('⚠️ Já está conectado ou conectando. Ignorando nova tentativa.');
        return;
      }
      
      // FORÇA LIMPEZA PARA EVITAR SESSÕES CORROMPIDAS
      if (forceReset) {
        logger.info('🧹 Forçando limpeza de sessão anterior...');
        await this.cleanAuthOnly();
        // Aguardar 2 segundos após limpar para garantir que arquivos foram deletados
        await new Promise(r => setTimeout(r, 2000));
      }
      
      this.connecting = true;
      this.connected = false;
      this.qrCode = null;
      
      // TIMEOUT DE SEGURANÇA: Se após 90s ainda estiver "connecting", resetar
      const safetyTimeout = setTimeout(() => {
        if (this.connecting && !this.connected) {
          logger.error('🚨 TIMEOUT: Conexão travada por 90s. Resetando...');
          this.connecting = false;
          this.sock = null;
          this.qrCode = null;
        }
      }, 90000); // 90 segundos
      const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

      const { version } = await fetchLatestBaileysVersion();
      logger.info(`📦 Baileys version: ${version.join('.')}`);
      
      this.sock = makeWASocket({
        auth: state,
        version,
        browser: ['CRM NEXO', 'Chrome', '10.0.0'],
        markOnlineOnConnect: false,
      });

      // keep-alive to reduce random connection drops
      try {
        this.sock.ws.on('open', () => {
          logger.info('✅ Baileys WS open');
        });
        this.sock.ws.on('close', () => {
          logger.info('⚠️ Baileys WS close');
        });
      } catch {}

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // LOG DETALHADO DO EVENTO
        logger.info('🔄 connection.update:', JSON.stringify({
          connection,
          qr: qr ? 'QR_AVAILABLE' : null,
          error: lastDisconnect?.error ? {
            message: (lastDisconnect.error as any)?.message,
            statusCode: (lastDisconnect.error as Boom)?.output?.statusCode,
            payload: (lastDisconnect.error as Boom)?.output?.payload
          } : null
        }, null, 2));

        if (qr) {
          this.qrCode = qr;
          logger.info('📱 Novo QR Code gerado');
          qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const errorMsg = (lastDisconnect?.error as any)?.message || '';
          
          logger.error('❌ Conexão fechada:', {
            statusCode,
            errorMsg,
            DisconnectReason: DisconnectReason[statusCode as any] || 'UNKNOWN'
          });

          // DETECTA ERRO DE DEVICE LIMIT OU SESSÃO CORROMPIDA
          if (
            statusCode === 428 || // Multidevice mismatch
            statusCode === 515 || // Device limit
            errorMsg.includes('Conflict') ||
            errorMsg.includes('device')
          ) {
            logger.error('🚨 Erro de device/sessão detectado! Limpando e reconectando...');
            await this.cleanAuthOnly();
            this.connecting = false;
            return;
          }

          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          logger.info('❓ Reconectar?', shouldReconnect);

          if (shouldReconnect) {
            this.connecting = false;
            await this.connect();
          } else {
            this.connected = false;
            this.connecting = false;
          }
        } else if (connection === 'open') {
          clearTimeout(safetyTimeout); // Limpar timeout de segurança
          this.connected = true;
          this.connecting = false;
          this.qrCode = null; // Limpar QR após conexão bem-sucedida
          logger.info('✅ WhatsApp conectado com sucesso!');
        } else if (connection === 'connecting') {
          logger.info('🔄 Estabelecendo conexão...');
        }
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
          for (const msg of messages) {
            await this.handleIncomingMessage(msg);
          }
        }
      });

    } catch (error) {
      this.connecting = false;
      this.connected = false;
      this.qrCode = null;
      logger.error('❌ Erro fatal ao conectar WhatsApp:', error);
      throw error;
    }
  }

  async connectAndWaitForQrOrConnected(timeoutMs: number = 60000): Promise<{ status: 'waiting_scan' | 'connected'; qrCode?: string }> {
    await this.connect();

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (this.connected) return { status: 'connected' };
      if (this.qrCode) return { status: 'waiting_scan', qrCode: this.qrCode };
      await new Promise((r) => setTimeout(r, 500));
    }

    throw new Error('Timeout aguardando QR Code');
  }

  private async handleIncomingMessage(message: WAMessage): Promise<void> {
    try {
      if (!message.message || message.key.fromMe) return;

      const from = message.key.remoteJid!;
      const phone = from.replace('@s.whatsapp.net', '');
      const messageText = message.message.conversation || 
                         message.message.extendedTextMessage?.text || '';

      if (!messageText) return;

      logger.info(`📩 Mensagem recebida de ${phone}: ${messageText}`);

      let lead = await prisma.lead.findFirst({
        where: { phone: `+${phone}` }
      });

      if (!lead) {
        const pushName = message.pushName || 'Novo Lead';
        lead = await prisma.lead.create({
          data: {
            name: pushName,
            phone: `+${phone}`,
            status: 'lead',
            currentQueue: 'PRE_VENDA',
            source: 'whatsapp',
            isActive: true
          }
        });

        logger.info(`✨ Novo lead criado: ${lead.name} (${lead.phone})`);
      }

      await prisma.message.create({
        data: {
          leadId: lead.id,
          content: messageText,
          direction: 'INBOUND',
          status: 'DELIVERED',
          sentAt: new Date()
        }
      });

      const agentType = this.queueService.getAgentTypeByQueue(lead.currentQueue || 'PRE_VENDA');
      const aiResponse = await this.openAIService.generateResponse(
        messageText,
        lead,
        agentType as 'prevenda' | 'posvenda' | 'suporte'
      );

      await this.sendMessage(from, aiResponse);

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

      await this.queueService.analyzeAndMoveQueue(lead, messageText, aiResponse);

      logger.info(`🤖 Resposta enviada para ${phone}`);

    } catch (error) {
      logger.error('Erro ao processar mensagem:', error);
    }
  }

  async sendMessage(to: string, text: string): Promise<void> {
    if (!this.sock || !this.connected) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
      await this.sock.sendMessage(jid, { text });
      logger.info(`✅ Mensagem enviada para ${to}`);
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  getQRCode(): string | null {
    return this.qrCode;
  }

  isConnected(): boolean {
    return this.connected;
  }

  isConnecting(): boolean {
    return this.connecting;
  }

  async disconnect(): Promise<void> {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
      this.connected = false;
      logger.info('WhatsApp desconectado');
    }
  }

  async resetAuth(): Promise<void> {
    try {
      await this.disconnect();
    } catch {}

    this.qrCode = null;
    this.connected = false;
    this.connecting = false;

    await this.cleanAuthOnly();
  }

  private async cleanAuthOnly(): Promise<void> {
    try {
      const authPath = path.resolve(process.cwd(), this.authDir);
      await fs.rm(authPath, { recursive: true, force: true });
      logger.info('🧹 auth_info_baileys removido, novo QR sera gerado');
    } catch (error) {
      logger.error('Erro ao limpar auth_info_baileys:', error);
    }
  }
}

export default new BaileysService();
