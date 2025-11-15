# Todo List Application

A full-stack Todo List application built with React (TypeScript) and Node.js (TypeScript), featuring user authentication, JWT-based security, and comprehensive todo management.

## Features

### User Management
- **Signup**: Create a new account with name, email, and password
- **Sign In**: Secure authentication with JWT tokens
- **Forgot Password**: Request password reset via email
- **Reset Password**: Reset password using secure token link

### Todo Management
- **Create Todo**: Add new todos with title and optional description
- **List Todos**: View all your todos in a clean, organized interface
- **Update Todo**: Edit todo title and description
- **Delete Todo**: Remove todos with confirmation
- **Toggle Completion**: Mark todos as completed or incomplete

### Security Features
- **Rate Limiting**: Prevents brute force attacks (5 login attempts per 15 minutes)
- **Helmet**: Security headers for XSS, clickjacking, and other attacks
- **MongoDB Sanitization**: Prevents NoSQL injection attacks
- **HTTP Parameter Pollution (HPP)**: Prevents parameter pollution attacks
- **XSS Protection**: Multiple layers of XSS sanitization
- **CORS**: Configured CORS for secure cross-origin requests
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password hashing
- **Error Logging**: All backend errors logged to MongoDB

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for routing
- **Zustand** for global state management
- **React Query** for data fetching and caching
- **React Hook Form** for form handling
- **Zod** for schema validation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend
- **Node.js** with TypeScript
- **Express.js** for REST API
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Nodemailer** for email sending
- **Express Rate Limit** for rate limiting
- **Helmet** for security headers
- **Express Mongo Sanitize** for NoSQL injection protection
- **HPP** for HTTP parameter pollution protection
- **XSS Clean** for XSS protection

## Project Structure

```
todo-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.ts    # Authentication logic
│   │   │   └── todoController.ts   # Todo CRUD operations
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT authentication middleware
│   │   │   ├── errorHandler.ts      # Global error handler
│   │   │   └── security.ts          # Security middleware
│   │   ├── models/
│   │   │   ├── User.ts              # User schema
│   │   │   ├── Todo.ts              # Todo schema
│   │   │   └── ErrorLog.ts          # Error log schema
│   │   ├── routes/
│   │   │   ├── authRoutes.ts        # Auth routes
│   │   │   └── todoRoutes.ts        # Todo routes
│   │   ├── utils/
│   │   │   ├── jwt.ts               # JWT utilities
│   │   │   ├── email.ts             # Email utilities
│   │   │   └── errorLogger.ts       # Error logging
│   │   └── index.ts                 # Express app setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Navigation bar
│   │   │   └── ProtectedRoute.tsx   # Route protection
│   │   ├── lib/
│   │   │   ├── api.ts               # Axios configuration
│   │   │   └── schemas.ts           # Zod schemas
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Todo list page
│   │   │   ├── Signup.tsx           # Signup page
│   │   │   ├── Signin.tsx           # Signin page
│   │   │   ├── ForgotPassword.tsx   # Forgot password page
│   │   │   └── ResetPassword.tsx    # Reset password page
│   │   ├── services/
│   │   │   ├── authService.ts       # Auth API calls
│   │   │   └── todoService.ts       # Todo API calls
│   │   ├── store/
│   │   │   └── authStore.ts         # Zustand auth store
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (free tier works) or local MongoDB
- Email account for password reset (Gmail recommended)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd todo-app/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-app?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Note for Gmail**: You'll need to generate an App Password:
1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password for "Mail"
4. Use that password in `EMAIL_PASS`

4. Run the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd todo-app/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Run the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create a new account
  - Body: `{ name, email, password }`
  - Response: `{ success, data: { user, token } }`

- `POST /api/auth/signin` - Sign in
  - Body: `{ email, password }`
  - Response: `{ success, data: { user, token } }`

- `POST /api/auth/forgot-password` - Request password reset
  - Body: `{ email }`
  - Response: `{ success, message }`

- `POST /api/auth/reset-password` - Reset password
  - Body: `{ token, password }`
  - Response: `{ success, data: { user, token } }`

### Todos (Protected - Requires Authentication)

- `GET /api/todos` - Get all todos
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, data: [todos] }`

- `POST /api/todos` - Create a todo
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ title, description? }`
  - Response: `{ success, data: todo }`

- `PUT /api/todos/:id` - Update a todo
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ title?, description?, completed? }`
  - Response: `{ success, data: todo }`

- `DELETE /api/todos/:id` - Delete a todo
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, message }`

- `PATCH /api/todos/:id/toggle` - Toggle todo completion
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, data: todo }`

## Forgot Password Flow

1. User clicks "Forgot Password" on the sign-in page
2. User enters their email address
3. Backend generates a secure reset token (valid for 10 minutes)
4. Backend sends an email with a reset link containing the token
5. User clicks the link and is redirected to the reset password page
6. User enters a new password
7. Backend validates the token and updates the password
8. User is automatically signed in with the new password

## Security Features Explained

### Rate Limiting
- **Auth endpoints**: 5 requests per 15 minutes (prevents brute force)
- **General endpoints**: 100 requests per 15 minutes

### Helmet
- Sets security headers to prevent XSS, clickjacking, and other attacks
- Configures Content Security Policy

### MongoDB Sanitization
- Prevents NoSQL injection by sanitizing user input
- Removes MongoDB operators from request data

### HTTP Parameter Pollution (HPP)
- Prevents attackers from polluting parameters
- Only allows the last value when duplicate parameters are sent

### XSS Protection
- Multiple layers of XSS sanitization
- Cleans request body, query params, and route params
- Uses xss-clean library for additional protection

### CORS
- Configured to only allow requests from the frontend URL
- Supports credentials for authenticated requests

## Error Handling

All backend errors are automatically logged to MongoDB in the `errorlogs` collection. Each error log includes:
- Error message
- Stack trace
- Route and HTTP method
- Status code
- User ID (if authenticated)
- Timestamp

## Development

### Backend
```bash
npm run dev      
npm run build    
npm start       
```

### Frontend
```bash
npm run dev      
npm run build    
npm run preview  
```

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Update `FRONTEND_URL` to your production frontend URL
3. Use a strong `JWT_SECRET`
4. Build both frontend and backend
5. Deploy backend to a Node.js hosting service (Heroku, Railway, etc.)
6. Deploy frontend to a static hosting service (Vercel, Netlify, etc.)

## License

ISC
