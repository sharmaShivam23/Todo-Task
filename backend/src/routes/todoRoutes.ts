import express from 'express';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
} from '../controllers/todoController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);
router.patch('/:id/toggle', toggleTodo);

export default router;
