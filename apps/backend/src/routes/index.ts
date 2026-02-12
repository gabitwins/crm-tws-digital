import { Express, Router } from 'express';
import { authenticate } from '../middlewares/auth';
import authRoutes from './auth.routes';
import leadRoutes from './lead.routes';
import messageRoutes from './message.routes';
import webhookRoutes from './webhook.routes';
import saleRoutes from './sale.routes';
import ticketRoutes from './ticket.routes';
import dashboardRoutes from './dashboard.routes';
import campaignRoutes from './campaign.routes';
import publicityRoutes from './publicity.routes';
import queueRoutes from './queue.routes';
import whatsappRoutes from './whatsapp.routes';
import whatsappCloudRoutes from './whatsapp-cloud.routes';
import agentRoutes from './agent.routes';
import setupAdminRoutes from './setup.routes';
import integrationRoutes from './integration.routes';
import collaboratorRoutes from './collaborator.routes';
import userRoutes from './user.routes';
import chatRoutes from './chat.routes';
import healthRoutes from './health.routes';

export function setupRoutes(app: Express): void {
  const apiRouter = Router();

  apiRouter.use('/health', healthRoutes);
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/webhooks', webhookRoutes);
  apiRouter.use('/setup', setupAdminRoutes);
  
  // WhatsApp webhook público (sem autenticação)
  apiRouter.use('/whatsapp', whatsappCloudRoutes);

  apiRouter.use(authenticate);

  apiRouter.use('/users', userRoutes);
  apiRouter.use('/leads', leadRoutes);
  apiRouter.use('/messages', messageRoutes);
  apiRouter.use('/sales', saleRoutes);
  apiRouter.use('/tickets', ticketRoutes);
  apiRouter.use('/dashboard', dashboardRoutes);
  apiRouter.use('/campaigns', campaignRoutes);
  apiRouter.use('/publicities', publicityRoutes);
  apiRouter.use('/queues', queueRoutes);
  apiRouter.use('/integrations/whatsapp', whatsappRoutes);
  apiRouter.use('/integrations', integrationRoutes);
  apiRouter.use('/training', agentRoutes);
  apiRouter.use('/collaborators', collaboratorRoutes);
  apiRouter.use('/chat', chatRoutes);

  app.use('/api', apiRouter);
}
