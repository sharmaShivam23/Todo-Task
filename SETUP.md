# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier) or local MongoDB
- Gmail account for password reset emails

## Step 1: Backend Setup

```bash
cd todo-app/backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

**Get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Use that password in `EMAIL_PASS`

Start backend:
```bash
npm run dev
```

## Step 2: Frontend Setup

```bash
cd todo-app/frontend
npm install
```

Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

## Step 3: Test the Application

1. Open http://localhost:3000
2. Sign up for a new account
3. Create some todos
4. Test forgot password flow:
   - Click "Forgot Password" on sign-in page
   - Enter your email
   - Check your email for reset link
   - Click the link and reset password

## Troubleshooting

### MongoDB Connection Error
- Verify your MongoDB URI is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure the database name is correct

### Email Not Sending
- Verify Gmail App Password is correct
- Check if 2-Step Verification is enabled
- Try using a different email service

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that backend is running on port 5000

### Authentication Issues
- Clear browser localStorage
- Check that JWT_SECRET is set
- Verify token is being sent in Authorization header

