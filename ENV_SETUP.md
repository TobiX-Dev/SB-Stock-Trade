# Environment Variables Setup

## Backend (.env file for server/)

```
# MongoDB
MONGO_URI=mongodb+srv://sb-user:Rohan%40135@cluster0.cdrz3vx.mongodb.net/sb-stocks?appName=Cluster0

# JWT
JWT_SECRET=stocks_jwt_super_secret_key_2026

# Finnhub API
FINNHUB_API_KEY=d737v79r01qjjol22m30d737v79r01qjjol22m3g

# Email SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=chipuredarshan@gmail.com
SMTP_PASS=qxhq maiz wfya vuga

# Email
FROM_EMAIL=noreply@sbstocks.com

# Google OAuth
GOOGLE_CLIENT_ID=736818057487-rk7qt87ki2vc1u0b7kj19dtevii3vl05.apps.googleusercontent.com

# Server Port (optional for Vercel)
PORT=5000
```

## Frontend (.env.local file for client/)

```
VITE_API_URL=https://webstock-server.vercel.app/api
VITE_GOOGLE_CLIENT_ID=736818057487-rk7qt87ki2vc1u0b7kj19dtevii3vl05.apps.googleusercontent.com
```

**Note:** For local development, use `http://localhost:5000/api` instead of the Vercel URL.

---

## How to Set These in Vercel

1. **Backend Project Settings:**
   - Go to Vercel Dashboard → Select backend project
   - Click "Settings" → "Environment Variables"
   - Add all variables from Backend section above

2. **Frontend Project Settings:**
   - Go to Vercel Dashboard → Select frontend project
   - Click "Settings" → "Environment Variables"
   - Add all variables from Frontend section above

---

## MongoDB Connection String Explained

```
mongodb+srv://sb-user:Rohan%40135@cluster0.cdrz3vx.mongodb.net/sb-stocks?appName=Cluster0
```

- `sb-user` = Username
- `Rohan%40135` = Password (@ encoded as %40)
- `cluster0` = Your MongoDB cluster
- `sb-stocks` = Database name

**Important:** Whitelist Vercel IPs in MongoDB Atlas:
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Enter: `0.0.0.0/0` (Allow all - for Vercel dynamic IPs)
4. Click "Confirm"

---

## Gmail SMTP App Password Setup

The password `qxhq maiz wfya vuga` is a Gmail App Password (not your actual password).

**To generate a new one:**
1. Enable 2FA on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows"
4. Copy the 16-character password
5. Update SMTP_PASS in your environment

---

## Local Development Setup

Create `.env` files in both directories:

**server/.env:**
```bash
MONGO_URI=mongodb+srv://sb-user:Rohan%40135@cluster0.cdrz3vx.mongodb.net/sb-stocks?appName=Cluster0
JWT_SECRET=stocks_jwt_super_secret_key_2026
FINNHUB_API_KEY=d737v79r01qjjol22m30d737v79r01qjjol22m3g
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=chipuredarshan@gmail.com
SMTP_PASS=qxhq maiz wfya vuga
FROM_EMAIL=noreply@sbstocks.com
GOOGLE_CLIENT_ID=736818057487-rk7qt87ki2vc1u0b7kj19dtevii3vl05.apps.googleusercontent.com
PORT=5000
```

**client/.env.local:**
```bash
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=736818057487-rk7qt87ki2vc1u0b7kj19dtevii3vl05.apps.googleusercontent.com
```

Then run:
```bash
cd server && npm start
cd ../client && npm run dev
```
