import { Router, Request, Response } from 'express';

const router = Router();

// Health check endpoint para Render
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CRM Backend'
  });
});

export default router;
