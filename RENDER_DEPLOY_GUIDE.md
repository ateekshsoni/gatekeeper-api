# Render Deployment Guide

## 🚨 Fixed Build Issues

### ✅ Issues Resolved:
1. **Missing Dependencies**: Added all required npm packages
2. **Duplicate Schema Index**: Removed duplicate email index in User model 
3. **Missing disconnectDB Function**: Added proper database disconnection
4. **Environment Variables**: Updated template with proper MongoDB Atlas format

## 🚀 Deployment Steps

### 1. Prepare MongoDB Atlas
```bash
# Create a free MongoDB Atlas cluster at https://cloud.mongodb.com
# 1. Create account/login
# 2. Create new cluster (free tier)
# 3. Create database user with password
# 4. Whitelist IP: 0.0.0.0/0 (allow all IPs for Render)
# 5. Get connection string: Connect -> Connect your application
```

### 2. Deploy on Render
```bash
# 1. Push code to GitHub
git add .
git commit -m "Production ready for Render"
git push origin main

# 2. Create Render account at https://render.com
# 3. Create new Web Service
# 4. Connect GitHub repository
```

### 3. Configure Render Settings
```yaml
# Use these settings in Render:
Build Command: npm install
Start Command: npm start
Health Check Path: /health
Environment: Node
Region: Oregon (or closest to you)
Plan: Starter (free tier)
```

### 4. Set Environment Variables in Render

**Required Variables** (set in Render Environment tab):
```bash
NODE_ENV=PRODUCTION
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gatekeeper_api?retryWrites=true&w=majority
JWT_SECRET=your-64-character-random-secret
JWT_REFRESH_SECRET=your-64-character-random-secret  
SESSION_SECRET=your-64-character-random-secret
COOKIE_SECRET=your-64-character-random-secret
```

**Generate Secure Secrets:**
```bash
# Run this locally to generate secure secrets:
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('COOKIE_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

**Optional Variables:**
```bash
CLIENT_URL=https://your-frontend-domain.com
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
```

## 🔧 Common Build Errors & Solutions

### Error: "Cannot find package 'xyz'"
**Solution**: Ensure all dependencies are in package.json
```bash
npm install --save missing-package-name
```

### Error: "MongoDB connection failed"
**Solutions**:
1. Check MongoDB Atlas connection string format
2. Verify database user credentials
3. Ensure IP whitelist includes 0.0.0.0/0
4. Test connection string locally first

### Error: "Port already in use"
**Solution**: Render automatically assigns PORT, don't hardcode it
```javascript
const PORT = process.env.PORT || 3000;
```

### Error: "Module not found" with ES6 imports
**Solution**: Ensure package.json has:
```json
{
  "type": "module"
}
```

### Error: "Health check failed"
**Solution**: Ensure /health endpoint returns 200 status
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
```

## 🎯 Testing Your Deployment

### 1. Local Testing
```bash
# Test with production environment variables
NODE_ENV=PRODUCTION npm start

# Test health endpoint
curl http://localhost:3000/health

# Test API endpoints
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"TestPass123!"}'
```

### 2. Production Testing
```bash
# Replace YOUR_RENDER_URL with your actual Render URL
curl https://YOUR_RENDER_URL.onrender.com/health

# Test registration
curl -X POST https://YOUR_RENDER_URL.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"TestPass123!"}'
```

## 📊 Monitoring

### Render Dashboard
- Check logs for errors
- Monitor CPU/Memory usage
- Check deployment history

### Health Check
- Endpoint: `GET /health`
- Should return: `{"status":"OK","timestamp":"..."}`

### Common Log Messages
```bash
✅ Good logs:
"Database connected successfully"
"Server running at http://0.0.0.0:3000"
"✅ Server is ready to accept connections"

❌ Error logs to watch:
"MongoDB connection error"
"Cannot find module"
"Port 3000 is already in use"
```

## 🔐 Security Checklist

- ✅ Environment variables set in Render (not in code)
- ✅ Strong JWT secrets (64+ characters)
- ✅ MongoDB Atlas IP whitelist configured
- ✅ HTTPS enabled (automatic on Render)
- ✅ CORS configured for your frontend domain
- ✅ Rate limiting enabled
- ✅ Password hashing with bcrypt
- ✅ Security headers with Helmet

## 🆘 Getting Help

If deployment fails:
1. Check Render logs in dashboard
2. Test locally with production environment
3. Verify all environment variables are set
4. Check MongoDB Atlas configuration
5. Ensure GitHub repository is up to date

---

**Your API will be available at**: `https://your-service-name.onrender.com`
