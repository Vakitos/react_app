const { Router } = require("express");
const bcrypt = require('bcryptjs');
const router = Router();
const jwt = require("jsonwebtoken"); 
const User = require('../models/User');

// Конфигурация JWT
const JWT_SECRET = process.env.JWT_SECRET || "your_secure_jwt_secret";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none',
  maxAge: 3600000
};

// Валидация email
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

router.post("/registration", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: 'Некорректный формат email' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Пароль должен быть не короче 6 символов' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Пользователь с таким email уже существует' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Регистрация успешно завершена'
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Неверные учетные данные' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Неверные учетные данные' 
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('authToken', token, COOKIE_OPTIONS);
    
    res.json({
      success: true,
      userId: user._id,
      tokenExpiration: Date.now() + 3600000
    });

  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при обработке запроса' 
    });
  }
});

module.exports = router;
