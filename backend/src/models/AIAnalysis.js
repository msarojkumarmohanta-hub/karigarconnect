const mongoose = require('mongoose');
module.exports = mongoose.model('AIAnalysis', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  imageUrl: String, input: mongoose.Schema.Types.Mixed, output: mongoose.Schema.Types.Mixed, confidence: Number,
  provider: { type: String, default: 'fallback' }
}, { timestamps: true }));
