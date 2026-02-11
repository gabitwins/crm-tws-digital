import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface KiwifyWebhookData {
  event_type: string;
  order: {
    order_id: string;
    product_id: string;
    product_name: string;
    customer: {
      full_name: string;
      email: string;
      mobile?: string;
    };
    amount: number;
    fees: number;
    net_amount: number;
    status: string;
    created_at: string;
    approved_at?: string;
    installments?: number;
  };
}

export class KiwifyService {
  private apiKey: string;
  private webhookSecret: string;

  constructor() {
    this.apiKey = process.env.KIWIFY_API_KEY || '';
    this.webhookSecret = process.env.KIWIFY_WEBHOOK_SECRET || '';
  }

  verifyWebhookSignature(signature: string, body: string): boolean {
    const hash = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(body)
      .digest('hex');

    return hash === signature;
  }

  parseWebhook(data: KiwifyWebhookData) {
    const eventMap: Record<string, string> = {
      'order.paid': 'APPROVED',
      'order.refunded': 'REFUNDED',
      'order.chargeback': 'CHARGEBACK',
      'order.canceled': 'CANCELLED'
    };

    const status = eventMap[data.event_type] || 'PENDING';

    return {
      platform: 'kiwify',
      platformSaleId: data.order.order_id,
      productId: data.order.product_id,
      productName: data.order.product_name,
      buyer: {
        name: data.order.customer.full_name,
        email: data.order.customer.email,
        phone: data.order.customer.mobile
      },
      grossValue: data.order.amount / 100,
      fees: data.order.fees / 100,
      netValue: data.order.net_amount / 100,
      installments: data.order.installments || 1,
      status,
      purchaseDate: new Date(data.order.created_at),
      approvalDate: data.order.approved_at ? new Date(data.order.approved_at) : null
    };
  }

  async getOrder(orderId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.kiwify.com.br/v1/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('Kiwify API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getSales(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();

      const response = await axios.get(
        'https://api.kiwify.com.br/v1/orders',
        {
          params,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('Kiwify API error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const kiwifyService = new KiwifyService();
