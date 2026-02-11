import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Configurar multer para upload de PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'publicities');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF ou DOC são permitidos'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// GET /publicities - Listar todas as publicidades do usuário
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const publicities = await prisma.publicity.findMany({
      where: { userId },
      orderBy: [
        { month: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(publicities);
  } catch (error: any) {
    console.error('Erro ao listar publicidades:', error);
    res.status(500).json({ error: 'Erro ao listar publicidades', details: error.message });
  }
});

// POST /publicities - Criar nova publicidade
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      month,
      name,
      contentType,
      editor,
      negotiationUSD,
      negotiationBRL,
      status,
      priority,
      paymentStatus,
      scriptDeliveryDate,
      videoDeliveryDate,
      publicationDate,
      script,
      observation
    } = req.body;

    // Validação básica
    if (!month || !name) {
      return res.status(400).json({ error: 'Campos obrigatórios: month, name' });
    }

    const publicity = await prisma.publicity.create({
      data: {
        userId,
        month,
        name,
        contentType: contentType || 'video',
        editor: editor || null,
        negotiationUSD: negotiationUSD ? parseFloat(negotiationUSD) : 0,
        negotiationBRL: negotiationBRL ? parseFloat(negotiationBRL) : 0,
        status: status || 'PENDENTE_BRIEF',
        priority: priority || 'MEDIA',
        paymentStatus: paymentStatus || 'DEVIDO',
        scriptDeliveryDate: scriptDeliveryDate ? new Date(scriptDeliveryDate) : null,
        videoDeliveryDate: videoDeliveryDate ? new Date(videoDeliveryDate) : null,
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        script: script || null,
        observation: observation || null
      }
    });

    res.status(201).json(publicity);
  } catch (error: any) {
    console.error('Erro ao criar publicidade:', error);
    res.status(500).json({ error: 'Erro ao criar publicidade', details: error.message });
  }
});

// POST /publicities/:id/upload - Upload de arquivo PDF/Brief
router.post('/:id/upload', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Verificar se a publicidade pertence ao usuário
    const publicity = await prisma.publicity.findFirst({
      where: { id, userId }
    });

    if (!publicity) {
      return res.status(404).json({ error: 'Publicidade não encontrada' });
    }

    // Salvar path do arquivo
    const filePath = `/uploads/publicities/${req.file.filename}`;

    await prisma.publicity.update({
      where: { id },
      data: { pdfFile: filePath }
    });

    res.json({
      message: 'Arquivo enviado com sucesso',
      filePath,
      fileName: req.file.originalname
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload', details: error.message });
  }
});

// PUT /publicities/:id - Atualizar publicidade
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Verificar se a publicidade pertence ao usuário
    const existing = await prisma.publicity.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Publicidade não encontrada' });
    }

    const updateData: any = { ...req.body };
    
    // Converter datas se presentes e não vazias
    if (updateData.scriptDeliveryDate) {
      updateData.scriptDeliveryDate = new Date(updateData.scriptDeliveryDate);
    } else if (updateData.scriptDeliveryDate === "") {
      updateData.scriptDeliveryDate = null;
    }

    if (updateData.videoDeliveryDate) {
      updateData.videoDeliveryDate = new Date(updateData.videoDeliveryDate);
    } else if (updateData.videoDeliveryDate === "") {
      updateData.videoDeliveryDate = null;
    }

    if (updateData.publicationDate) {
      updateData.publicationDate = new Date(updateData.publicationDate);
    } else if (updateData.publicationDate === "") {
      updateData.publicationDate = null;
    }

    // Converter valores numéricos se presentes
    if (updateData.negotiationUSD !== undefined) {
      updateData.negotiationUSD = parseFloat(updateData.negotiationUSD) || 0;
    }
    if (updateData.negotiationBRL !== undefined) {
      updateData.negotiationBRL = parseFloat(updateData.negotiationBRL) || 0;
    }

    // Remover campos que não devem ser atualizados
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;

    const updated = await prisma.publicity.update({
      where: { id },
      data: updateData
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Erro ao atualizar publicidade:', error);
    res.status(500).json({ error: 'Erro ao atualizar publicidade', details: error.message });
  }
});

// DELETE /publicities/:id - Excluir publicidade
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Verificar se a publicidade pertence ao usuário
    const publicity = await prisma.publicity.findFirst({
      where: { id, userId }
    });

    if (!publicity) {
      return res.status(404).json({ error: 'Publicidade não encontrada' });
    }

    // Se houver arquivo, deletá-lo
    if (publicity.pdfFile) {
      try {
        const filePath = path.join(process.cwd(), publicity.pdfFile);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn('Erro ao deletar arquivo:', err);
      }
    }

    await prisma.publicity.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao excluir publicidade:', error);
    res.status(500).json({ error: 'Erro ao excluir publicidade', details: error.message });
  }
});

// GET /publicities/:id - Buscar publicidade específica
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const publicity = await prisma.publicity.findFirst({
      where: { id, userId }
    });

    if (!publicity) {
      return res.status(404).json({ error: 'Publicidade não encontrada' });
    }

    res.json(publicity);
  } catch (error: any) {
    console.error('Erro ao buscar publicidade:', error);
    res.status(500).json({ error: 'Erro ao buscar publicidade', details: error.message });
  }
});

export default router;
