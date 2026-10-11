import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'sealed_fallback_jwt_secret_token_123!',
    { expiresIn: '30d' }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password, batch, college, avatar } = req.body;

    if (!name || !email || !password || !batch) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and batch'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A student account with this email already exists'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      batch,
      college: college || 'Campus Engineering',
      avatar: avatar || '🎓'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        batch: user.batch,
        college: user.college,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register student',
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        batch: user.batch,
        college: user.college,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    });
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};
