import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { uploadMiddleware } from '../middlewares/upload';
import agentTrainingService from '../services/agent-training.service';
import { AgentType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { getAgentFromDB } from '../services/ai-agent.service';
import { openAIService } from '../services/openai.service';

const router = Router();
const prisma = new PrismaClient();

// ========================================
// CRUD COMPLETO DE AGENTES
// ========================================

// GET /training/agents - Listar todos os agentes do usuário
router.get('/agents', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const agents = await prisma.agentConfig.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(agents);
  } catch (error: any) {
    console.error('Erro ao listar agentes:', error);
    res.status(500).json({ error: 'Erro ao listar agentes' });
  }
});

// POST /training/agents - Criar novo agente
router.post('/agents', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const {
      agentType,
      name,
      systemPrompt,
      personality,
      tone,
      language,
      temperature,
      maxTokens,
      dosList,
      dontsList,
      exampleConversations,
      knowledgeBase,
      pdfFiles,
      isActive
    } = req.body;

    // Validação básica
    if (!name || !agentType || !systemPrompt) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: name, agentType, systemPrompt' 
      });
    }

    const agent = await prisma.agentConfig.create({
      data: {
        userId,
        agentType,
        name,
        systemPrompt,
        personality: personality || null,
        tone: tone || 'professional',
        language: language || 'pt-BR',
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 500,
        dosList: dosList || [],
        dontsList: dontsList || [],
        exampleConversations: exampleConversations || null,
        knowledgeBase: knowledgeBase || null,
        pdfFiles: pdfFiles || null,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.json(agent);
  } catch (error: any) {
    console.error('Erro ao criar agente:', error);
    res.status(500).json({ error: 'Erro ao criar agente: ' + error.message });
  }
});

// GET /training/agents/:id - Buscar agente específico
router.get('/agents/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const agent = await prisma.agentConfig.findFirst({
      where: { id, userId }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }

    res.json(agent);
  } catch (error: any) {
    console.error('Erro ao buscar agente:', error);
    res.status(500).json({ error: 'Erro ao buscar agente' });
  }
});

// PUT /training/agents/:id - Atualizar agente
router.put('/agents/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const updateData = req.body;

    // Verificar se o agente pertence ao usuário
    const existingAgent = await prisma.agentConfig.findFirst({
      where: { id, userId }
    });

    if (!existingAgent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }

    const agent = await prisma.agentConfig.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    res.json(agent);
  } catch (error: any) {
    console.error('Erro ao atualizar agente:', error);
    res.status(500).json({ error: 'Erro ao atualizar agente: ' + error.message });
  }
});

// PATCH /training/agents/:id/toggle - Ativar/Desativar agente
router.patch('/agents/:id/toggle', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const existingAgent = await prisma.agentConfig.findFirst({
      where: { id, userId }
    });

    if (!existingAgent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }

    const agent = await prisma.agentConfig.update({
      where: { id },
      data: {
        isActive: !existingAgent.isActive,
        updatedAt: new Date()
      }
    });

    res.json(agent);
  } catch (error: any) {
    console.error('Erro ao ativar/desativar agente:', error);
    res.status(500).json({ error: 'Erro ao ativar/desativar agente' });
  }
});

// DELETE /training/agents/:id - Excluir agente
router.delete('/agents/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const existingAgent = await prisma.agentConfig.findFirst({
      where: { id, userId }
    });

    if (!existingAgent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }

    await prisma.agentConfig.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao excluir agente:', error);
    res.status(500).json({ error: 'Erro ao excluir agente' });
  }
});

// ========================================
// ROTAS ANTIGAS (COMPATIBILIDADE)
// ========================================

router.get('/agents/config/:agentType', authenticate, async (req, res) => {
  try {
    const { agentType } = req.params;
    const config = await agentTrainingService.getAgentConfig(agentType as AgentType);
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/agents/config', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const config = await agentTrainingService.createOrUpdateAgentConfig({
      ...req.body,
      createdBy: userId
    });
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  '/agents/upload/:agentType',
  authenticate,
  uploadMiddleware.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const { agentType } = req.params;
      const userId = (req as any).user.id;

      const result = await agentTrainingService.processUploadedFile(
        req.file.path,
        req.file.filename,
        req.file.originalname,
        agentType as AgentType,
        userId
      );

      res.json({
        success: true,
        file: result
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get('/agents/files/:agentType', authenticate, async (req, res) => {
  try {
    const { agentType } = req.params;
    const files = await agentTrainingService.getTrainingFiles(agentType as AgentType);
    res.json(files);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/agents/files/:fileId', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;
    await agentTrainingService.deleteTrainingFile(fileId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// CHAT COM AGENTE IA (TESTE E PRODUÇÃO)
// ========================================

// POST /training/agents/:id/chat - Enviar mensagem para agente IA
router.post('/agents/:id/chat', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem obrigatória' });
    }

    const agentConfig = await prisma.agentConfig.findFirst({
      where: { id, userId }
    });

    if (!agentConfig) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }

    if (!agentConfig.isActive) {
      return res.status(400).json({ error: 'Agente está desativado' });
    }

    const systemPrompt = agentConfig.systemPrompt
      + (agentConfig.personality ? `\n\nPERSONALIDADE: ${agentConfig.personality}` : '')
      + (agentConfig.tone ? `\nTOM DE VOZ: ${agentConfig.tone}` : '')
      + (agentConfig.knowledgeBase ? `\n\nBASE DE CONHECIMENTO:\n${agentConfig.knowledgeBase}` : '')
      + (agentConfig.dosList?.length ? `\n\nO QUE FAZER:\n${agentConfig.dosList.map((d: string) => `- ${d}`).join('\n')}` : '')
      + (agentConfig.dontsList?.length ? `\n\nO QUE NAO FAZER:\n${agentConfig.dontsList.map((d: string) => `- ${d}`).join('\n')}` : '');

    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      { role: 'system', content: systemPrompt }
    ];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    messages.push({ role: 'user', content: message });

    const response = await openAIService.chat(messages);

    res.json({
      agentName: agentConfig.name,
      message: response.content,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Erro no chat com agente:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem: ' + error.message });
  }
});

export default router;
