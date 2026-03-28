const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id, expires = '30d') =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: expires });

const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  });
};

const genCode = (len = 6) => Math.floor(Math.random() * (10 ** len)).toString().padStart(len, '0');

const registerUser = async (req, res) => {
  try {
    let { username, firstName, lastName, email, password, phone } = req.body;
    if (!username || !firstName || !lastName || !email || !password)
      return res.status(400).json({ message: 'Please fill all required fields' });

    // Validate username: no spaces, lowercase
    if (username.includes(' ')) return res.status(400).json({ message: 'Username cannot contain spaces' });
    username = username.trim().toLowerCase();

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = genCode(6);

    const user = await User.create({
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      balance: 100000,
      isVerified: false,
      emailVerificationCode: verificationCode
    });

    // send verification email
    try {
      await sendEmail(email, 'Verify your SB Stocks account', `Your verification code: ${verificationCode}`, `<p>Your verification code: <b>${verificationCode}</b></p>`);
    } catch (e) {
      console.error('Email send failed', e.message);
    }

    res.status(201).json({ message: 'User created, verification email sent', email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code, isLogin } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid request' });
    if (user.emailVerificationCode !== code) return res.status(400).json({ message: 'Invalid code' });

    // If this is login OTP verification
    if (isLogin) {
      user.emailVerificationCode = '';
      await user.save();
      if (user.totpEnabled) {
        const tempToken = jwt.sign({ id: user._id, totp: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
        return res.json({ requiresTOTP: true, tempToken });
      }
      return res.json({ token: generateToken(user._id), user });
    }

    // If this is registration email verification
    user.isVerified = true;
    user.emailVerificationCode = '';
    await user.save();

    res.json({ message: 'Email verified', token: generateToken(user._id), user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email before logging in' });

    // For admin, if TOTP enabled, require TOTP. Otherwise, direct login.
    if (user.role === 'admin') {
      if (user.totpEnabled) {
        const tempToken = jwt.sign({ id: user._id, totp: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
        return res.json({ requiresTOTP: true, tempToken });
      }
      return res.json({
        user: {
          _id: user._id, username: user.username, email: user.email,
          balance: user.balance, role: user.role, phone: user.phone,
          firstName: user.firstName, lastName: user.lastName, createdAt: user.createdAt
        },
        token: generateToken(user._id)
      });
    }

    // For regular users, require OTP after password verification
    const otpCode = genCode(6);
    user.emailVerificationCode = otpCode;
    await user.save();
    try {
      await sendEmail(email, 'Your SB Stocks Login Code', `Your login verification code: ${otpCode}`, `<p>Your login verification code: <b>${otpCode}</b></p>`);
    } catch (e) {
      console.error('Email send failed', e.message);
    }
    const tempToken = jwt.sign({ id: user._id, otp: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
    res.json({ requiresOTP: true, tempToken, email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyTOTP = async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken) return res.status(400).json({ message: 'Missing token' });
    let decoded;
    try { decoded = jwt.verify(tempToken, process.env.JWT_SECRET); } catch { return res.status(401).json({ message: 'Invalid or expired token' }); }
    if (!decoded.totp) return res.status(400).json({ message: 'Invalid token' });
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const verified = speakeasy.totp.verify({ secret: user.totpSecret, encoding: 'base32', token: code, window: 1 });
    if (!verified) return res.status(400).json({ message: 'Invalid code' });

    res.json({ 
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If that email exists we sent a reset code' });
    const resetCode = genCode(6);
    user.passwordResetCode = resetCode;
    await user.save();
    try {
      await sendEmail(email, 'SB Stocks Password Reset Code', `Your password reset code: ${resetCode}`, `<p>Your password reset code: <b>${resetCode}</b></p>`);
    } catch (e) { console.error('Email error', e.message); }
    res.json({ message: 'If that email exists we sent a reset code' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid request' });
    if (user.passwordResetCode !== code) return res.status(400).json({ message: 'Invalid code' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetCode = '';
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, family_name } = payload;
    let user = await User.findOne({ email });
    if (!user) {
      // For new Google users, require username setup
      const tempUser = await User.create({ 
        firstName: name || '',
        lastName: family_name || '',
        username: name || email.split('@')[0], 
        email, 
        password: '', 
        isVerified: false,
        googleId,
        balance: 100000
      });
      return res.json({ 
        requiresUsernameSetup: true, 
        userId: tempUser._id, 
        email: tempUser.email, 
        firstName: tempUser.firstName,
        lastName: tempUser.lastName
      });
    } else {
      if (!user.googleId) { user.googleId = googleId; await user.save(); }
    }
    const token = generateToken(user._id);
    res.json({ 
      token, 
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const totpSetup = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const secret = speakeasy.generateSecret({ name: `SB-Stocks (${user.email})` });
    user.totpSecret = secret.base32;
    await user.save();
    const qrData = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ otpauth_url: secret.otpauth_url, qr: qrData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const totpEnable = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const verified = speakeasy.totp.verify({ secret: user.totpSecret, encoding: 'base32', token: code, window: 1 });
    if (!verified) return res.status(400).json({ message: 'Invalid code' });
    user.totpEnabled = true;
    await user.save();
    res.json({ message: 'TOTP enabled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = req.body.username || user.username;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updated = await user.save();
    res.json({
      _id: updated._id, username: updated.username, email: updated.email,
      balance: updated.balance, role: updated.role, phone: updated.phone,
      token: generateToken(updated._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setUsername = async (req, res) => {
  try {
    let { userId, firstName, lastName, username } = req.body;
    if (!userId || !firstName || !lastName || !username) 
      return res.status(400).json({ message: 'All fields required' });
    
    // Validate username: no spaces, lowercase
    if (username.includes(' ')) return res.status(400).json({ message: 'Username cannot contain spaces' });
    username = username.trim().toLowerCase();
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== userId) 
      return res.status(400).json({ message: 'Username already taken' });
    
    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;
    user.isVerified = true;
    await user.save();
    
    const token = generateToken(user._id);
    res.json({ token, message: 'Username and name set successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  verifyTOTP,
  forgotPassword,
  resetPassword,
  googleAuth,
  setUsername,
  totpSetup,
  totpEnable,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser
};
