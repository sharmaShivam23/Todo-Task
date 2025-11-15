import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { resetPasswordSchema, type ResetPasswordInput } from '../lib/schemas';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Key } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
    },
  });

  const mutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.token);
      // Use setTimeout to ensure state is updated before navigation
      setTimeout(() => {
        navigate('/', { replace: true });
        toast.success('Password reset successfully!');
      }, 0);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }
    mutation.mutate({ ...data, token });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="card text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              The password reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password" className="btn-primary inline-block">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-600 p-3 rounded-full">
              <Key className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6 card" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('token')} />
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
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

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Resetting...' : 'Reset Password'}
          </button>

          <div className="text-center">
            <Link
              to="/signin"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
