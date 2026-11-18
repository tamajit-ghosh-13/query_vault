const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const { createOrder, getOrders } = require('../controllers/order.controller');

const router = Router();

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getOrders);

module.exports = router;
