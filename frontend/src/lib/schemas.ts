import { z } from "zod";

// Signup validation
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .nonempty("Name is required"), // ensure non-empty string
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"), // ensure non-empty string
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .nonempty("Password is required"), // ensure non-empty string
});

// Signin validation
export const signinSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),
  password: z.string().min(1, "Password is required"),
});

// Forgot password
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),
});

// Reset password
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .nonempty("Password is required"),
});

// Todo schema
export const todoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

// Type inference
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type TodoInput = z.infer<typeof todoSchema>;
