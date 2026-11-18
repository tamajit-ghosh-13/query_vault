const prisma = require('../config/db');

async function createOrder(req, res, next) {
  try {
    const { items, subtotal, discount, shipping, total, promoCode } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'items is required and must be an array' });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        items,
        subtotal: parseFloat(subtotal) || 0,
        discount: parseFloat(discount) || 0,
        shipping: parseFloat(shipping) || 0,
        total: parseFloat(total) || 0,
        promoCode: promoCode || null,
      },
    });

    // Clear user's cart after order placement
    await prisma.cartItem.deleteMany({ where: { userId } });

    return res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function getOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, getOrders };
