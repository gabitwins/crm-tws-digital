import { Router, Request, Response } from 'express';
import whatsAppCloudService from '../services/whatsapp-cloud.service';
import { authenticate } from '../middlewares/auth';
import { logger } from '../utils/logger';

const router = Router();

// POST /whatsapp/configure - Configurar credenciais da Cloud API
router.post('/configure', authenticate, async (req: Request, res: Response) => {
  try {
    const { phoneNumberId, accessToken, businessAccountId, webhookVerifyToken } = req.body;

    if (!phoneNumberId || !accessToken || !businessAccountId || !webhookVerifyToken) {
      return res.status(400).json({
        error: 'Campos obrigatórios: phoneNumberId, accessToken, businessAccountId, webhookVerifyToken'
      });
    }

    await whatsAppCloudService.configure({
      phoneNumberId,
      accessToken,
      businessAccountId,
      webhookVerifyToken
    });

    res.json({
      success: true,
      message: 'WhatsApp Cloud API configurado com sucesso'
    });
  } catch (error: any) {
    logger.error('Erro ao configurar WhatsApp Cloud:', error);
    res.status(500).json({
      error: 'Erro ao configurar WhatsApp Cloud API',
      details: error.message
    });
  }
});

// GET /whatsapp/status - Verificar se está configurado
router.get('/status', authenticate, async (req: Request, res: Response) => {
  try {
    const isConfigured = whatsAppCloudService.isConfigured();
    const config = whatsAppCloudService.getConfig();

    res.json({
      configured: isConfigured,
      config: config ? {
        phoneNumberId: config.phoneNumberId,
        businessAccountId: config.businessAccountId,
        // Não retorna tokens por segurança
      } : null
    });
  } catch (error) {
    logger.error('Erro ao verificar status:', error);
    res.status(500).json({ error: 'Erro ao verificar status' });
  }
});

// POST /whatsapp/disconnect - Desconectar
router.post('/disconnect', authenticate, async (req: Request, res: Response) => {
  try {
    await whatsAppCloudService.disconnect();
    res.json({
      success: true,
      message: 'WhatsApp Cloud API desconectado'
    });
  } catch (error) {
    logger.error('Erro ao desconectar:', error);
    res.status(500).json({ error: 'Erro ao desconectar' });
  }
});

// POST /whatsapp/send - Enviar mensagem (teste)
router.post('/send', authenticate, async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Campos obrigatórios: to, message' });
    }

    await whatsAppCloudService.sendMessage(to, message);

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso'
    });
  } catch (error: any) {
    logger.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      error: 'Erro ao enviar mensagem',
      details: error.message
    });
  }
});

// GET /whatsapp/webhook - Verificação do webhook (Meta)
router.get('/webhook', (req: Request, res: Response) => {
  try {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    logger.info('📞 Verificação de webhook recebida:', { mode, token, challenge });

    const result = whatsAppCloudService.verifyWebhook(mode, token, challenge);

    if (result) {
      res.status(200).send(result);
    } else {
      res.status(403).send('Token de verificação inválido');
    }
  } catch (error) {
    logger.error('Erro na verificação do webhook:', error);
    res.status(500).send('Erro na verificação');
  }
});

// POST /whatsapp/webhook - Receber mensagens (Meta)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    logger.info('📨 Webhook recebido:', JSON.stringify(req.body, null, 2));

    // Responder imediatamente para o Meta (requisito da API)
    res.status(200).send('EVENT_RECEIVED');

    // Processar mensagem de forma assíncrona
    await whatsAppCloudService.handleIncomingMessage(req.body);

  } catch (error) {
    logger.error('❌ Erro ao processar webhook:', error);
    // Mesmo com erro, retornar 200 para o Meta
    res.status(200).send('EVENT_RECEIVED');
  }
});

export default router;
