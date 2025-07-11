# GateKeeper Authentication API

A production-ready authentication API built with Node.js, Express, MongoDB, and JWT tokens. Features include user registration, login, refresh tokens, account lockout, password reset, and role-based access control.

## 🚀 Features

- **Secure Authentication**: JWT access tokens with refresh token rotation
- **Account Security**: Automatic account lockout after failed login attempts  
- **Password Security**: bcrypt hashing with configurable rounds
- **Role-Based Access**: User, moderator, and admin roles
- **Rate Limiting**: Configurable rate limiting for API protection
- **Input Validation**: Comprehensive request validation with express-validator
- **Security Headers**: Helmet.js for secure HTTP headers
- **CORS Protection**: Configurable CORS with multiple origin support
- **Health Monitoring**: Built-in health check endpoint
- **Graceful Shutdown**: Proper cleanup on server termination
- **Production Ready**: Optimized for deployment on Render, Heroku, etc.

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB database (local or MongoDB Atlas)
- npm >= 9.0.0

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd gatekeeper-auth-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.production.example .env
   # Edit .env with your actual values
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🌍 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `PRODUCTION` or `DEVELOPMENT` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-super-secure-secret...` |
| `JWT_REFRESH_SECRET` | Refresh token secret (32+ chars) | `your-refresh-secret...` |
| `SESSION_SECRET` | Session secret (32+ chars) | `your-session-secret...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit per window | `100` |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | `900000` (15 min) |

## 🚀 Deployment on Render

### Method 1: Direct Deployment

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service**
   - Connect your GitHub repository
   - Choose "Node" as the environment
   - Use these settings:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Health Check Path**: `/health`

3. **Set Environment Variables**
   - Go to your service's Environment tab
   - Add all required variables from `.env.production.example`
   - Generate strong secrets (32+ characters) for production

4. **Deploy**
   - Render will automatically deploy when you push to your main branch

### Method 2: Using render.yaml

1. **Use the included render.yaml**
   - The project includes a `render.yaml` file for infrastructure as code
   - Render will automatically use this configuration

2. **Set up MongoDB Atlas**
   - Create a free cluster at [mongodb.com](https://www.mongodb.com/cloud/atlas)
   - Get your connection string
   - Add it as `MONGODB_URI` in Render

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login user | No |
| `POST` | `/api/auth/refresh-token` | Refresh access token | No |
| `POST` | `/api/auth/logout` | Logout user | No |
| `POST` | `/api/auth/logout-all` | Logout from all devices | Yes |
| `GET` | `/api/auth/profile` | Get user profile | Yes |

### Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/` | API information |

## 🔐 Authentication Flow

1. **Register**: `POST /api/auth/register`
   ```json
   {
     "fullName": "John Doe",
     "email": "john@example.com", 
     "password": "SecurePass123!"
   }
   ```

2. **Login**: `POST /api/auth/login`
   ```json
   {
     "email": "john@example.com",
     "password": "SecurePass123!"
   }
   ```

3. **Use Access Token**: Include in headers
   ```
   Authorization: Bearer <access_token>
   ```

4. **Refresh Token**: Automatically handled via HTTP-only cookies

## 🛡️ Security Features

- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
- **Account Lockout**: 5 failed attempts locks account for 2 hours
- **Rate Limiting**: 5 auth requests per 15 minutes per IP
- **Secure Cookies**: HTTP-only, secure, SameSite cookies for refresh tokens
- **CORS Protection**: Configurable allowed origins
- **Input Sanitization**: SQL injection and XSS protection
- **Security Headers**: Comprehensive security headers via Helmet

## 📊 Monitoring

- **Health Check**: `GET /health` returns server status
- **Memory Monitoring**: Automatic memory usage tracking
- **Graceful Shutdown**: Proper cleanup on SIGTERM/SIGINT
- **Error Logging**: Comprehensive error logging

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Health check
npm run health
```

---

**Made with ❤️ by Ateeksh Soni**
