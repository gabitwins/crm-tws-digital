import axios from 'axios';
import { logger } from '../utils/logger';

export interface FacebookAdsCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: number;
  lifetime_budget?: number;
}

export interface FacebookAdsInsights {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
}

export class FacebookAdsService {
  private accessToken: string;
  private apiVersion: string = 'v18.0';

  constructor() {
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || '';
  }

  async getCampaigns(adAccountId: string): Promise<FacebookAdsCampaign[]> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/act_${adAccountId}/campaigns`,
        {
          params: {
            access_token: this.accessToken,
            fields: 'id,name,status,objective,daily_budget,lifetime_budget'
          }
        }
      );

      return response.data.data;
    } catch (error: any) {
      logger.error('Facebook Ads API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCampaignInsights(
    campaignId: string,
    datePreset: string = 'last_30d'
  ): Promise<FacebookAdsInsights> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/${campaignId}/insights`,
        {
          params: {
            access_token: this.accessToken,
            date_preset: datePreset,
            fields: 'spend,impressions,clicks,ctr,cpc,cpm'
          }
        }
      );

      const data = response.data.data[0];

      return {
        spend: parseFloat(data.spend || '0'),
        impressions: parseInt(data.impressions || '0'),
        clicks: parseInt(data.clicks || '0'),
        ctr: parseFloat(data.ctr || '0'),
        cpc: parseFloat(data.cpc || '0'),
        cpm: parseFloat(data.cpm || '0')
      };
    } catch (error: any) {
      logger.error('Facebook Ads Insights error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAdSets(campaignId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/${campaignId}/adsets`,
        {
          params: {
            access_token: this.accessToken,
            fields: 'id,name,status,daily_budget,lifetime_budget'
          }
        }
      );

      return response.data.data;
    } catch (error: any) {
      logger.error('Facebook Ads API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAds(adSetId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/${adSetId}/ads`,
        {
          params: {
            access_token: this.accessToken,
            fields: 'id,name,status,creative'
          }
        }
      );

      return response.data.data;
    } catch (error: any) {
      logger.error('Facebook Ads API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async syncCampaigns(adAccountId: string): Promise<void> {
    try {
      const campaigns = await this.getCampaigns(adAccountId);

      for (const campaign of campaigns) {
        const insights = await this.getCampaignInsights(campaign.id);

        logger.info(`Synced campaign: ${campaign.name}`, insights);
      }
    } catch (error) {
      logger.error('Error syncing campaigns:', error);
      throw error;
    }
  }
}

export const facebookAdsService = new FacebookAdsService();
