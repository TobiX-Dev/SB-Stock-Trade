# 📈 SB Stocks - Advanced Trading Platform

<div align="center">

![Stock Trading](https://img.shields.io/badge/Type-Stock%20Trading%20Platform-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern, full-stack stock trading platform with real-time market data, admin dashboard, and intelligent portfolio management.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Deployment](#-deployment) • [API Endpoints](#-api-endpoints)

</div>

---

## ✨ Features

### 🔐 **Authentication & Security**
- ✅ Google OAuth 2.0 integration for seamless signup
- ✅ JWT-based authentication with secure token management
- ✅ Two-Factor Authentication (TOTP) for enhanced security
- ✅ Email verification for new accounts
- ✅ Password hashing with bcrypt

### 📊 **Trading Features**
- ✅ Real-time stock search powered by Finnhub API
- ✅ Buy/Sell stocks with instant portfolio updates
- ✅ Interactive stock charts and price analytics
- ✅ Transaction history with detailed logs
- ✅ Auto-calculated portfolio balance and returns

### 👨‍💼 **Admin Dashboard**
- ✅ Comprehensive admin control panel
- ✅ User management with search & filter
- ✅ Stock inventory management with Finnhub integration
- ✅ Order tracking and verification
- ✅ Transaction monitoring
- ✅ Customer feedback system with responses
- ✅ Bonus fund allocation for users

### 💬 **Customer Support**
- ✅ Floating feedback button on home page
- ✅ Customer issue submission with contact info
- ✅ Admin feedback dashboard for issue resolution
- ✅ Status tracking (Open, In-Progress, Resolved)

---

## 🛠️ Tech Stack


---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account
- Finnhub API key
- Google OAuth credentials

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/TobiX-Dev/SB-Stock-Trade.git
cd SB-Stock-Trade
```

2. **Setup Backend**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

3. **Setup Frontend**
```bash
cd ../client
npm install
npm run dev
```

### **Environment Variables**

**Backend (.env)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_key
FINNHUB_API_KEY=your_finnhub_key
GOOGLE_CLIENT_ID=your_google_client_id
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
PORT=5000
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📱 Usage

### **User Flow**
1. Sign up with Google OAuth or manual registration
2. Add first name, last name, and set username
3. Verify email with OTP
4. Set up 2FA (optional)
5. Browse stocks and build portfolio
6. Track transactions and portfolio performance

### **Admin Features**
1. Access admin dashboard at `/admin`
2. Manage users, stocks, and orders
3. View customer feedback and respond
4. Allocate bonus funds to users
5. Monitor all platform transactions

---

## 🌐 API Endpoints

### **Authentication**
```
POST   /api/users/register       - Register new user
POST   /api/users/login          - User login
POST   /api/users/google-auth    - Google OAuth callback
POST   /api/users/verify-email   - Verify email with OTP
POST   /api/users/set-username   - Setup username (post-OAuth)
POST   /api/users/setup-totp     - Initialize 2FA
POST   /api/users/verify-totp    - Verify TOTP code
```

### **Stocks**
```
GET    /api/stocks               - Get all available stocks
POST   /api/stocks               - Add new stock (admin only)
POST   /api/stocks/admin/search-finnhub - Search Finnhub API
GET    /api/stocks/:id           - Get stock details
```

### **Trading**
```
POST   /api/orders               - Create buy/sell order
GET    /api/orders               - Get user orders
PUT    /api/orders/:id/verify    - Verify order (admin)
```

### **Portfolio**
```
GET    /api/portfolio            - Get user portfolio
GET    /api/transactions         - Get transaction history
```

### **Admin**
```
GET    /api/users/all            - Get all users (admin only)
PUT    /api/users/:id            - Update user (admin only)
POST   /api/feedback/submit      - Submit feedback
GET    /api/feedback/all         - Get all feedback (admin only)
PUT    /api/feedback/:id         - Respond to feedback (admin only)
```

---

## 📦 Deployment

### **Vercel (Frontend)**

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `VITE_API_URL` - Backend API URL
   - `VITE_GOOGLE_CLIENT_ID` - Google OAuth ID
3. Deploy automatically on push to main

### **Backend Hosting Options**
- **Render.com** (Recommended - Free tier available)
- **Railway.app**
- **Heroku** (Paid)
- **DigitalOcean**

### **Database**
- MongoDB Atlas (Cloud - Free tier)
- Local MongoDB

---

## 🔒 Security Features

- **HTTPS/SSL** - All connections encrypted
- **CORS** - Configured for specific domains
- **Rate Limiting** - API rate limit protection
- **Input Validation** - Server-side validation on all inputs
- **SQL Injection Prevention** - Using Mongoose ODM
- **XSS Protection** - React's built-in XSS prevention
- **CSRF Tokens** - Implemented for state-changing operations

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👤 Author

**Darshan Tobi** - Stock Trading Platform Developer

- GitHub: [@TobiX-Dev](https://github.com/TobiX-Dev)
- Platform: SB Stocks

---

## 📞 Support

For support, feedback, or issues:
- Use the in-app feedback system 💬
- Create an issue on GitHub
- Contact: your-email@gmail.com

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced charting (TradingView integration)
- [ ] Paper trading mode
- [ ] Social features (follow traders, copy trades)
- [ ] Cryptocurrency support
- [ ] Margin trading
- [ ] API for third-party integrations

---

<div align="center">

**Made with ❤️ by Darshan Tobi**

⭐ If you like this project, please give it a star!

</div>

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
