const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    password: hashedPassword,
    verificationCode
  });

  await newUser.save();

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(201).json({
    message: 'Usuario registrado correctamente',
    user: {
      email: newUser.email,
      isVerified: newUser.isVerified,
      role: newUser.role
    },
    token
  });
};

exports.validateEmail = async (req, res) => {
  const { code } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
  }

  if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Código de verificación inválido' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (user.isVerified) {
          return res.status(400).json({ error: 'El correo ya ha sido verificado' });
      }

      if (user.verificationCode !== code) {
          return res.status(400).json({ error: 'Código incorrecto' });
      }

      user.isVerified = true;
      await user.save();

      res.status(200).json({ message: 'Correo verificado correctamente' });
  } catch (error) {
      res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  const user = await User.findOne({ email });

  if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({
      message: 'Login exitoso',
      user: {
          email: user.email,
          isVerified: user.isVerified,
          role: user.role
      },
      token
  });
};

exports.updatePersonalInfo = async (req, res) => {
  const { name, lastName, nif } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      user.personalInfo = { name, lastName, nif };
      await user.save();

      res.status(200).json({
          message: 'Datos personales actualizados correctamente',
          user: user.personalInfo
      });
  } catch (error) {
      res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

exports.updateCompanyInfo = async (req, res) => {
  const { name, cif, address } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (user.role === 'guest') {
          user.companyInfo = {
              name: user.personalInfo.name,
              cif: user.personalInfo.nif,
              address: 'No especificada'
          };
      } else {
          user.companyInfo = { name, cif, address };
      }

      await user.save();

      res.status(200).json({
          message: 'Datos de la compañía actualizados correctamente',
          companyInfo: user.companyInfo
      });
  } catch (error) {
      res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

exports.getUserProfile = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password -verificationCode');

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({
            message: 'Perfil obtenido correctamente',
            user
        });
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

exports.deleteUser = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { type } = req.query;

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (type === 'hard') {
            await User.findByIdAndDelete(decoded.id);
            return res.status(200).json({ message: 'Usuario eliminado permanentemente' });
        }

        user.isActive = false;
        await user.save();

        res.status(200).json({ message: 'Usuario marcado como inactivo (Soft delete)' });
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};