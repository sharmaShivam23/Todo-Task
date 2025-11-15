import nodemailer from 'nodemailer';

// Check if email credentials are configured
const isEmailConfigured = () => {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

// Create transporter only if credentials are available
const createTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<void> => {
  if (!isEmailConfigured()) {
    console.warn('Email not configured. EMAIL_USER and EMAIL_PASS must be set in .env file');
    console.log('Email would be sent to:', to);
    console.log('Subject:', subject);
    console.log('Reset link:', text);
    throw new Error('Email service is not configured. Please set EMAIL_USER and EMAIL_PASS in your .env file');
  }

  if (!transporter) {
    throw new Error('Email transporter not initialized');
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  await sendEmail(email, 'Password Reset Request', resetUrl, html);
};


