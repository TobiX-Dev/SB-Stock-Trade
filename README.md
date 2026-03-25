# 📈 SB Stocks — Paper Trading Platform

A full-stack MERN (MongoDB, Express, React, Node.js) paper trading simulation platform with **real-time US stock market data** via Finnhub API.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | JWT-based secure registration & login |
| 💰 **Virtual Funds** | $100,000 starting balance per user |
| 📡 **Real-Time Quotes** | Live prices via Finnhub API |
| 📊 **Charts** | Interactive OHLCV candlestick price charts |
| 💼 **Portfolio** | Holdings tracker with P&L, allocation donut chart |
| 📋 **History** | Full buy/sell transaction log |
| 📰 **Market News** | Live financial news feed |
| 🔍 **Stock Search** | Search 10,000+ US-listed stocks |
| 👤 **Profile** | Edit account, view stats |
| ★ **Admin Panel** | Manage users, stocks, view all transactions |

---

## 🗂 Project Structure

```
SB-Stocks/
├── server/                  # Node.js + Express Backend
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── stockController.js
│   │   ├── transactionController.js
│   │   └── orderController.js
│   ├── middlewares/
│   │   └── authMiddleware.js # JWT protect + adminOnly
│   ├── models/
│   │   ├── userModel.js
│   │   ├── stockSchema.js
│   │   ├── transactionModel.js
│   │   ├── orderSchema.js
│   │   └── portfolioModel.js
│   ├── routes/
│   │   ├── userRoute.js
│   │   ├── stockRoute.js
│   │   ├── transactionRoute.js
│   │   └── orderRoute.js
│   ├── .env                 # ← YOU MUST CONFIGURE THIS
│   ├── index.js             # Server entry point + seeding
│   └── package.json
│
└── client/                  # React + Vite + Tailwind Frontend
    ├── src/
    │   ├── components/
    │   │   ├── axiosInstance.js
    │   │   ├── Login.jsx
    │   │   ├── Navbar.jsx
    │   │   └── Register.jsx
    │   ├── context/
    │   │   └── GeneralContext.jsx
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Home.jsx        # Dashboard
    │   │   ├── Stocks.jsx      # Market listing
    │   │   ├── StockChart.jsx  # Stock detail + trade
    │   │   ├── Portfolio.jsx
    │   │   ├── History.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Admin.jsx
    │   │   └── AdminPages.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## ⚙️ Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | v16+ | https://nodejs.org |
| MongoDB | v5+ | https://www.mongodb.com/try/download/community |
| npm | v8+ | Comes with Node.js |
| Finnhub API Key | Free | https://finnhub.io/register |

---

## 🔑 Step 1 — Get Your Finnhub API Key

1. Go to **https://finnhub.io/register**
2. Create a free account
3. Copy your **API Key** from the dashboard
4. Free tier includes:
   - 60 API calls/minute
   - Real-time US stock quotes
   - Company profiles, candle data, news

---

## 🛠 Step 2 — Configure Environment

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sb-stocks
JWT_SECRET=sb_stocks_jwt_super_secret_key_2024
FINNHUB_API_KEY=your_actual_finnhub_key_here
```

> ⚠️ Replace `your_actual_finnhub_key_here` with your real Finnhub API key!

---

## 📦 Step 3 — Install Dependencies

### Backend
```bash
cd SB-Stocks/server
npm install
```

### Frontend
```bash
cd SB-Stocks/client
npm install
```

---

## 🗄 Step 4 — Start MongoDB

### Option A: Local MongoDB
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

### Option B: MongoDB Atlas (Cloud — Free)
1. Go to https://www.mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Replace MONGO_URI in `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sb-stocks
   ```

---

## ▶️ Step 5 — Run the Application

### Terminal 1 — Backend
```bash
cd SB-Stocks/server
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB Connected: localhost
✅ Default stocks seeded
✅ Admin user seeded → email: admin@sbstocks.com | password: Admin@123
```

### Terminal 2 — Frontend
```bash
cd SB-Stocks/client
npm run dev
```

Open **http://localhost:5173** in your browser 🎉

---

## 👤 Default Credentials

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@sbstocks.com     | Admin@123  |

> Regular users can register at `/register` and get $100,000 virtual funds instantly.

---

## 📡 API Endpoints

### Users
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/users/register | Public | Register new user |
| POST | /api/users/login | Public | Login |
| GET  | /api/users/profile | User | Get my profile |
| PUT  | /api/users/profile | User | Update profile |
| GET  | /api/users/all | Admin | All users |
| DELETE | /api/users/:id | Admin | Delete user |

### Stocks
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | /api/stocks | User | All listed stocks |
| GET | /api/stocks/search?q= | User | Search Finnhub |
| GET | /api/stocks/quote/:symbol | User | Live price quote |
| GET | /api/stocks/candles/:symbol | User | Price chart data |
| GET | /api/stocks/profile/:symbol | User | Company details |
| GET | /api/stocks/news | User | Market news |
| GET | /api/stocks/bulk-quotes?symbols= | User | Multiple quotes |
| POST | /api/stocks | Admin | Add stock |
| PUT | /api/stocks/:id | Admin | Update stock |
| DELETE | /api/stocks/:id | Admin | Remove stock |

### Transactions
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/transactions/buy | User | Buy stock |
| POST | /api/transactions/sell | User | Sell stock |
| GET  | /api/transactions/my | User | My transactions |
| GET  | /api/transactions/portfolio | User | My portfolio |
| GET  | /api/transactions/all | Admin | All transactions |

### Orders
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | /api/orders/my | User | My orders |
| GET | /api/orders/all | Admin | All orders |
| GET | /api/orders/stats | Admin | Order statistics |

---

## 🎨 Tech Stack

### Backend
- **Node.js** + **Express.js** — REST API server
- **MongoDB** + **Mongoose** — Database & ODM
- **bcryptjs** — Password hashing
- **jsonwebtoken** — JWT authentication
- **axios** — HTTP client for Finnhub API
- **cors**, **dotenv** — CORS & environment config

### Frontend
- **React 18** + **Vite** — Frontend framework & bundler
- **Tailwind CSS** — Utility-first styling
- **React Router v6** — Client-side routing
- **Chart.js** + **react-chartjs-2** — Stock price charts
- **Axios** — API calls
- **React Toastify** — Notifications

### External API
- **Finnhub** — Real-time stock quotes, candles, company data, news

---

## 🔐 Security Features

- Passwords hashed with **bcrypt** (salt rounds: 10)
- **JWT tokens** with 30-day expiry
- **Role-based access control** (user vs admin)
- Protected routes on both frontend and backend
- Token auto-invalidation on 401 responses

---

## 📊 Database Schemas

### User
```
{ username, email, password (hashed), phone, balance (default: 100000), role, createdAt }
```

### Stock
```
{ symbol, companyName, exchange, sector, description, logo, isActive, addedAt }
```

### Transaction
```
{ user (ref), symbol, companyName, type (buy|sell), quantity, price, totalAmount, timestamp }
```

### Order
```
{ user (ref), symbol, companyName, orderType, quantity, price, totalAmount, status, createdAt }
```

### Portfolio
```
{ user (ref), name, holdings: [{ symbol, companyName, quantity, avgBuyPrice }], createdAt }
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `MONGO_URI` connection error | Make sure MongoDB is running |
| Finnhub returns empty data | Check your API key in `.env` |
| Port 5000 in use | Change `PORT` in `.env` |
| CORS error | Vite proxy is configured — use `localhost:5173` not `5000` |
| Charts not loading | Free Finnhub may rate-limit — wait 1 minute |

---

## 🚀 Production Deployment

### Backend (Render/Railway/Heroku)
1. Set environment variables in your platform dashboard
2. Set `MONGO_URI` to MongoDB Atlas connection string
3. Deploy from `server/` directory

### Frontend (Vercel/Netlify)
1. Change `axiosInstance.js` baseURL to your deployed backend URL
2. Build: `npm run build`
3. Deploy `dist/` folder

---

## 📄 License

MIT License — Free to use for educational purposes.

---

Built with ❤️ using MERN Stack | Powered by Finnhub Real-Time Data
