import fs from 'fs';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { AgentType } from '@prisma/client';

const pdfParse = require('pdf-parse');

export class AgentTrainingService {
  
  async processUploadedFile(
    filePath: string,
    filename: string,
    originalName: string,
    agentType: AgentType,
    uploadedBy: string
  ): Promise<any> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const content = pdfData.text;

      const fileStats = fs.statSync(filePath);

      const trainingFile = await prisma.trainingFile.create({
        data: {
          agentType,
          filename,
          originalName,
          fileType: 'pdf',
          fileSize: fileStats.size,
          content,
          isProcessed: true,
          processedAt: new Date(),
          uploadedBy
        }
      });

      logger.info(`Arquivo PDF processado: ${originalName} (${content.length} caracteres)`);

      return trainingFile;
    } catch (error) {
      logger.error('Erro ao processar PDF:', error);
      throw error;
    }
  }

  async createOrUpdateAgentConfig(data: {
    agentType: AgentType;
    name: string;
    systemPrompt: string;
    personality?: string;
    tone?: string;
    language?: string;
    temperature?: number;
    maxTokens?: number;
    dosList?: string[];
    dontsList?: string[];
    exampleConversations?: any;
    knowledgeBase?: string;
    pdfFiles?: any;
    createdBy?: string;
  }): Promise<any> {
    try {
      const existing = await prisma.agentConfig.findFirst({
        where: { agentType: data.agentType, isActive: true }
      });

      if (existing) {
        const updated = await prisma.agentConfig.update({
          where: { id: existing.id },
          data: {
            ...data,
            version: existing.version + 1,
            updatedAt: new Date()
          }
        });
        return updated;
      } else {
        const created = await prisma.agentConfig.create({
          data: {
            ...data,
            version: 1,
            userId: 'system'  // Configuração padrão do sistema
          }
        });
        return created;
      }
    } catch (error) {
      logger.error('Erro ao salvar configuração do agente:', error);
      throw error;
    }
  }

  async getAgentConfig(agentType: AgentType): Promise<any> {
    try {
      const config = await prisma.agentConfig.findFirst({
        where: { agentType, isActive: true },
        orderBy: { version: 'desc' }
      });

      if (!config) {
        return this.getDefaultConfig(agentType);
      }

      const trainingFiles = await prisma.trainingFile.findMany({
        where: { agentType, isProcessed: true },
        select: {
          id: true,
          originalName: true,
          content: true,
          createdAt: true
        }
      });

      return {
        ...config,
        trainingFiles
      };
    } catch (error) {
      logger.error('Erro ao buscar configuração do agente:', error);
      throw error;
    }
  }

  private getDefaultConfig(agentType: AgentType) {
    const defaults = {
      PRE_VENDA: {
        name: 'Agente de Pré-Venda',
        systemPrompt: 'Você é um vendedor consultivo especializado em conversão de leads.',
        personality: 'Empático, consultivo, focado em entender necessidades',
        tone: 'Profissional e amigável',
        temperature: 0.7,
        maxTokens: 500,
        dosList: [
          'Fazer perguntas para entender a necessidade',
          'Mostrar o valor do produto',
          'Responder objeções com empatia',
          'Conduzir para o fechamento'
        ],
        dontsList: [
          'Ser insistente ou agressivo',
          'Ignorar objeções',
          'Falar mal da concorrência',
          'Dar descontos sem autorização'
        ]
      },
      POS_VENDA: {
        name: 'Agente de Pós-Venda',
        systemPrompt: 'Você é um especialista em sucesso do cliente.',
        personality: 'Proativo, atencioso, focado em retenção',
        tone: 'Caloroso e profissional',
        temperature: 0.7,
        maxTokens: 500,
        dosList: [
          'Fazer onboarding completo',
          'Identificar oportunidades de upsell',
          'Antecipar problemas',
          'Coletar feedback'
        ],
        dontsList: [
          'Deixar o cliente sem resposta',
          'Forçar vendas adicionais',
          'Ignorar insatisfações',
          'Ser superficial'
        ]
      },
      SUPORTE: {
        name: 'Agente de Suporte',
        systemPrompt: 'Você é um suporte técnico especializado.',
        personality: 'Paciente, claro, focado em resolver',
        tone: 'Objetivo e didático',
        temperature: 0.5,
        maxTokens: 600,
        dosList: [
          'Entender o problema completamente',
          'Dar instruções claras passo a passo',
          'Confirmar se resolveu',
          'Documentar soluções'
        ],
        dontsList: [
          'Usar jargão técnico desnecessário',
          'Assumir conhecimento prévio',
          'Culpar o cliente',
          'Deixar dúvidas sem resposta'
        ]
      }
    };

    return defaults[agentType];
  }

  async getTrainingFiles(agentType: AgentType): Promise<any[]> {
    return prisma.trainingFile.findMany({
      where: { agentType, isProcessed: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteTrainingFile(id: string): Promise<void> {
    await prisma.trainingFile.delete({ where: { id } });
  }

  async generateEnhancedPrompt(agentType: AgentType, userMessage: string): Promise<string> {
    try {
      const config = await this.getAgentConfig(agentType);
      const trainingContent = config.trainingFiles
        ?.map((f: any) => f.content)
        .join('\n\n') || '';

      let prompt = config.systemPrompt;

      if (config.personality) {
        prompt += `\n\nPersonalidade: ${config.personality}`;
      }

      if (config.tone) {
        prompt += `\nTom de voz: ${config.tone}`;
      }

      if (config.dosList && config.dosList.length > 0) {
        prompt += `\n\nO que FAZER:\n${config.dosList.map((item: string) => `- ${item}`).join('\n')}`;
      }

      if (config.dontsList && config.dontsList.length > 0) {
        prompt += `\n\nO que NÃO FAZER:\n${config.dontsList.map((item: string) => `- ${item}`).join('\n')}`;
      }

      if (config.knowledgeBase) {
        prompt += `\n\nBase de conhecimento:\n${config.knowledgeBase}`;
      }

      if (trainingContent) {
        prompt += `\n\nMaterial de treinamento:\n${trainingContent.substring(0, 2000)}`;
      }

      return prompt;
    } catch (error) {
      logger.error('Erro ao gerar prompt:', error);
      throw error;
    }
  }
}

export default new AgentTrainingService();
