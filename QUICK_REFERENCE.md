# 🚀 Quick Vercel Deployment Reference

## Your Current URLs (After Deployment)
```
Backend:  https://webstock-server.vercel.app
Frontend: https://webstock-client.vercel.app
```

---

## 3-Step Deployment

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### Step 2: Deploy Backend
1. Go to https://vercel.com
2. Import repository → Select `server` folder
3. Add env variables from `ENV_SETUP.md`
4. Click Deploy

### Step 3: Deploy Frontend
1. Import same repository → Select `client` folder
2. Set `VITE_API_URL=https://webstock-server.vercel.app/api`
3. Click Deploy

---

## Admin Login
```
Email: charpachi04@gmail.com
Password: Admin123
```

---

## MongoDB IP Whitelist
⚠️ **CRITICAL:** Add `0.0.0.0/0` in MongoDB Atlas → Network Access

---

## Google OAuth Update
⚠️ **After deployment, add to Google Cloud Console:**
- Authorized Origin: `https://webstock-client.vercel.app`
- Redirect URI: `https://webstock-client.vercel.app/`

---

## Test Checklist
- [ ] Frontend loads
- [ ] Can login
- [ ] Can register
- [ ] Can add stocks
- [ ] Admin dashboard works
- [ ] Bonus system works
- [ ] Feedback works

---

## API Endpoints (Production)
```
GET    https://webstock-server.vercel.app/api/stocks
GET    https://webstock-server.vercel.app/api/users/profile
POST   https://webstock-server.vercel.app/api/users/register
POST   https://webstock-server.vercel.app/api/users/login
POST   https://webstock-server.vercel.app/api/feedback/submit
```

---

## Emergency Rollback
If production breaks:
```bash
git revert HEAD
git push origin main
# Vercel auto-redeploys
```

---

## Free Tier Limitations
- Vercel: 100 GB bandwidth/month (usually enough)
- MongoDB Atlas: 512MB storage free tier
- Finnhub API: 60 calls/minute free tier

---

## Environment Variables Location
- Backend: Vercel Dashboard → Backend Project → Settings → Environment Variables
- Frontend: Vercel Dashboard → Frontend Project → Settings → Environment Variables

---

**Questions?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions!
