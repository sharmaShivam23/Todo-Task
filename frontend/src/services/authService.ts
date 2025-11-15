import api from '../lib/api';
import { SignupInput, SigninInput, ForgotPasswordInput, ResetPasswordInput } from '../lib/schemas';

export const authService = {
  signup: async (data: SignupInput) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  signin: async (data: SigninInput) => {
    const response = await api.post('/auth/signin', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordInput) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordInput) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
};

