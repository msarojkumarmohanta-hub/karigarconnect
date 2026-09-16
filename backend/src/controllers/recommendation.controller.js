const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');
const { success } = require('../utils/response');

async function list(req, res, next) {
  try {
    const wishlist = req.user ? await Wishlist.findOne({ userId: req.user._id }).populate('products', 'tags categoryId').lean() : null;
    const tags = [...new Set((wishlist?.products || []).flatMap((product) => product.tags || []))];
    const filter = { status: 'published', ...(tags.length ? { tags: { $in: tags } } : {}) };
    const products = await Product.find(filter).sort({ likes: -1, views: -1, createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 12, 50)).lean();
    return success(res, products.map((product) => ({
      productId: product._id,
      score: tags.length && product.tags?.some((tag) => tags.includes(tag)) ? 0.94 : 0.65,
      reason: tags.length ? 'Matches your wishlist interests' : 'Popular with marketplace visitors',
      product
    })), 'Recommendations fetched successfully');
  } catch (error) { next(error); }
}

module.exports = { list };
