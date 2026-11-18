const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const {
  getCart,
  syncCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} = require('../controllers/cart.controller');

const router = Router();

router.get('/', requireAuth, getCart);
router.post('/sync', requireAuth, syncCart);
router.post('/item', requireAuth, addItem);
router.put('/item/:id', requireAuth, updateItem);
router.delete('/item/:id', requireAuth, removeItem);
router.delete('/clear', requireAuth, clearCart);

module.exports = router;
