# 📋 Pre-Deployment Checklist

## ✅ Code Ready

- [x] Backend API (Express.js with all routes)
- [x] Frontend App (React with Vite)
- [x] Database models (MongoDB)
- [x] Authentication system (JWT + OTP + TOTP + OAuth)
- [x] Stock trading features
- [x] Admin dashboard
- [x] Customer feedback system
- [x] Email verification system

---

## 🔐 Environment Variables

- [ ] Created `.env` file in `server/` folder
- [ ] Created `.env.local` file in `client/` folder
- [ ] All required variables filled in (see `ENV_SETUP.md`)
- [ ] `.env` files added to `.gitignore`

---

## 🌐 MongoDB Setup

- [ ] MongoDB Atlas account created (done)
- [ ] Database "sb-stocks" exists
- [ ] User credentials created (sb-user/Rohan@135)
- [ ] **IP Whitelist**: Added `0.0.0.0/0` in Network Access

---

## 📧 Email Setup

- [ ] Gmail account: chipuredarshan@gmail.com
- [ ] 2FA enabled on Gmail
- [ ] App password generated (qxhq maiz wfya vuga)
- [ ] SMTP settings added to `.env`

---

## 🔑 Google OAuth Setup

- [ ] Google Cloud Project created
- [ ] OAuth 2.0 credentials generated
- [ ] Client ID: 736818057487-rk7qt87ki2vc1u0b7kj19dtevii3vl05.apps.googleusercontent.com
- [ ] Authorized URLs configured:
  - [x] Local: `http://localhost:5173`
  - [ ] Production: `https://webstock-client.vercel.app`
  
**⚠️ UPDATE AFTER DEPLOYMENT:**
Go to Google Cloud Console → OAuth 2.0 credentials
- Add to "Authorized JavaScript origins": `https://webstock-client.vercel.app`
- Add to "Authorized redirect URIs": `https://webstock-client.vercel.app/`

---

## 📁 Code Structure Verified

### Backend
```
server/
  ├── index.js (Updated with CORS)
  ├── package.json
  ├── config/db.js
  ├── controllers/
  │   ├── userController.js
  │   ├── stockController.js
  │   ├── transactionController.js
  │   ├── orderController.js
  │   └── feedbackController.js
  ├── models/
  │   ├── userModel.js
  │   ├── stockSchema.js
  │   ├── transactionModel.js
  │   ├── orderSchema.js
  │   └── feedbackModel.js
  ├── routes/
  │   ├── userRoute.js
  │   ├── stockRoute.js
  │   ├── transactionRoute.js
  │   ├── orderRoute.js
  │   └── feedbackRoute.js
  ├── middlewares/authMiddleware.js
  └── vercel.json (NEW - Deployment config)
```

### Frontend
```
client/
  ├── vite.config.js
  ├── package.json
  ├── tailwind.config.js
  ├── src/
  │   ├── main.jsx
  │   ├── App.jsx
  │   ├── index.css
  │   ├── components/
  │   │   ├── axiosInstance.js (Updated)
  │   │   ├── Login.jsx
  │   │   ├── Register.jsx
  │   │   ├── Navbar.jsx
  │   │   ├── FeedbackModal.jsx
  │   │   └── StockSearchModal.jsx
  │   ├── context/GeneralContext.jsx
  │   └── pages/
  │       ├── Home.jsx
  │       ├── Landing.jsx
  │       ├── Stocks.jsx
  │       ├── Portfolio.jsx
  │       ├── History.jsx
  │       ├── Profile.jsx
  │       ├── StockChart.jsx
  │       ├── Admin.jsx
  │       ├── AdminPages.jsx
  │       ├── AdminBonus.jsx
  │       ├── AdminFeedback.jsx
  │       ├── Register.jsx
  │       └── SetUsernameSetup.jsx
  └── .vercelignore (if needed)
```

---

## 🚀 Deployment Steps

### 1. GitHub Push
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```
- [ ] Code pushed to GitHub
- [ ] Repository visible at github.com/YOUR_USERNAME/WebStock

### 2. Vercel Backend Deployment
- [ ] Created Vercel account (vercel.com)
- [ ] Imported repository
- [ ] Selected `server` as root directory
- [ ] Added all env variables
- [ ] Deployment successful
- [ ] Backend URL: `https://webstock-server.vercel.app`

### 3. Vercel Frontend Deployment
- [ ] Created new project for `client` directory
- [ ] Added `VITE_API_URL` pointing to backend
- [ ] Added `VITE_GOOGLE_CLIENT_ID`
- [ ] Deployment successful
- [ ] Frontend URL: `https://webstock-client.vercel.app`

---

## ✨ Post-Deployment Validation

### API Tests
- [ ] Backend API responds at `https://webstock-server.vercel.app/api/`
- [ ] GET `/api/users/profile` works (requires token)
- [ ] GET `/api/stocks` returns stock list
- [ ] POST `/api/stocks/admin/search-finnhub` searches stocks

### Frontend Tests
- [ ] App loads at `https://webstock-client.vercel.app`
- [ ] Landing page displays correctly
- [ ] Login page loads
- [ ] Register page loads
- [ ] Google Sign-In button works
- [ ] Logo and branding visible

### Authentication Tests
- [ ] Email registration works
- [ ] Email OTP verification works
- [ ] Google OAuth login works
- [ ] User is redirected to /set-username after Google signup
- [ ] Token is stored in localStorage
- [ ] Profile displays username, email, balance

### Feature Tests
- [ ] Stock search works from admin panel
- [ ] Add stock to portfolio works
- [ ] View portfolio works
- [ ] Admin dashboard loads
- [ ] Bonus management page works
- [ ] Feedback modal appears and submits

### Admin Panel Tests
- [ ] Login as admin: charpachi04@gmail.com / Admin123
- [ ] Admin dashboard loads all tabs
- [ ] Users tab shows all users
- [ ] Stocks tab shows all stocks
- [ ] Bonus page adds money to customer
- [ ] Feedback page shows customer submissions

---

## 🔧 Troubleshooting

### If Backend Deployment Fails
1. Check Vercel logs for errors
2. Verify all env variables are set
3. Ensure `server/index.js` exists and has `require('./routes/...')`
4. Check that `package.json` has `"start": "node index.js"`

### If Frontend Deployment Fails
1. Check that `npm run build` works locally
2. Verify `dist/` folder is generated
3. Ensure `client/package.json` has all dependencies
4. Check `vite.config.js` is configured correctly

### If API Calls Fail
1. Check `VITE_API_URL` is set correctly in Vercel
2. Verify CORS is enabled in backend
3. Check browser console for actual error messages
4. Ensure tokens are being sent in Authorization header

### If Google Auth Fails
1. Add production domain to Google Cloud Console
2. Check `GOOGLE_CLIENT_ID` env variable is set
3. Verify CSRF token handling in frontend
4. Check OAuth redirect URI is correct

### If Email Verification Fails
1. Check Gmail app password is correct (not regular password)
2. Verify 2FA is enabled on Gmail
3. Check SMTP settings in backend
4. Look at Vercel logs for email sending errors

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://www.mongodb.com/docs/atlas/
- **Google OAuth**: https://developers.google.com/identity
- **Express CORS**: https://github.com/expressjs/cors

---

## 🎯 Final Status

**Pre-Deployment:** ✅ All code ready
**Configuration Files:** ✅ Created (vercel.json, ENV_SETUP.md)
**Environment Setup:** ⏳ Awaiting your action
**GitHub Push:** ⏳ Awaiting your action
**Vercel Deployment:** ⏳ Awaiting your action

**Next Action:** Follow `DEPLOYMENT_GUIDE.md` step by step!
