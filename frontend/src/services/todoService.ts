import api from '../lib/api';
import { TodoInput } from '../lib/schemas';

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export const todoService = {
  getTodos: async (): Promise<Todo[]> => {
    const response = await api.get('/todos');
    console.log(response);
    
    return response.data.data;
  },

  createTodo: async (data: TodoInput): Promise<Todo> => {
    const response = await api.post('/todos', data);
        console.log(response);
    return response.data.data;
  },

  updateTodo: async (id: string, data: Partial<TodoInput> & { completed?: boolean }): Promise<Todo> => {
    const response = await api.put(`/todos/${id}`, data);
    console.log(response);
    
    return response.data.data;
  },

  deleteTodo: async (id: string): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },

  toggleTodo: async (id: string): Promise<Todo> => {
    const response = await api.patch(`/todos/${id}/toggle`);
    return response.data.data;
  },
};
