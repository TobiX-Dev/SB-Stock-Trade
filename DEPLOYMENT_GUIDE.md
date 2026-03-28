# 🚀 SB Stocks - Vercel Deployment Guide

## Step 1: Prepare Your GitHub Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - SB Stocks trading platform"
git remote add origin https://github.com/YOUR_USERNAME/WebStock.git
git push -u origin main
```

## Step 2: Deploy Backend (Server) to Vercel

### 2.1 Sign up on Vercel
- Go to https://vercel.com
- Sign up with GitHub account
- Authorize Vercel

### 2.2 Import Project
1. Click "New Project"
2. Select "Import Git Repository"
3. Paste your GitHub repo URL
4. Click "Import"

### 2.3 Configure Backend Deployment
- **Framework**: Node.js
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `node index.js`

### 2.4 Add Environment Variables
Click "Environment Variables" and add:

```
MONGO_URI = mongodb+srv://sb-user:Rohan%40135@cluster0.cdrz3vx.mongodb.net/sb-stocks?appName=Cluster0
JWT_SECRET = stocks_jwt_super_secret_key_2026
FINNHUB_API_KEY = d737v79r01qjjol22m30d737v79r01qjjol22m3g
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = chipuredarshan@gmail.com
SMTP_PASS = qxhq maiz wfya vuga
FROM_EMAIL = noreply@sbstocks.com
GOOGLE_CLIENT_ID = 736818057487-rk7qt87ki2vc1u0b7kj19dtevii3vl05.apps.googleusercontent.com
```

### 2.5 Deploy
Click "Deploy" - Wait 2-3 minutes

**You'll get a URL like:** `https://webstock-server.vercel.app`

---

## Step 3: Deploy Frontend (Client) to Vercel

### 3.1 Create New Project
1. Go to Vercel Dashboard
2. Click "New Project" → "Import Git Repository"
3. Select same repository

### 3.2 Configure Frontend Deployment
- **Framework**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `dist`

### 3.3 Add Environment Variables
Click "Environment Variables" and add:

```
VITE_API_URL = https://webstock-server.vercel.app/api
VITE_GOOGLE_CLIENT_ID = 736818057487-rk7qt87ki2vc1u0b7kj19dtevii3vl05.apps.googleusercontent.com
```

### 3.4 Deploy
Click "Deploy" - Wait 1-2 minutes

**You'll get a URL like:** `https://webstock-client.vercel.app`

---

## Step 4: Update API Connection in Frontend

After backend deployment, update the frontend API base URL:

**File:** `client/src/components/axiosInstance.js`

```javascript
const axiosInstance = axios.create({
  baseURL: process.env.VITE_API_URL || 'https://webstock-server.vercel.app/api',
  headers: { 'Content-Type': 'application/json' },
});
```

---

## Step 5: Configure CORS (Backend)

Update your backend `server/index.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://webstock-client.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

Then redeploy the backend.

---

## Step 6: Test Live Deployment

1. Visit: `https://webstock-client.vercel.app`
2. Test signup and login
3. Check admin panel
4. Test stock trading

---

## ⚠️ Important Notes

### MongoDB Connection Issues?
- Whitelist Vercel IP addresses in MongoDB Atlas:
  - Go to MongoDB Atlas → Network Access
  - Add IP: `0.0.0.0/0` (Allow from anywhere)
  - Add description: "Vercel deployment"

### Email Not Sending?
- Ensure your Gmail app password is correct
- Enable "Less secure apps" if needed

### CORS Errors?
- Update CORS origin with your actual Vercel URLs
- Redeploy backend

### Slow Deployment?
- Vercel caches builds - may take 2-3 minutes first time
- Clear cache and redeploy if needed

---

## 📊 Domain Names (Optional)

To use custom domain:
1. Go to Project Settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Update DNS settings from your domain provider
5. Point to Vercel nameservers

---

## 🔗 Final URLs After Deployment

**Backend API:** `https://webstock-server.vercel.app`
**Frontend App:** `https://webstock-client.vercel.app`

---

## Troubleshooting

### 502 Bad Gateway
- Backend might be sleeping (free tier)
- Click the backend URL to wake it up
- Then retry frontend

### Build Failed
- Check Vercel deployment logs
- Ensure all dependencies in `package.json`
- Verify environment variables

### Database Connection Refused
- Check MongoDB connection string in .env
- Ensure IP whitelist includes Vercel IPs

### CORS Blocked Requests
- Update backend CORS settings
- Include both frontend URLs

---

## Quick Deploy Checklist

- [ ] GitHub repo created and pushed
- [ ] Backend env vars set in Vercel
- [ ] Frontend env vars set in Vercel
- [ ] CORS configured in backend
- [ ] MongoDB IP whitelisted
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Test login/signup working
- [ ] Test stock search working
- [ ] Email verification working

