import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoService, type Todo } from '../services/todoService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { todoSchema, type TodoInput } from '../lib/schemas';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Check, X, Loader2, CheckSquare } from 'lucide-react';
import { useState } from 'react';

const Home = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ title: string; description?: string }>({
    title: '',
    description: '',
  });

  const { data: todos = [], isLoading, isFetching } = useQuery({
    queryKey: ['todos'],
    queryFn: todoService.getTodos,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });

  const createMutation = useMutation({
    mutationFn: todoService.createTodo,
    onMutate: async (newTodo) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      
      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['todos'], (oldTodos: Todo[] = []) => {
        // Create a temporary todo with optimistic data
        const optimisticTodo: Todo = {
          _id: `temp-${Date.now()}`,
          title: newTodo.title,
          description: newTodo.description,
          completed: false,
          user: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [optimisticTodo, ...oldTodos];
      });
      
      return { previousTodos };
    },
    onSuccess: (newTodo, variables, context) => {
      // Update with real data from server
      queryClient.setQueryData(['todos'], (oldTodos: Todo[] = []) => {
        // Remove temporary todo and add real one
        const filtered = oldTodos.filter(todo => !todo._id.startsWith('temp-'));
        return [newTodo, ...filtered];
      });
      toast.success('Todo created successfully!');
      reset();
    },
    onError: (err, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
      toast.error('Failed to create todo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TodoInput> & { completed?: boolean } }) =>
      todoService.updateTodo(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      
      // Optimistic update
      queryClient.setQueryData(['todos'], (oldTodos: Todo[] = []) =>
        oldTodos.map((todo) => 
          todo._id === id 
            ? { ...todo, ...data, updatedAt: new Date().toISOString() }
            : todo
        )
      );
      
      return { previousTodos };
    },
    onSuccess: (updatedTodo) => {
      // Update with real data from server
      queryClient.setQueryData(['todos'], (oldTodos: Todo[] = []) =>
        oldTodos.map((todo) => (todo._id === updatedTodo._id ? updatedTodo : todo))
      );
      toast.success('Todo updated successfully!');
      setEditingId(null);
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
      toast.error('Failed to update todo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: todoService.deleteTodo,
    onMutate: async (todoId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      // Optimistically update
      queryClient.setQueryData(['todos'], (oldTodos: Todo[] = []) =>
        oldTodos.filter((todo) => todo._id !== todoId)
      );
      return { previousTodos };
    },
    onSuccess: () => {
      toast.success('Todo deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (err, todoId, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
      toast.error('Failed to delete todo');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: todoService.toggleTodo,
    onMutate: async (todoId) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      
      // Optimistic update
      queryClient.setQueryData(['todos'], (oldTodos: Todo[] = []) =>
        oldTodos.map((todo) => 
          todo._id === todoId 
            ? { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() }
            : todo
        )
      );
      
      return { previousTodos };
    },
    onSuccess: (updatedTodo) => {
      // Update with real data from server
      queryClient.setQueryData(['todos'], (oldTodos: Todo[] = []) =>
        oldTodos.map((todo) => (todo._id === updatedTodo._id ? updatedTodo : todo))
      );
    },
    onError: (err, todoId, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
      toast.error('Failed to toggle todo');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoInput>({
    resolver: zodResolver(todoSchema),
  });

  const onSubmit = (data: TodoInput) => {
    createMutation.mutate(data);
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo._id);
    setEditFormData({
      title: todo.title,
      description: todo.description || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({ title: '', description: '' });
  };

  const saveEdit = (id: string) => {
    updateMutation.mutate({
      id,
      data: {
        title: editFormData.title,
        description: editFormData.description,
      },
    });
  };

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      deleteMutation.mutate(id);
    }
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Todos</h1>
          <p className="text-gray-600">
            {totalCount > 0
              ? `You have ${completedCount} of ${totalCount} tasks completed`
              : 'No tasks yet. Create your first todo!'}
          </p>
        </div>

        {/* Create Todo Form */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-primary-600" />
            Add New Todo
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register('title')}
                type="text"
                placeholder="Todo title..."
                className="input-field"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            <div>
              <textarea
                {...register('description')}
                placeholder="Description (optional)..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2 inline" />
                  Add Todo
                </>
              )}
            </button>
          </form>
        </div>

        {/* Todos List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : !isLoading && todos.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-gray-400 mb-4">
              <CheckSquare className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No todos yet</h3>
            <p className="text-gray-600">Create your first todo to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todos.map((todo) => (
              <div
                key={todo._id}
                className={`card transition-all duration-200 ${
                  todo.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
                }`}
              >
                {editingId === todo._id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, title: e.target.value })
                      }
                      className="input-field"
                      placeholder="Todo title..."
                    />
                    <textarea
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, description: e.target.value })
                      }
                      rows={3}
                      className="input-field resize-none"
                      placeholder="Description (optional)..."
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => saveEdit(todo._id)}
                        disabled={updateMutation.isPending || !editFormData.title.trim()}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="h-4 w-4 mr-2 inline" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="btn-secondary"
                      >
                        <X className="h-4 w-4 mr-2 inline" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-4">
                    <button
                      onClick={() => handleToggle(todo._id)}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        todo.completed
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-gray-300 hover:border-primary-500'
                      }`}
                    >
                      {todo.completed && <Check className="h-4 w-4 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg font-medium ${
                          todo.completed
                            ? 'text-gray-500 line-through'
                            : 'text-gray-900'
                        }`}
                      >
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p
                          className={`mt-1 text-sm ${
                            todo.completed ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {todo.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(todo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(todo)}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(todo._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

