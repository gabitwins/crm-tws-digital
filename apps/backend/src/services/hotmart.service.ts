import axios from 'axios';
import { logger } from '../utils/logger';

export interface HotmartWebhookData {
  event: string;
  data: {
    product: {
      id: number;
      name: string;
    };
    buyer: {
      name: string;
      email: string;
      phone?: string;
    };
    purchase: {
      transaction: string;
      status: string;
      price: {
        value: number;
        currency_value: string;
      };
      commission: {
        value: number;
      };
      approved_date?: number;
      recurrency_number?: number;
    };
  };
}

export class HotmartService {
  private clientId: string;
  private clientSecret: string;
  private basicAuth: string;

  constructor() {
    this.clientId = process.env.HOTMART_CLIENT_ID || '';
    this.clientSecret = process.env.HOTMART_CLIENT_SECRET || '';
    this.basicAuth = process.env.HOTMART_BASIC_AUTH || '';
  }

  async verifyWebhook(signature: string, body: string): Promise<boolean> {
    return true;
  }

  parseWebhook(data: HotmartWebhookData) {
    const { event, data: hookData } = data;

    const eventMap: Record<string, string> = {
      'PURCHASE_COMPLETE': 'APPROVED',
      'PURCHASE_APPROVED': 'APPROVED',
      'PURCHASE_REFUNDED': 'REFUNDED',
      'PURCHASE_CHARGEBACK': 'CHARGEBACK',
      'PURCHASE_CANCELLED': 'CANCELLED'
    };

    const status = eventMap[event] || 'PENDING';

    return {
      platform: 'hotmart',
      platformSaleId: hookData.purchase.transaction,
      productId: hookData.product.id.toString(),
      productName: hookData.product.name,
      buyer: {
        name: hookData.buyer.name,
        email: hookData.buyer.email,
        phone: hookData.buyer.phone
      },
      grossValue: hookData.purchase.price.value,
      commission: hookData.purchase.commission.value,
      netValue: hookData.purchase.price.value - hookData.purchase.commission.value,
      status,
      purchaseDate: new Date(),
      approvalDate: hookData.purchase.approved_date 
        ? new Date(hookData.purchase.approved_date * 1000) 
        : null
    };
  }

  async getSales(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate.getTime().toString());
      if (endDate) params.append('end_date', endDate.getTime().toString());

      const response = await axios.get(
        `https://developers.hotmart.com/payments/api/v1/sales/history`,
        {
          params,
          headers: {
            'Authorization': `Basic ${this.basicAuth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('Hotmart API error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const hotmartService = new HotmartService();
