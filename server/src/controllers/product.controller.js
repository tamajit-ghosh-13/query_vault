const prisma = require('../config/db');

async function getProducts(req, res, next) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { jarMainTitle: 'asc' },
    });
    return res.json(products);
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts, getProduct };
