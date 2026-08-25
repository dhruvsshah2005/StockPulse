const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const PricingSuggestion = require('../models/PricingSuggestion');
const ReorderSuggestion = require('../models/ReorderSuggestion');
const { evaluateTriggersAsync, getCategoryAvgVelocity } = require('../services/triggerService');
const advisorFactory = require('../services/advisorFactory');

// POST /products - Create product
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /products?status=&category= - List filterable products
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const products = await Product.find(filter).sort({ sku: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /products/:id/stock - Update stock level
router.patch('/:id/stock', async (req, res) => {
  try {
    const { stockLevel } = req.body;
    if (typeof stockLevel !== 'number' || stockLevel < 0) {
      return res.status(400).json({ error: 'stockLevel must be a non-negative number' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const oldStock = product.stockLevel;
    product.stockLevel = stockLevel;
    if (stockLevel === 0) {
      product.status = 'OUT_OF_STOCK';
    } else if (product.status === 'OUT_OF_STOCK') {
      product.status = 'ACTIVE';
    }
    await product.save();

    // Log Activity Event
    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.create({
      type: 'STOCK_UPDATED',
      title: 'Manual Stock Level Updated',
      details: `${product.name} stock level changed from ${oldStock} to ${stockLevel} units.`,
      productName: product.name,
      productSku: product.sku,
      badge: 'INFO'
    });

    // Trigger Agentic Recommendation Loop asynchronously
    evaluateTriggersAsync(product._id);

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /products/:id/orders - Simulate sale
router.post('/:id/orders', async (req, res) => {
  try {
    const qty = Math.max(1, parseInt(req.body.quantity || 1, 10));

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.stockLevel < qty) {
      return res.status(400).json({ error: `Insufficient stock. Current stock: ${product.stockLevel}` });
    }

    product.stockLevel -= qty;
    product.demandVelocity += qty;

    if (product.stockLevel === 0) {
      product.status = 'OUT_OF_STOCK';
    }
    await product.save();

    // Log Activity Event
    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.create({
      type: 'SALE_SIMULATED',
      title: `Simulated Sale (${qty} units)`,
      details: `Order placed for ${product.name}. Stock: ${product.stockLevel} units remaining | Demand Velocity: ${product.demandVelocity}/24h`,
      productName: product.name,
      productSku: product.sku,
      badge: 'INFO'
    });

    // Trigger Agentic Recommendation Loop asynchronously
    evaluateTriggersAsync(product._id);

    res.json({
      message: `Simulated order of ${qty} units successfully`,
      product
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /products/:id/suggest-pricing - Manual on-demand pricing suggestion
router.post('/:id/suggest-pricing', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const categoryAvgVelocity = await getCategoryAvgVelocity(product.category);
    const activeAdvisor = advisorFactory.getStrategy();
    const { pricing } = await activeAdvisor.generateRecommendations(product, {
      categoryAvgVelocity,
      triggerReason: 'MANUAL'
    });

    const suggestion = await PricingSuggestion.create(pricing);

    if (product.status === 'ACTIVE') {
      product.status = 'PRICE_REVIEW_PENDING';
      await product.save();
    }

    res.status(201).json(suggestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /products/:id/suggest-reorder - Manual on-demand reorder suggestion
router.post('/:id/suggest-reorder', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const categoryAvgVelocity = await getCategoryAvgVelocity(product.category);
    const activeAdvisor = advisorFactory.getStrategy();
    const { reorder } = await activeAdvisor.generateRecommendations(product, {
      categoryAvgVelocity,
      triggerReason: 'MANUAL'
    });

    const suggestion = await ReorderSuggestion.create(reorder);
    res.status(201).json(suggestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
