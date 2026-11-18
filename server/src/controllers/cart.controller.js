const prisma = require('../config/db');

async function getCart(req, res, next) {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
    });
    return res.json(items);
  } catch (err) {
    next(err);
  }
}

async function syncCart(req, res, next) {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items must be an array' });
    }

    // Build a set of incoming keys
    const incomingKeys = new Set(
      items.map((i) => `${i.productId}__${i.weight}`)
    );

    // Delete items not in the incoming payload
    const existing = await prisma.cartItem.findMany({ where: { userId } });
    const toDelete = existing
      .filter((i) => !incomingKeys.has(`${i.productId}__${i.weight}`))
      .map((i) => i.id);

    if (toDelete.length > 0) {
      await prisma.cartItem.deleteMany({ where: { id: { in: toDelete } } });
    }

    // Upsert each incoming item
    for (const item of items) {
      const { productId, weight = '240g', quantity = 1 } = item;
      await prisma.cartItem.upsert({
        where: { userId_productId_weight: { userId, productId, weight } },
        update: { quantity },
        create: { userId, productId, weight, quantity },
      });
    }

    const updated = await prisma.cartItem.findMany({ where: { userId } });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const { productId, weight = '240g', quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const item = await prisma.cartItem.upsert({
      where: { userId_productId_weight: { userId, productId, weight } },
      update: { quantity: { increment: quantity } },
      create: { userId, productId, weight, quantity },
    });

    return res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const item = await prisma.cartItem.findFirst({ where: { id, userId } });
    if (!item) return res.status(404).json({ error: 'Cart item not found' });

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id } });
      return res.json({ deleted: true });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const item = await prisma.cartItem.findFirst({ where: { id, userId } });
    if (!item) return res.status(404).json({ error: 'Cart item not found' });

    await prisma.cartItem.delete({ where: { id } });
    return res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    return res.json({ cleared: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, syncCart, addItem, updateItem, removeItem, clearCart };
