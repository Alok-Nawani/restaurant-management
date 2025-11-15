const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Order, OrderItem, MenuItem, Customer } = require('../models');

// create order with items
router.post('/', [
  body('tableNumber').notEmpty().withMessage('Table number is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.menuItemId').isInt().withMessage('Valid menu item ID is required'),
  body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerId, tableNumber, items } = req.body;
    
    // Validate customer exists if provided
    if (customerId) {
      const customer = await Customer.findByPk(customerId);
      if (!customer) {
        return res.status(400).json({ message: 'Customer not found' });
      }
    }

    const order = await Order.create({ 
      customerId: customerId || null, 
      tableNumber, 
      status: 'PENDING' 
    });
    
    let total = 0;
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item with ID ${item.menuItemId} not found` });
      }
      
      const price = menuItem.price * item.qty;
      total += price;
      await OrderItem.create({ 
        orderId: order.id, 
        menuItemId: item.menuItemId, 
        quantity: item.qty, 
        price: menuItem.price 
      });
    }
    
    order.total = total;
    await order.save();
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = status ? { status } : {};
    
    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          required: false
        },
        {
          model: OrderItem,
          include: [
            {
              model: MenuItem
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      orders: orders.rows,
      total: orders.count,
      page: parseInt(page),
      pages: Math.ceil(orders.count / limit)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate status transition
    const validTransitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['PREPARING', 'CANCELLED'],
      'PREPARING': ['READY', 'CANCELLED'],
      'READY': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': ['PAID'],
      'PAID': [],
      'CANCELLED': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        message: `Cannot change status from ${order.status} to ${status}`,
        validTransitions: validTransitions[order.status]
      });
    }

    order.status = status;
    await order.save();

    res.json({ 
      success: true, 
      message: `Order status updated to ${status}`,
      order 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { model: Customer, attributes: ['id', 'name', 'email', 'phone'] },
        { 
          model: OrderItem, 
          include: [{ model: MenuItem, attributes: ['id', 'name', 'price', 'category'] }] 
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
});

module.exports = router;