const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, artisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, quantity: Number, price: Number, subtotal: Number }],
  totalAmount: { type: Number, required: true }, quickDelivery: { type: Boolean, default: false }, quickDeliveryDistance: { type: Number, min: 0, max: 50 }, shippingAddress: { address: String, name: String, phone: String, line1: String, city: String, state: String, postalCode: String, country: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending', index: true },
  trackingNumber: String
}, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);
