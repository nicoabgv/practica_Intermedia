const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/handleMails');

exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  // Código de verificación aleatorio para confirmar correo de 6 cifras
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    password: hashedPassword,
    verificationCode
  });

  await newUser.save();

  await sendEmail({
    from: process.env.EMAIL,
    to: newUser.email,
    subject: "Verifica tu correo",
    text: `Tu código de verificación es: ${verificationCode}`,
  });

  // Token para validar el correo, o simplemente mantener sesión inicial
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
  
      if (user.verificationCode !== code) {
        return res.status(400).json({ error: 'Código incorrecto' });
      }
  
      if (user.isVerified) {
        return res.status(400).json({ error: 'El correo ya ha sido verificado' });
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

      // Si el usuario es "invitado", se rellena automáticamente con sus datos personales
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

        // Excluimos contraseña y código de verificación del resultado
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
            // Eliminación definitiva
            await User.findByIdAndDelete(decoded.id);
            return res.status(200).json({ message: 'Usuario eliminado permanentemente' });
        }

        // Soft delete
        user.isActive = false;
        await user.save();

        res.status(200).json({ message: 'Usuario marcado como inactivo (Soft delete)' });
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

exports.restoreUser = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+isActive');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.isActive) {
      return res.status(400).json({ error: 'El usuario ya está activo' });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({ message: 'Usuario restaurado correctamente' });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Código temporal con duración de 1h de 6 cifras
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 3600000;
    await user.save();

    await sendEmail({
        from: process.env.EMAIL,
        to: user.email,
        subject: "Código de recuperación de contraseña",
        text: `Tu código para recuperar tu contraseña es: ${resetCode}`,
      });

    res.status(200).json({
        message: 'Código de recuperación generado correctamente',
        resetCode
    });
};

exports.resetPassword = async (req, res) => {
    const { email, code, password } = req.body;

    const user = await User.findOne({
        email,
        resetCode: code,
        resetCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    if (!password || password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida correctamente' });
};

exports.inviteUser = async (req, res) => {
    const { email } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const sender = await User.findById(decoded.id);

        if (!sender) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'El usuario ya está registrado' });
        }

        // Token de invitación con rol "guest" y duración de 24h
        const inviteToken = jwt.sign(
            { email, role: 'guest' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await sendEmail({
            from: process.env.EMAIL,
            to: email,
            subject: "Invitación a la plataforma",
            text: `Has sido invitado a unirte. Regístrate usando este enlace: http://tusitio.com/register?token=${inviteToken}`,
          });

        res.status(200).json({
            message: 'Invitación generada correctamente',
            inviteToken
        });

    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

exports.registerInvitedUser = async (req, res) => {
    const { token, password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const existingUser = await User.findOne({ email: decoded.email });
        if (existingUser) {
            return res.status(409).json({ error: 'El usuario ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email: decoded.email,
            password: hashedPassword,
            role: decoded.role,
            isVerified: true,
            verificationCode: "INVITED_USER" // Para no tener que verificar por correo otra vez
        });

        res.status(201).json({
            message: 'Usuario registrado correctamente',
            user: {
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        res.status(400).json({ error: 'Token de invitación inválido o expirado' });
    }
};