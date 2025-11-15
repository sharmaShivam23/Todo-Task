import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { todoService, Todo } from '../services/todoService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { todoSchema, TodoInput } from '../lib/schemas';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoInput>({
    resolver: zodResolver(todoSchema),
  });

  // 📌 LOAD TODOS
  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: todoService.getTodos,
  });

  // 📌 CREATE TODO
  const createMutation = useMutation({
    mutationFn: (data: TodoInput) => todoService.createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      reset();
      setShowForm(false);
      toast.success('Todo created!');
    },
  });

  // 📌 UPDATE TODO
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TodoInput> }) =>
      todoService.updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      reset();
      setEditingTodo(null);
      setShowForm(false);
      toast.success('Todo updated!');
    },
  });

  // 📌 DELETE TODO
  const deleteMutation = useMutation({
    mutationFn: (id: string) => todoService.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo deleted!');
    },
  });

  // 📌 TOGGLE COMPLETE
  const toggleCompleteMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      todoService.updateTodo(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  // 📌 FORM SUBMIT
  const onSubmit = (data: TodoInput) => {
    if (editingTodo) {
      updateMutation.mutate({ id: editingTodo._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // 📌 EDIT TODO
  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    reset({
      title: todo.title,
      description: todo.description || '',
    });
    setShowForm(true);
  };

  // 📌 CANCEL FORM
  const handleCancel = () => {
    reset();
    setEditingTodo(null);
    setShowForm(false);
  };

  // 📌 LOGOUT
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/signin');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">My Todos</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  if (showForm) {
                    handleCancel();
                  } else {
                    reset();
                    setEditingTodo(null);
                  }
                  setShowForm(!showForm);
                }}
              >
                {showForm ? 'Cancel' : '+ New Todo'}
              </Button>

              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Todo Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingTodo ? 'Edit Todo' : 'Create New Todo'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Title"
                type="text"
                placeholder="Enter todo title"
                {...register('title')}
                error={errors.title?.message}
              />

              <Textarea
                label="Description"
                placeholder="Enter todo description (optional)"
                rows={4}
                {...register('description')}
                error={errors.description?.message}
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingTodo ? 'Update Todo' : 'Create Todo'}
                </Button>

                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Todos List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Todos ({todos.length})
          </h2>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading todos...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No todos yet. Create your first todo!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todos.map((todo) => (
                <div
                  key={todo._id}
                  className={`border rounded-lg p-4 transition-all ${
                    todo.completed
                      ? 'bg-gray-50 border-gray-200 opacity-75'
                      : 'bg-white border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={(e) =>
                        toggleCompleteMutation.mutate({
                          id: todo._id,
                          completed: e.target.checked,
                        })
                      }
                      className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />

                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold mb-1 ${
                          todo.completed
                            ? 'line-through text-gray-500'
                            : 'text-gray-800'
                        }`}
                      >
                        {todo.title}
                      </h3>

                      {todo.description && (
                        <p
                          className={`text-sm mb-2 ${
                            todo.completed ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {todo.description}
                        </p>
                      )}

                      <p className="text-xs text-gray-400">
                        {new Date(todo.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(todo)}
                        className="text-sm px-3 py-1"
                      >
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this todo?')) {
                            deleteMutation.mutate(todo._id);
                          }
                        }}
                        isLoading={deleteMutation.isPending}
                        className="text-sm px-3 py-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
