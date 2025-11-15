import { Response } from 'express';
import Todo from '../models/Todo';
import { AuthRequest } from '../middleware/auth';
import { logError } from '../utils/errorLogger';

// =======================
// GET ALL TODOS
// =======================
export const getTodos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const todos = await Todo.find({ user: req.user!.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: todos,
    });
  } catch (error) {
    await logError(error as Error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch todos',
    });
  }
};

// =======================
// CREATE TODO
// =======================
export const createTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'Title is required',
      });
      return;
    }

    const todo = await Todo.create({
      title,
      description: description || '',
      user: req.user!.id,
      completed: false,
    });

    res.status(201).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    await logError(error as Error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to create todo',
    });
  }
};

// =======================
// UPDATE TODO
// =======================
export const updateTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates: any = {};

    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.completed !== undefined) updates.completed = req.body.completed;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        error: 'No valid fields to update',
      });
      return;
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: id, user: req.user!.id },
      updates,
      { new: true }
    );

    if (!todo) {
      res.status(404).json({
        success: false,
        error: 'Todo not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    await logError(error as Error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to update todo',
    });
  }
};

// =======================
// DELETE TODO
// =======================
export const deleteTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOneAndDelete({ _id: id, user: req.user!.id });

    if (!todo) {
      res.status(404).json({
        success: false,
        error: 'Todo not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
    });
  } catch (error) {
    await logError(error as Error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to delete todo',
    });
  }
};

// =======================
// TOGGLE TODO (OPTIONAL)
// Not needed if frontend uses updateTodo()
// =======================
export const toggleTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({ _id: id, user: req.user!.id });

    if (!todo) {
      res.status(404).json({
        success: false,
        error: 'Todo not found',
      });
      return;
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    await logError(error as Error, req);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle todo',
    });
  }
};
