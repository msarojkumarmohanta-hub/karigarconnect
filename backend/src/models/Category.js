const mongoose = require('mongoose');
module.exports = mongoose.model('Category', new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, slug: { type: String, required: true, unique: true, index: true },
  description: String, icon: String, image: String, isActive: { type: Boolean, default: true }
}, { timestamps: true }));
