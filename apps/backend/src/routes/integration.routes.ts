import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();

// GET /integrations/status - Status de todas as integrações
router.get('/status', async (req, res) => {
  try {
    const integrations = await prisma.integration.findMany({
      where: {
        userId: (req as any).user.id
      }
    });

    const status = {
      whatsapp: integrations.find(i => i.type === 'whatsapp')?.status || 'disconnected',
      instagram: integrations.find(i => i.type === 'instagram')?.status || 'disconnected',
      hotmart: integrations.find(i => i.type === 'hotmart')?.status || 'disconnected',
      kiwify: integrations.find(i => i.type === 'kiwify')?.status || 'disconnected',
      facebookAds: integrations.find(i => i.type === 'facebook_ads')?.status || 'disconnected'
    };

    res.json(status);
  } catch (error) {
    console.error('Erro ao buscar status das integrações:', error);
    res.status(500).json({ error: 'Erro ao buscar status das integrações' });
  }
});

// Instagram
router.post('/instagram/connect', async (req, res) => {
  try {
    const FB_APP_ID = process.env.FACEBOOK_APP_ID || '';
    const REDIRECT_URI = process.env.APP_URL + '/api/integrations/instagram/callback';
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=instagram_basic,instagram_manage_messages,pages_messaging`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Erro ao gerar URL de autenticação Instagram:', error);
    res.status(500).json({ error: 'Erro ao conectar Instagram' });
  }
});

router.post('/instagram/disconnect', async (req, res) => {
  try {
    await prisma.integration.updateMany({
      where: {
        userId: (req as any).user.id,
        type: 'instagram'
      },
      data: {
        status: 'disconnected',
        config: null
      }
    });

    res.json({ message: 'Instagram desconectado com sucesso' });
  } catch (error) {
    console.error('Erro ao desconectar Instagram:', error);
    res.status(500).json({ error: 'Erro ao desconectar Instagram' });
  }
});

// Hotmart
router.post('/hotmart/connect', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token é obrigatório' });
    }

    // Salvar integração
    await prisma.integration.upsert({
      where: {
        userId_type: {
          userId: (req as any).user.id,
          type: 'hotmart'
        }
      },
      update: {
        status: 'connected',
        config: { token }
      },
      create: {
        userId: (req as any).user.id,
        type: 'hotmart',
        status: 'connected',
        config: { token }
      }
    });

    res.json({ message: 'Hotmart conectada com sucesso' });
  } catch (error) {
    console.error('Erro ao conectar Hotmart:', error);
    res.status(500).json({ error: 'Erro ao conectar Hotmart' });
  }
});

router.post('/hotmart/disconnect', async (req, res) => {
  try {
    await prisma.integration.updateMany({
      where: {
        userId: (req as any).user.id,
        type: 'hotmart'
      },
      data: {
        status: 'disconnected',
        config: null
      }
    });

    res.json({ message: 'Hotmart desconectada com sucesso' });
  } catch (error) {
    console.error('Erro ao desconectar Hotmart:', error);
    res.status(500).json({ error: 'Erro ao desconectar Hotmart' });
  }
});

// Kiwify
router.post('/kiwify/connect', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token é obrigatório' });
    }

    // Salvar integração
    await prisma.integration.upsert({
      where: {
        userId_type: {
          userId: (req as any).user.id,
          type: 'kiwify'
        }
      },
      update: {
        status: 'connected',
        config: { token }
      },
      create: {
        userId: (req as any).user.id,
        type: 'kiwify',
        status: 'connected',
        config: { token }
      }
    });

    res.json({ message: 'Kiwify conectada com sucesso' });
  } catch (error) {
    console.error('Erro ao conectar Kiwify:', error);
    res.status(500).json({ error: 'Erro ao conectar Kiwify' });
  }
});

router.post('/kiwify/disconnect', async (req, res) => {
  try {
    await prisma.integration.updateMany({
      where: {
        userId: (req as any).user.id,
        type: 'kiwify'
      },
      data: {
        status: 'disconnected',
        config: null
      }
    });

    res.json({ message: 'Kiwify desconectada com sucesso' });
  } catch (error) {
    console.error('Erro ao desconectar Kiwify:', error);
    res.status(500).json({ error: 'Erro ao desconectar Kiwify' });
  }
});

// Facebook Ads
router.post('/facebook-ads/connect', async (req, res) => {
  try {
    const FB_APP_ID = process.env.FACEBOOK_APP_ID || '';
    const REDIRECT_URI = process.env.APP_URL + '/api/integrations/facebook-ads/callback';
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=ads_read,ads_management`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Erro ao gerar URL de autenticação Facebook Ads:', error);
    res.status(500).json({ error: 'Erro ao conectar Facebook Ads' });
  }
});

router.post('/facebook-ads/disconnect', async (req, res) => {
  try {
    await prisma.integration.updateMany({
      where: {
        userId: (req as any).user.id,
        type: 'facebook_ads'
      },
      data: {
        status: 'disconnected',
        config: null
      }
    });

    res.json({ message: 'Facebook Ads desconectado com sucesso' });
  } catch (error) {
    console.error('Erro ao desconectar Facebook Ads:', error);
    res.status(500).json({ error: 'Erro ao desconectar Facebook Ads' });
  }
});

// Google Ads
router.post('/google-ads/connect', async (req, res) => {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
    const REDIRECT_URI = process.env.APP_URL + '/api/integrations/google-ads/callback';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${REDIRECT_URI}` +
      `&response_type=code` +
      `&scope=https://www.googleapis.com/auth/adwords` +
      `&access_type=offline`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Erro ao gerar URL de autenticação Google Ads:', error);
    res.status(500).json({ error: 'Erro ao conectar Google Ads' });
  }
});

router.get('/google-ads/callback', async (req, res) => {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).send('Código não recebido');
    }

    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.APP_URL + '/api/integrations/google-ads/callback',
        grant_type: 'authorization_code',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const tokens = response.data;

    // Salvar tokens no banco
    await prisma.integration.upsert({
      where: {
        userId_type: {
          userId: (req as any).user?.id || 'temp-user',
          type: 'google_ads'
        }
      },
      update: {
        status: 'connected',
        config: tokens
      },
      create: {
        userId: (req as any).user?.id || 'temp-user',
        type: 'google_ads',
        status: 'connected',
        config: tokens
      }
    });

    res.send(`
      <html>
        <head><title>Google Ads Conectado</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #4CAF50;">✓ Google Ads conectado com sucesso!</h1>
          <p>Você já pode fechar esta janela e voltar ao CRM.</p>
          <script>
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Erro ao conectar Google Ads:', error.response?.data || error.message);
    res.status(500).send(`
      <html>
        <head><title>Erro</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #f44336;">✗ Erro ao conectar Google Ads</h1>
          <p>Verifique as credenciais no arquivo .env</p>
        </body>
      </html>
    `);
  }
});

router.post('/google-ads/disconnect', async (req, res) => {
  try {
    await prisma.integration.updateMany({
      where: {
        userId: (req as any).user.id,
        type: 'google_ads'
      },
      data: {
        status: 'disconnected',
        config: null
      }
    });

    res.json({ message: 'Google Ads desconectado com sucesso' });
  } catch (error) {
    console.error('Erro ao desconectar Google Ads:', error);
    res.status(500).json({ error: 'Erro ao desconectar Google Ads' });
  }
});

// Google Calendar
router.post('/google-calendar/connect', async (req, res) => {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
    const REDIRECT_URI = process.env.APP_URL + '/api/integrations/google-calendar/callback';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${REDIRECT_URI}` +
      `&response_type=code` +
      `&scope=https://www.googleapis.com/auth/calendar` +
      `&access_type=offline`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Erro ao gerar URL de autenticação Google Calendar:', error);
    res.status(500).json({ error: 'Erro ao conectar Google Calendar' });
  }
});

router.post('/google-calendar/disconnect', async (req, res) => {
  try {
    await prisma.integration.updateMany({
      where: {
        userId: (req as any).user.id,
        type: 'google_calendar'
      },
      data: {
        status: 'disconnected',
        config: null
      }
    });

    res.json({ message: 'Google Calendar desconectado com sucesso' });
  } catch (error) {
    console.error('Erro ao desconectar Google Calendar:', error);
    res.status(500).json({ error: 'Erro ao desconectar Google Calendar' });
  }
});

// Rotas genéricas para outras integrações (Outlook, Stripe, etc.)
router.post('/:integrationId/connect', async (req, res) => {
  try {
    const { integrationId } = req.params;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token é obrigatório' });
    }

    await prisma.integration.upsert({
      where: {
        userId_type: {
          userId: (req as any).user.id,
          type: integrationId
        }
      },
      update: {
        status: 'connected',
        config: { token }
      },
      create: {
        userId: (req as any).user.id,
        type: integrationId,
        status: 'connected',
        config: { token }
      }
    });

    res.json({ message: `${integrationId} conectado com sucesso` });
  } catch (error) {
    console.error(`Erro ao conectar ${req.params.integrationId}:`, error);
    res.status(500).json({ error: `Erro ao conectar ${req.params.integrationId}` });
  }
});

router.post('/:integrationId/disconnect', async (req, res) => {
  try {
    const { integrationId } = req.params;

    await prisma.integration.updateMany({
      where: {
        userId: (req as any).user.id,
        type: integrationId
      },
      data: {
        status: 'disconnected',
        config: null
      }
    });

    res.json({ message: `${integrationId} desconectado com sucesso` });
  } catch (error) {
    console.error(`Erro ao desconectar ${req.params.integrationId}:`, error);
    res.status(500).json({ error: `Erro ao desconectar ${req.params.integrationId}` });
  }
});

export default router;
