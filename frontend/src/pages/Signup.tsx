import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signupSchema, type SignupInput } from '../lib/schemas';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import toast  from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const mutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.token);
      // Use setTimeout to ensure state is updated before navigation
      setTimeout(() => {
        navigate('/', { replace: true });
        toast.success('Account created successfully!');
      }, 0);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create account');
    },
  });

  const onSubmit = (data: SignupInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-600 p-3 rounded-full">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/signin" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6 card" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="input-field"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="input-field"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
