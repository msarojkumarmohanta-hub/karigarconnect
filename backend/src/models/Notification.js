const mongoose = require('mongoose');
module.exports = mongoose.model('Notification', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, title: String, message: String,
  type: { type: String, default: 'system' }, read: { type: Boolean, default: false }, data: mongoose.Schema.Types.Mixed
}, { timestamps: true }));
