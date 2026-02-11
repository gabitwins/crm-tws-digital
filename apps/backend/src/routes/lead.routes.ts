import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';

const router = Router();
const leadController = new LeadController();

router.get('/', leadController.getAll.bind(leadController));
router.get('/:id', leadController.getById.bind(leadController));
router.post('/', leadController.create.bind(leadController));
router.put('/:id', leadController.update.bind(leadController));
router.delete('/:id', leadController.delete.bind(leadController));

export default router;
