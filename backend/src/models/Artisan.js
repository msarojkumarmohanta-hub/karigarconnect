const mongoose = require('mongoose');
module.exports = mongoose.model('Artisan', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  craftType: String, experience: Number, workshopName: String, story: String, skills: [String],
  certifications: [String], paymentReference: { type: String, select: false },
  rating: { type: Number, default: 0, min: 0, max: 5 }, totalOrders: { type: Number, default: 0 }, totalSales: { type: Number, default: 0 }
}, { timestamps: true }));
