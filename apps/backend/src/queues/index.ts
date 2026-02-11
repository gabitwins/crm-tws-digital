import Bull from 'bull';
import Redis from 'redis';
import { logger } from '../utils/logger';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
};

export const messageQueue = new Bull('messages', {
  redis: redisConfig
});

export const aiProcessingQueue = new Bull('ai-processing', {
  redis: redisConfig
});

export const webhookQueue = new Bull('webhooks', {
  redis: redisConfig
});

export const notificationQueue = new Bull('notifications', {
  redis: redisConfig
});

export async function initializeQueues() {
  try {
    const queues = [
      messageQueue,
      aiProcessingQueue,
      webhookQueue,
      notificationQueue
    ];

    for (const queue of queues) {
      await queue.isReady();
      logger.info(`Queue ${queue.name} initialized`);
    }

    setupQueueProcessors();
  } catch (error) {
    logger.error('Failed to initialize queues:', error);
    throw error;
  }
}

function setupQueueProcessors() {
  messageQueue.process(async (job) => {
    logger.info(`Processing message job: ${job.id}`);
    return job.data;
  });

  aiProcessingQueue.process(async (job) => {
    logger.info(`Processing AI job: ${job.id}`);
    return job.data;
  });

  webhookQueue.process(async (job) => {
    logger.info(`Processing webhook job: ${job.id}`);
    return job.data;
  });

  notificationQueue.process(async (job) => {
    logger.info(`Processing notification job: ${job.id}`);
    return job.data;
  });
}
