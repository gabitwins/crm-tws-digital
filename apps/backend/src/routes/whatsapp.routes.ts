import { Router } from 'express';
import baileysService from '../services/baileys.service';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/connect', authenticate, async (req, res) => {
  try {
    // SEMPRE FORÇA RESET PARA EVITAR SESSÕES CORROMPIDAS
    const forceReset = req.body.forceReset !== false; // default true
    
    await baileysService.connect(forceReset);
    return res.json({
      status: 'starting',
      message: forceReset ? 'Limpando sessão anterior e iniciando nova conexão...' : 'Iniciando conexao com WhatsApp...'
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao conectar WhatsApp' });
  }
});

router.get('/status', authenticate, async (req, res) => {
  try {
    const connected = baileysService.isConnected();
    const qrCode = baileysService.getQRCode();
    const connecting = baileysService.isConnecting();
    const lastDisconnect = baileysService.getLastDisconnect();

    res.json({
      connected,
      connecting,
      qrCode: connected ? null : qrCode,
      message: connected ? 'Conectado' : 'Desconectado',
      lastDisconnect
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/disconnect', authenticate, async (req, res) => {
  try {
    await baileysService.disconnect();
    res.json({ message: 'WhatsApp desconectado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset', authenticate, async (req, res) => {
  try {
    await baileysService.resetAuth();
    res.json({ message: 'Credenciais do WhatsApp resetadas. Gere um novo QR.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/send', authenticate, async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'to e message são obrigatórios' });
    }

    await baileysService.sendMessage(to, message);
    res.json({ success: true, message: 'Mensagem enviada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
