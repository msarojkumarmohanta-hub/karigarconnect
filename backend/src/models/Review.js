const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  artisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 2000 }
}, { timestamps: true });

reviewSchema.index({ buyerId: 1, productId: 1 }, { unique: true });
module.exports = mongoose.model('Review', reviewSchema);
