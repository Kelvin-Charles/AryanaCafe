const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  points: { type: Number, default: 0 },
  role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema); 