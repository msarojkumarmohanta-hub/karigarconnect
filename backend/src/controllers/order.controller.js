const Product = require('../models/Product');
const Order = require('../models/Order');
const { notify } = require('../services/notification.service');
const { success, created } = require('../utils/response');
const offerRates = [10, 15, 20, 25, 30];
const productOffer = (product) => Number.isFinite(Number(product.discountPercent)) ? Number(product.discountPercent) : offerRates[parseInt(String(product._id).slice(-1), 16) % offerRates.length];
async function create(req, res, next) {
  const reserved = [];
  try {
    const requested = req.body.items || [];
    if (!requested.length) throw Object.assign(new Error('At least one item is required'), { status: 422, code: 'EMPTY_ORDER' });
    const shippingText = String(req.body.shippingAddress?.address || '').toLowerCase();
    const namedStoreAddress = shippingText.includes('bhubaneswar') || shippingText.includes('west bengal');
    if (req.body.quickDelivery && !namedStoreAddress && (!Number.isFinite(Number(req.body.quickDeliveryDistance)) || Number(req.body.quickDeliveryDistance) > 50)) {
      throw Object.assign(new Error('Quick delivery is available only within 50 km of a store'), { status: 422, code: 'QUICK_DELIVERY_UNAVAILABLE' });
    }
    const items = [];
    for (const item of requested) {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, status: 'published', stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );
      if (!product) throw Object.assign(new Error(`Insufficient stock for ${item.productId}`), { status: 409, code: 'STOCK_UNAVAILABLE' });
      reserved.push({ productId: product._id, quantity });
      const discountPercent = Math.min(30, Math.max(0, productOffer(product)));
      const salePrice = req.body.quickDelivery ? product.price : Math.round(product.price * (1 - discountPercent / 100));
      items.push({ productId: product._id, artisanId: product.artisanId, quantity, price: salePrice, subtotal: salePrice * quantity });
    }
    const order = await Order.create({ buyerId: req.user._id, items, totalAmount: items.reduce((sum, item) => sum + item.subtotal, 0), quickDelivery: Boolean(req.body.quickDelivery), quickDeliveryDistance: req.body.quickDelivery ? (namedStoreAddress ? 0 : Number(req.body.quickDeliveryDistance)) : undefined, shippingAddress: req.body.shippingAddress });
    await Promise.all([...new Set(order.items.map((item) => item.artisanId.toString()))].map((artisanId) => notify(artisanId, 'New order received', `Order ${order._id} includes one of your products`, 'order', { orderId: order._id })));
    return created(res, order, 'Order created successfully');
  } catch (error) {
    if (reserved.length) await Promise.all(reserved.map((item) => Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } })));
    next(error);
  }
}
async function list(req, res, next) { try { const filter = req.user.role === 'artisan' ? { 'items.artisanId': req.user._id } : req.user.role === 'admin' ? {} : { buyerId: req.user._id }; return success(res, await Order.find(filter).populate('items.productId', 'title images').sort({ createdAt: -1 }).lean(), 'Orders fetched successfully'); } catch (error) { next(error); } }
async function get(req, res, next) { try { const order = await Order.findById(req.params.id).populate('items.productId'); if (!order) return next(Object.assign(new Error('Order not found'), { status: 404, code: 'ORDER_NOT_FOUND' })); const allowed = req.user.role === 'admin' || order.buyerId.equals(req.user._id) || order.items.some((item) => item.artisanId.equals(req.user._id)); if (!allowed) return next(Object.assign(new Error('Order access denied'), { status: 403, code: 'FORBIDDEN' })); return success(res, order, 'Order fetched successfully'); } catch (error) { next(error); } }
async function status(req, res, next) {
  try {
    const allowedStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(req.body.status)) return next(Object.assign(new Error('Invalid order status'), { status: 422, code: 'INVALID_ORDER_STATUS' }));
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : req.user.role === 'artisan'
        ? { _id: req.params.id, 'items.artisanId': req.user._id }
        : { _id: req.params.id, buyerId: req.user._id };
    const updates = { orderStatus: req.body.status };
    if (req.body.trackingNumber && ['artisan', 'admin'].includes(req.user.role)) updates.trackingNumber = req.body.trackingNumber;
    const order = await Order.findOneAndUpdate(filter, updates, { new: true });
    if (!order) return next(Object.assign(new Error('Order not found'), { status: 404, code: 'ORDER_NOT_FOUND' }));
    await notify(order.buyerId, 'Order status updated', `Your order is now ${order.orderStatus}`, 'order', { orderId: order._id });
    return success(res, order, 'Order status updated');
  } catch (error) { next(error); }
}
async function cancel(req, res, next) { req.body.status = 'cancelled'; return status(req, res, next); }
module.exports = { create, list, get, status, cancel };
