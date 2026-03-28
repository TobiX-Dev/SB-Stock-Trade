# 🎯 SB Stocks - Deployment Complete!

## ✅ What I've Done

1. **Updated Frontend API Connection**
   - `client/src/components/axiosInstance.js` now uses `VITE_API_URL` environment variable
   - Falls back to `/api` for local development
   - Will automatically use production backend URL when deployed

2. **Updated Backend CORS Settings**
   - `server/index.js` now accepts requests from:
     - `http://localhost:5173` (local frontend)
     - `http://localhost:3000` (alternative local)
     - `https://webstock-client.vercel.app` (production frontend)

3. **Created Deployment Configuration**
   - `server/vercel.json` - Serverless deployment config for Express backend
   - Environment variable mapping ready for Vercel

4. **Documentation Ready**
   - `DEPLOYMENT_GUIDE.md` - Step-by-step deployment instructions
   - `ENV_SETUP.md` - Environment variables setup guide
   - `DEPLOYMENT_CHECKLIST.md` - Complete pre/post deployment checklist
   - `QUICK_REFERENCE.md` - Quick commands and URLs reference

---

## 📋 Your Next Steps (In Order)

### Step 1: Prepare Local Environment (If Not Done)
```bash
# Create .env file in server/ directory
# Content from ENV_SETUP.md
```

### Step 2: Test Locally
```bash
cd server
npm install
npm start

# In another terminal:
cd client
npm install
npm run dev
```
Visit `http://localhost:5173` to verify everything works

### Step 3: Push Code to GitHub
```bash
git add .
git commit -m "SB Stocks - Ready for Vercel deployment"
git push origin main
```

### Step 4: Deploy Backend
1. Go to https://vercel.com
2. New Project → Import Git Repository
3. Select WebStock repository
4. Root Directory: `server`
5. Add Environment Variables:
   - MONGO_URI: `mongodb+srv://sb-user:Rohan%40135@cluster0.cdrz3vx.mongodb.net/sb-stocks?appName=Cluster0`
   - JWT_SECRET: `stocks_jwt_super_secret_key_2026`
   - FINNHUB_API_KEY: `d737v79r01qjjol22m30d737v79r01qjjol22m3g`
   - SMTP_HOST: `smtp.gmail.com`
   - SMTP_PORT: `587`
   - SMTP_SECURE: `false`
   - SMTP_USER: `chipuredarshan@gmail.com`
   - SMTP_PASS: `qxhq maiz wfya vuga`
   - FROM_EMAIL: `noreply@sbstocks.com`
   - GOOGLE_CLIENT_ID: `736818057487-rk7qt87ki2vc1u0b7kj19dtevii3vl05.apps.googleusercontent.com`
6. Click Deploy
7. Wait 2-3 minutes
8. Copy the URL (e.g., `https://webstock-server.vercel.app`)

### Step 5: Deploy Frontend
1. New Project → Import Same Repository
2. Root Directory: `client`
3. Add Environment Variables:
   - VITE_API_URL: `https://webstock-server.vercel.app/api` (use your actual URL)
   - VITE_GOOGLE_CLIENT_ID: `736818057487-rk7qt87ki2vc1u0b7kj19dtevii3vl05.apps.googleusercontent.com`
4. Click Deploy
5. Wait 1-2 minutes
6. Copy the URL (e.g., `https://webstock-client.vercel.app`)

### Step 6: Update Google OAuth
1. Go to https://console.cloud.google.com
2. Select your project
3. Go to OAuth 2.0 credentials
4. Edit the web client
5. Add to "Authorized JavaScript origins": `https://webstock-client.vercel.app`
6. Add to "Authorized redirect URIs": `https://webstock-client.vercel.app/`
7. Save

### Step 7: Whitelist Vercel IPs in MongoDB
1. Go to https://cloud.mongodb.com
2. Network Access
3. Add IP Address
4. Enter: `0.0.0.0/0` (Allow all - needed for Vercel's dynamic IPs)
5. Add

### Step 8: Test Production
1. Go to `https://webstock-client.vercel.app`
2. Test registration with email
3. Test Google Sign-In
4. Test admin login: `charpachi04@gmail.com` / `Admin123`
5. Test stock trading
6. Test admin features

---

## 📊 URLs After Deployment

| Component | URL |
|-----------|-----|
| Frontend | https://webstock-client.vercel.app |
| Backend API | https://webstock-server.vercel.app |
| Backend API Prefix | https://webstock-server.vercel.app/api |

---

## 🔑 Important Credentials

| Service | Username | Password |
|---------|----------|----------|
| Admin Account | charpachi04@gmail.com | Admin123 |
| MongoDB | sb-user | Rohan@135 |
| Gmail SMTP | chipuredarshan@gmail.com | qxhq maiz wfya vuga |

---

## ⚠️ Critical Items

1. **MongoDB IP Whitelist**: Must add `0.0.0.0/0` in Atlas Network Access
2. **Google OAuth**: Must update authorized URLs AFTER getting production domain
3. **CORS**: Already updated in server, no changes needed
4. **API URL**: Frontend will use environment variable, no hardcoding needed

---

## 🧪 Quick Test After Deployment

```bash
# Test backend is running
curl https://webstock-server.vercel.app

# Test frontend loads
curl https://webstock-client.vercel.app

# Should see API status and HTML respectively
```

---

## 📞 If Something Goes Wrong

### Backend not responding
- Check MongoDB IP whitelist is set to 0.0.0.0/0
- Check all env variables are set in Vercel
- Check Vercel logs for errors

### Frontend shows API errors
- Check VITE_API_URL is set correctly
- Check backend is deployed and running
- Check CORS is enabled in backend
- Open browser DevTools → Network tab to see actual error

### Email not sending
- Check Gmail app password is correct
- Check 2FA is enabled on Gmail account
- Verify SMTP settings in env variables

### Google Sign-In not working
- Check GOOGLE_CLIENT_ID is set
- Check authorized URLs are added to Google Cloud Console
- Check browser console for OAuth errors

---

## 🎉 Success Indicators

After deployment, you should see:
- ✅ Frontend loads at your Vercel URL
- ✅ Can register new account
- ✅ Can login with email
- ✅ Can login with Google
- ✅ Can see admin dashboard
- ✅ Can add stocks
- ✅ Can make trades
- ✅ Email verification works

---

## 📚 Documentation Files

Read in this order:
1. `QUICK_REFERENCE.md` - Quick overview
2. `DEPLOYMENT_GUIDE.md` - Step-by-step guide
3. `ENV_SETUP.md` - Environment variables
4. `DEPLOYMENT_CHECKLIST.md` - Complete checklist

---

**You're all set!** 🚀 Follow the steps above and your SB Stocks trading platform will be live on Vercel!
