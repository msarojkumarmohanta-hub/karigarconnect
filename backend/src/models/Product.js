const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  artisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 }, slug: { type: String, index: true }, description: { type: String, required: true, maxlength: 5000 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true }, images: [{ url: String, publicId: String }],
  price: { type: Number, required: true, min: 0 }, discountPercent: { type: Number, default: 30, min: 0, max: 30 }, aiSuggestedPrice: { min: Number, max: Number, recommended: Number },
  currency: { type: String, default: 'INR' }, tags: [{ type: String, lowercase: true, trim: true }], materials: [String],
  dimensions: { length: Number, width: Number, height: Number, unit: { type: String, default: 'cm' } }, weight: Number,
  stock: { type: Number, default: 0, min: 0 }, availability: { type: String, enum: ['available', 'unavailable'], default: 'available' },
  handmade: { type: Boolean, default: true }, ecoFriendly: Boolean, location: { state: String, district: String },
  subcategory: String, craftType: String, material: String, color: String, thumbnail: String,
  rating: { type: Number, default: 0, min: 0, max: 5 }, reviewCount: { type: Number, default: 0 }, featured: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'pending_review', 'published', 'rejected', 'sold_out', 'archived'], default: 'draft', index: true },
  views: { type: Number, default: 0 }, likes: { type: Number, default: 0 }, aiGenerated: { type: Boolean, default: false }, aiConfidence: Number
}, { timestamps: true });
productSchema.index({ title: 'text', description: 'text', tags: 'text', materials: 'text', craftType: 'text', subcategory: 'text', material: 'text', 'location.state': 'text', 'location.district': 'text' });
productSchema.index({ price: 1, createdAt: -1, 'location.state': 1 });
module.exports = mongoose.model('Product', productSchema);
