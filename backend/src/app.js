require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const { configureCloudinary } = require('./config/cloudinary');
const { notFound, errorHandler } = require('./middleware/error.middleware');
configureCloudinary();
const app = express();
app.use(helmet()); app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true, credentials: true })); app.use(compression()); app.use(cookieParser()); app.use(express.json({ limit: '1mb' })); app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || 'uploads')));
const health = (req, res) => res.json({ success: true, status: 'healthy', service: 'KarigarConnect API', database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected', timestamp: new Date().toISOString() });
app.get('/health', health); app.get('/api/v1/health', health);
app.use('/api/v1/auth', require('./routes/auth.routes')); app.use('/api/v1/users', require('./routes/user.routes')); app.use('/api/v1/products', require('./routes/product.routes')); app.use('/api/v1/search', require('./routes/search.routes')); app.use('/api/v1/market', require('./routes/market.routes')); app.use('/api/v1/categories', require('./routes/category.routes')); app.use('/api/v1/wishlist', require('./routes/wishlist.routes')); app.use('/api/v1/orders', require('./routes/order.routes')); app.use('/api/v1/artisans', require('./routes/artisan.routes')); app.use('/api/v1/artisan', require('./routes/artisan.routes')); app.use('/api/v1/recommendations', require('./routes/recommendation.routes')); app.use('/api/v1/notifications', require('./routes/notification.routes')); app.use('/api/v1/ai', require('./routes/ai.routes')); app.use('/api/v1/uploads', require('./routes/upload.routes')); app.use('/api/v1/payments', require('./routes/payment.routes')); app.use('/api/v1', require('./routes/review.routes')); app.use('/api/v1/admin', require('./routes/admin.routes'));
const swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'KarigarConnect API', version: '1.0.0', description: 'AI-assisted marketplace APIs for artisans and buyers.' },
  servers: [{ url: '/api/v1' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  paths: {
    '/health': { get: { summary: 'Health check', responses: { 200: { description: 'Healthy' } } } },
    '/auth/register': { post: { summary: 'Register artisan or buyer', requestBody: { required: true }, responses: { 201: { description: 'Registered' }, 422: { description: 'Validation error' } } } },
    '/auth/login': { post: { summary: 'Login', requestBody: { required: true }, responses: { 200: { description: 'Authenticated' } } } },
    '/auth/refresh': { post: { summary: 'Refresh access token', responses: { 200: { description: 'Token refreshed' } } } },
    '/auth/verify-email': { post: { summary: 'Verify an email token', responses: { 200: { description: 'Verified' } } } },
    '/auth/request-password-reset': { post: { summary: 'Request password reset', responses: { 200: { description: 'Reset requested' } } } },
    '/auth/reset-password': { post: { summary: 'Reset password', responses: { 200: { description: 'Password reset' } } } },
    '/users/me': { patch: { summary: 'Update current profile', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Updated' } } } },
    '/products': { get: { summary: 'Browse and filter published products' }, post: { summary: 'Create product', security: [{ bearerAuth: [] }] } },
    '/products/{id}': { get: { summary: 'Get product details' }, put: { summary: 'Update product', security: [{ bearerAuth: [] }] }, delete: { summary: 'Archive product', security: [{ bearerAuth: [] }] } },
    '/products/{id}/publish': { patch: { summary: 'Submit or publish product', security: [{ bearerAuth: [] }] } },
    '/products/{id}/moderate': { patch: { summary: 'Admin product moderation', security: [{ bearerAuth: [] }] } },
    '/search/products': { get: { summary: 'Full-text product search' } },
    '/categories': { get: { summary: 'List categories' }, post: { summary: 'Create category', security: [{ bearerAuth: [] }] } },
    '/wishlist': { get: { summary: 'Get wishlist', security: [{ bearerAuth: [] }] } },
    '/wishlist/{productId}': { post: { summary: 'Add wishlist item', security: [{ bearerAuth: [] }] }, delete: { summary: 'Remove wishlist item', security: [{ bearerAuth: [] }] } },
    '/orders': { get: { summary: 'List orders', security: [{ bearerAuth: [] }] }, post: { summary: 'Create order with server-calculated totals', security: [{ bearerAuth: [] }] } },
    '/orders/{id}': { get: { summary: 'Get order', security: [{ bearerAuth: [] }] } },
    '/orders/{id}/status': { patch: { summary: 'Update order status', security: [{ bearerAuth: [] }] } },
    '/recommendations': { get: { summary: 'Get personalized or popular recommendations' } },
    '/artisan/dashboard': { get: { summary: 'Artisan dashboard', security: [{ bearerAuth: [] }] } },
    '/artisan/analytics': { get: { summary: 'Artisan analytics', security: [{ bearerAuth: [] }] } },
    '/artisan/orders': { get: { summary: 'Artisan order view', security: [{ bearerAuth: [] }] } },
    '/ai/catalog': { post: { summary: 'Analyze product image and generate editable catalog draft', security: [{ bearerAuth: [] }] } },
    '/ai/generate-description': { post: { summary: 'Generate multilingual descriptions', security: [{ bearerAuth: [] }] } },
    '/ai/generate-tags': { post: { summary: 'Generate product tags', security: [{ bearerAuth: [] }] } },
    '/ai/price-suggestion': { post: { summary: 'Generate advisory price suggestion', security: [{ bearerAuth: [] }] } },
    '/ai/market-assistant': { post: { summary: 'Answer using artisan platform data', security: [{ bearerAuth: [] }] } },
    '/uploads/product-image': { post: { summary: 'Upload JPG, PNG, or WebP product image', security: [{ bearerAuth: [] }] } },
    '/notifications': { get: { summary: 'List notifications', security: [{ bearerAuth: [] }] } },
    '/payments/create-order': { post: { summary: 'Create payment provider order placeholder', security: [{ bearerAuth: [] }] } },
    '/payments/verify': { post: { summary: 'Verify payment with provider', security: [{ bearerAuth: [] }] } }
  }
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(notFound); app.use(errorHandler);
module.exports = app;
