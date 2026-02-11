import axios from 'axios';
import { logger } from '../utils/logger';

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  text?: {
    body: string;
  };
  image?: {
    link: string;
    caption?: string;
  };
}

export interface IncomingMessage {
  from: string;
  type: string;
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
  };
  timestamp: string;
}

export class WhatsAppService {
  private apiUrl: string;
  private token: string;
  private phoneNumberId: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
    this.token = process.env.WHATSAPP_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  async sendMessage(message: WhatsAppMessage): Promise<any> {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;

      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: message.to,
        type: message.type,
        ...message
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      logger.info(`WhatsApp message sent to ${message.to}`);
      return response.data;
    } catch (error: any) {
      logger.error('WhatsApp send message error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendTextMessage(to: string, text: string): Promise<any> {
    return this.sendMessage({
      to,
      type: 'text',
      text: { body: text }
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;

      await axios.post(url, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      logger.info(`WhatsApp message ${messageId} marked as read`);
    } catch (error: any) {
      logger.error('WhatsApp mark as read error:', error.response?.data || error.message);
    }
  }

  parseIncomingWebhook(body: any): IncomingMessage | null {
    try {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];

      if (!message) return null;

      return {
        from: message.from,
        type: message.type,
        text: message.text,
        image: message.image,
        timestamp: message.timestamp
      };
    } catch (error) {
      logger.error('Error parsing WhatsApp webhook:', error);
      return null;
    }
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      logger.info('WhatsApp webhook verified');
      return challenge;
    }

    logger.warn('WhatsApp webhook verification failed');
    return null;
  }
}

export const whatsappService = new WhatsAppService();
