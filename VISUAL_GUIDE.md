# 📋 SB Stocks Deployment - Visual Guide

## Your Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR USERS                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    INTERNET │ (HTTPS)
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌───────────────────┐                   ┌──────────────────┐
│   VERCEL          │                   │   VERCEL         │
│   (Frontend)      │                   │   (Backend)      │
│                   │                   │                  │
│  React App        │                   │  Express API     │
│  https://...      │ ──── API Call ──► │  https://...     │
│  client.vercel... │                   │  server.vercel.. │
│                   │                   │                  │
│  Vite Build       │◄──── Response ─── │  Node.js         │
│  CDN              │                   │  serverless      │
└───────────────────┘                   └────────┬─────────┘
                                                 │
                                                 │ Database
                                                 │ Connection
                                                 ▼
                                        ┌──────────────────┐
                                        │  MONGODB ATLAS   │
                                        │  (Production DB) │
                                        │                  │
                                        │  sb-stocks       │
                                        │  database        │
                                        │                  │
                                        │  Collections:    │
                                        │  - users         │
                                        │  - stocks        │
                                        │  - portfolios    │
                                        │  - transactions  │
                                        │  - feedback      │
                                        └──────────────────┘
```

---

## Deployment Flow

```
Step 1: Push Code
├─ git add .
├─ git commit
├─ git push origin main
└─ Code on GitHub ✓

Step 2: Deploy Backend
├─ Vercel → Import Repo
├─ Select server/ folder
├─ Add 11 environment variables
├─ Click Deploy
└─ Backend URL: https://webstock-server.vercel.app ✓

Step 3: Deploy Frontend
├─ Vercel → Import Same Repo
├─ Select client/ folder
├─ Add VITE_API_URL = backend URL
├─ Add VITE_GOOGLE_CLIENT_ID
├─ Click Deploy
└─ Frontend URL: https://webstock-client.vercel.app ✓

Step 4: Configure
├─ Update Google OAuth URLs
├─ Whitelist Vercel IPs in MongoDB
├─ Verify CORS settings
└─ Configuration Complete ✓

Step 5: Test
├─ Visit frontend URL
├─ Test registration
├─ Test login
├─ Test admin features
└─ All Features Working ✓
```

---

## File Organization

```
📦 WebStock (Your Project Root)
│
├── 📁 server/
│   ├── index.js                    (UPDATED - CORS)
│   ├── vercel.json                 (NEW - Deploy config)
│   ├── package.json
│   ├── 📁 config/
│   │   └── db.js
│   ├── 📁 controllers/
│   │   ├── userController.js
│   │   ├── stockController.js
│   │   ├── transactionController.js
│   │   ├── orderController.js
│   │   └── feedbackController.js
│   ├── 📁 models/
│   │   ├── userModel.js
│   │   ├── stockSchema.js
│   │   ├── transactionModel.js
│   │   ├── orderSchema.js
│   │   └── feedbackModel.js
│   ├── 📁 routes/
│   │   ├── userRoute.js
│   │   ├── stockRoute.js
│   │   ├── transactionRoute.js
│   │   ├── orderRoute.js
│   │   └── feedbackRoute.js
│   └── 📁 middlewares/
│       └── authMiddleware.js
│
├── 📁 client/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── 📁 src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── 📁 components/
│   │   │   ├── axiosInstance.js    (UPDATED - Env variables)
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── FeedbackModal.jsx
│   │   │   └── StockSearchModal.jsx
│   │   ├── 📁 context/
│   │   │   └── GeneralContext.jsx
│   │   └── 📁 pages/
│   │       ├── Home.jsx
│   │       ├── Landing.jsx
│   │       ├── Login.jsx
│   │       ├── Stocks.jsx
│   │       ├── Portfolio.jsx
│   │       ├── History.jsx
│   │       ├── Profile.jsx
│   │       ├── StockChart.jsx
│   │       ├── Admin.jsx
│   │       ├── AdminPages.jsx
│   │       ├── AdminBonus.jsx
│   │       ├── AdminFeedback.jsx
│   │       └── SetUsernameSetup.jsx
│
└── 📄 Documentation Files (READ THESE!)
    ├── DEPLOYMENT_START_HERE.md      ⭐ START HERE
    ├── DEPLOYMENT_GUIDE.md
    ├── ENV_SETUP.md
    ├── DEPLOYMENT_CHECKLIST.md
    ├── QUICK_REFERENCE.md
    ├── README_DEPLOYMENT.md
    └── DEPLOYMENT_COMPLETE.md
```

---

## Environment Variables at a Glance

### Backend (server/vercel.json)
```json
{
  "env": {
    "MONGO_URI": "@mongo_uri",              // MongoDB connection
    "JWT_SECRET": "@jwt_secret",            // Token secret
    "FINNHUB_API_KEY": "@finnhub_api_key",  // Stock API
    "SMTP_HOST": "@smtp_host",              // Email
    "SMTP_PORT": "@smtp_port",              // Email
    "SMTP_SECURE": "@smtp_secure",          // Email
    "SMTP_USER": "@smtp_user",              // Email
    "SMTP_PASS": "@smtp_pass",              // Email
    "FROM_EMAIL": "@from_email",            // Email
    "GOOGLE_CLIENT_ID": "@google_client_id" // OAuth
  }
}
```

### Frontend (vite build)
```
VITE_API_URL = https://webstock-server.vercel.app/api
VITE_GOOGLE_CLIENT_ID = 736818057487-...
```

---

## Testing Checklist (After Deployment)

```
Authentication
  [ ] Email registration works
  [ ] Email OTP verification works
  [ ] Google Sign-In works
  [ ] User is redirected to /set-username for Google signup
  [ ] Token is stored in localStorage
  [ ] Login with email works
  [ ] OTP verification after password works

User Features
  [ ] Can view profile
  [ ] Can see username, email, balance
  [ ] Can submit feedback
  [ ] Portfolio shows stocks
  [ ] Can view trading history
  [ ] Stock charts load

Admin Features
  [ ] Login with charpachi04@gmail.com/Admin123
  [ ] Admin dashboard loads
  [ ] Can search and add stocks from Finnhub
  [ ] Can add bonus to customers
  [ ] Can view and respond to feedback
  [ ] Can view all users

API Calls
  [ ] GET /api/stocks (returns list)
  [ ] GET /api/users/profile (returns user)
  [ ] POST /api/feedback/submit (creates feedback)
  [ ] POST /api/stocks/admin/search-finnhub (searches)
  [ ] PUT /api/users/{id} (updates balance)

Database
  [ ] User data persists
  [ ] Stock data persists
  [ ] Feedback data persists
  [ ] All collections have data
```

---

## Vercel Dashboard Navigation

```
vercel.com
└── Dashboard
    ├── Projects
    │   ├── webstock-server
    │   │   ├── Deployments (Shows your backend URL)
    │   │   ├── Settings
    │   │   │   └── Environment Variables (Add your vars here)
    │   │   └── Logs
    │   │
    │   └── webstock-client
    │       ├── Deployments (Shows your frontend URL)
    │       ├── Settings
    │       │   └── Environment Variables (Add VITE_* here)
    │       └── Logs
    │
    └── Help & Support
```

---

## Error Recovery

```
If Frontend Won't Load
├─ Check browser console (F12 → Console)
├─ Verify VITE_API_URL is correct
├─ Check that backend is deployed
└─ Rebuild if needed

If API Calls Fail
├─ Check CORS error in browser
├─ Verify backend CORS includes frontend URL
├─ Check all env variables are set
└─ Redeploy backend

If Login Fails
├─ Check MongoDB connection (0.0.0.0/0 whitelisted?)
├─ Check JWT_SECRET is set
├─ Check GOOGLE_CLIENT_ID is set
└─ Check logs in Vercel

If Email Doesn't Send
├─ Verify Gmail app password
├─ Check 2FA is enabled
├─ Verify SMTP settings
└─ Check Vercel logs
```

---

## Quick Command Reference

```bash
# Push to GitHub
git add . && git commit -m "Deploy to Vercel" && git push origin main

# Test backend API locally
curl http://localhost:5000

# Test frontend locally
npm run dev --prefix client

# View backend logs (after deploying to Vercel)
# Open: https://vercel.com → Project → Deployments → Latest → Logs

# Test production API
curl https://webstock-server.vercel.app
```

---

## Timeline

```
Now
  ↓ 1 min
GitHub Push
  ↓ 3-5 min
Backend Deploy
  ↓ 2-3 min
Frontend Deploy
  ↓ 2 min
Configure Env Vars
  ↓ 1 min
Test Features
  ↓ 5 min
✅ LIVE!

Total: ~15-20 minutes
```

---

## Your Production URLs

```
🌐 Frontend:  https://webstock-client.vercel.app
🔗 API:       https://webstock-server.vercel.app/api
```

Share these with your friends! 🎉

---

## Final Checklist Before You Start

- [ ] Have you read DEPLOYMENT_START_HERE.md?
- [ ] GitHub account ready?
- [ ] Vercel account ready?
- [ ] Environment variables copied?
- [ ] MongoDB IP whitelisted?
- [ ] Google OAuth credentials ready?
- [ ] 30 minutes of free time?

**If YES to all → You're ready to deploy!**

**If NO to any → Check that item first!**

---

## 🚀 You're Ready!

Everything is prepared. Follow DEPLOYMENT_START_HERE.md step by step.

Questions? Check the documentation files.

Good luck! 🎉
