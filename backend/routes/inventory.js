const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { Inventory, sequelize } = require('../models');
const router = express.Router();

// Get all inventory with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 200, 
      category, 
      isActive, 
      search,
      lowStock,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = {};

    if (category) {
      whereClause.category = category;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    // Build conditions array for complex queries
    const conditions = [];

    if (search) {
      conditions.push({
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { supplier: { [Op.like]: `%${search}%` } }
        ]
      });
    }

    if (lowStock === 'true') {
      conditions.push({
        [Op.and]: [
          sequelize.literal('currentStock <= minimumStock'),
          { alertEnabled: true }
        ]
      });
    }

    // If we have complex conditions, use them; otherwise use simple whereClause
    const finalWhere = conditions.length > 0 ? { [Op.and]: conditions } : whereClause;

    const { count, rows: inventory } = await Inventory.findAndCountAll({
      where: finalWhere,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        inventory,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
});

// Get inventory by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findByPk(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory item',
      error: error.message
    });
  }
});

// Create new inventory item
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('category').isIn([
    'furniture', 'kitchen_equipment', 'food_supplies', 'cleaning_supplies', 
    'utensils', 'electronics', 'decorations', 'maintenance', 'other'
  ]).withMessage('Invalid category'),
  body('currentStock').isInt({ min: 0 }).withMessage('Current stock must be non-negative'),
  body('minimumStock').isInt({ min: 0 }).withMessage('Minimum stock must be non-negative'),
  body('maximumStock').optional().isInt({ min: 0 }).withMessage('Maximum stock must be non-negative'),
  body('unit').optional().isLength({ min: 1, max: 20 }).withMessage('Unit must be 1-20 characters'),
  body('unitPrice').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Valid unit price required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const inventoryData = req.body;
    const item = await Inventory.create(inventoryData);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: item
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inventory item',
      error: error.message
    });
  }
});

// Update inventory item
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('category').optional().isIn([
    'furniture', 'kitchen_equipment', 'food_supplies', 'cleaning_supplies', 
    'utensils', 'electronics', 'decorations', 'maintenance', 'other'
  ]).withMessage('Invalid category'),
  body('currentStock').optional().isInt({ min: 0 }).withMessage('Current stock must be non-negative'),
  body('minimumStock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be non-negative'),
  body('maximumStock').optional().isInt({ min: 0 }).withMessage('Maximum stock must be non-negative'),
  body('unit').optional().isLength({ min: 1, max: 20 }).withMessage('Unit must be 1-20 characters'),
  body('unitPrice').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Valid unit price required')
], async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    await item.update(req.body);

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory item',
      error: error.message
    });
  }
});

// Update stock levels
router.patch('/:id/stock', [
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('operation').isIn(['add', 'subtract', 'set']).withMessage('Operation must be add, subtract, or set')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    let newStock = item.currentStock;
    switch (operation) {
      case 'add':
        newStock += quantity;
        break;
      case 'subtract':
        newStock -= quantity;
        if (newStock < 0) newStock = 0;
        break;
      case 'set':
        newStock = quantity;
        break;
    }

    await item.update({ 
      currentStock: newStock,
      lastRestocked: new Date()
    });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
});

// Delete inventory item (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findByPk(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    await item.update({ isActive: false });

    res.json({
      success: true,
      message: 'Inventory item deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate inventory item',
      error: error.message
    });
  }
});

// Get low stock alerts
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const lowStockItems = await Inventory.findAll({
      where: {
        [Op.and]: [
          sequelize.literal('currentStock <= minimumStock'),
          { alertEnabled: true },
          { isActive: true }
        ]
      },
      order: [['currentStock', 'ASC']]
    });

    res.json({
      success: true,
      data: lowStockItems,
      count: lowStockItems.length
    });
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock alerts',
      error: error.message
    });
  }
});

// Get inventory statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalItems = await Inventory.count();
    const activeItems = await Inventory.count({ where: { isActive: true } });
    
    const categoryStats = await Inventory.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('currentStock')), 'totalStock']
      ],
      where: { isActive: true },
      group: ['category'],
      raw: true
    });

    const lowStockCount = await Inventory.count({
      where: {
        [Op.and]: [
          sequelize.literal('currentStock <= minimumStock'),
          { alertEnabled: true },
          { isActive: true }
        ]
      }
    });

    const totalValue = await Inventory.findAll({
      attributes: [
        [sequelize.fn('SUM', 
          sequelize.literal('currentStock * unitPrice')
        ), 'totalValue']
      ],
      where: { 
        isActive: true,
        unitPrice: { [Op.ne]: null }
      },
      raw: true
    });

    res.json({
      success: true,
      data: {
        totalItems,
        activeItems,
        inactiveItems: totalItems - activeItems,
        lowStockCount,
        categoryStats,
        totalValue: totalValue[0]?.totalValue || 0
      }
    });
  } catch (error) {
    console.error('Error fetching inventory statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory statistics',
      error: error.message
    });
  }
});

// Update inventory item
router.patch('/:id', [
  body('currentStock').optional().isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer'),
  body('minimumStock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('supplier').optional().isString().withMessage('Supplier must be a string'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const inventoryItem = await Inventory.findByPk(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Update the item
    await inventoryItem.update(updateData);

    res.json({ 
      success: true, 
      message: 'Inventory item updated successfully',
      data: inventoryItem 
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ message: 'Failed to update inventory item', error: error.message });
  }
});

module.exports = router;
