const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'El email no es válido']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: { 
    type: String, 
    required: function() { return !this.isVerified; } 
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin', 'guest']
  },
  personalInfo: {
    name: { type: String },
    lastName: { type: String },
    nif: { type: String }
  },
  companyInfo: {
    name: { type: String },
    cif: { type: String },
    address: { type: String }
  },
  resetCode: { type: String },
  resetCodeExpires: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('users', userSchema);