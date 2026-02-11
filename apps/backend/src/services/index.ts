import whatsAppCloudService from './whatsapp-cloud.service';
import { logger } from '../utils/logger';

export async function initializeServices() {
  try {
    // Carregar configuração do WhatsApp Cloud API (se existir)
    await whatsAppCloudService.loadConfig();
    logger.info('✅ WhatsApp Cloud service initialized');
  } catch (error) {
    logger.error('⚠️ Error loading WhatsApp Cloud config:', error);
  }
  
  return Promise.resolve();
}
