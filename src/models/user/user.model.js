// models/user.model.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
    trim: true,
  },

  creditLimit: {
    type: Number,
    default: 100,
  },

  usedCredits: {
    type: Number,
    default: 0,
  },

  isActive: {
    type: Boolean,
    default: true,
  },



}, { timestamps: true });

module.exports = mongoose.model("user", UserSchema, 'users');
