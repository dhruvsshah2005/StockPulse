const express = require('express');
const router = express.Router();
const PricingSuggestion = require('../models/PricingSuggestion');
const ReorderSuggestion = require('../models/ReorderSuggestion');
const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');

// GET /activity-logs - List real-time audit logs
router.get('/activity-logs', async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PRICING SUGGESTIONS ---

// GET /pricing-suggestions
router.get('/pricing-suggestions', async (req, res) => {
  try {
    const filter = {};
    if (req.query.productId) filter.productId = req.query.productId;
    if (req.query.status) filter.status = req.query.status;

    const suggestions = await PricingSuggestion.find(filter)
      .populate('productId', 'name sku category currentPrice stockLevel status')
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /pricing-suggestions/:id - Accept / Reject
router.patch('/pricing-suggestions/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be ACCEPTED or REJECTED' });
    }

    const suggestion = await PricingSuggestion.findById(req.params.id);
    if (!suggestion) return res.status(404).json({ error: 'Pricing suggestion not found' });

    suggestion.status = status;
    await suggestion.save();

    const product = await Product.findById(suggestion.productId);
    const productName = product ? product.name : 'Product';
    const productSku = product ? product.sku : '';

    if (status === 'ACCEPTED' && product) {
      const oldPrice = product.currentPrice;
      product.currentPrice = suggestion.recommendedPrice;
      await product.save();

      await ActivityLog.create({
        type: 'HUMAN_CHECKPOINT_ACCEPTED',
        title: 'Human Checkpoint: Pricing Recommendation ACCEPTED',
        details: `Merchandiser approved price change for ${productName}: $${oldPrice.toFixed(2)} ➔ $${suggestion.recommendedPrice.toFixed(2)}.`,
        productName,
        productSku,
        badge: 'SUCCESS'
      });
    } else if (status === 'REJECTED') {
      await ActivityLog.create({
        type: 'HUMAN_CHECKPOINT_REJECTED',
        title: 'Human Checkpoint: Pricing Recommendation REJECTED',
        details: `Merchandiser rejected proposed price change of $${suggestion.recommendedPrice.toFixed(2)} for ${productName}.`,
        productName,
        productSku,
        badge: 'DANGER'
      });
    }

    // Update Product status if no remaining PENDING pricing suggestions
    const remainingPending = await PricingSuggestion.countDocuments({
      productId: suggestion.productId,
      status: 'PENDING'
    });

    if (remainingPending === 0 && product && product.status === 'PRICE_REVIEW_PENDING' && product.stockLevel > 0) {
      product.status = 'ACTIVE';
      await product.save();
    }

    res.json(suggestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REORDER SUGGESTIONS ---

// GET /reorder-suggestions
router.get('/reorder-suggestions', async (req, res) => {
  try {
    const filter = {};
    if (req.query.productId) filter.productId = req.query.productId;
    if (req.query.status) filter.status = req.query.status;

    const suggestions = await ReorderSuggestion.find(filter)
      .populate('productId', 'name sku category currentPrice stockLevel status')
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /reorder-suggestions/:id - Accept / Reject
router.patch('/reorder-suggestions/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be ACCEPTED or REJECTED' });
    }

    const suggestion = await ReorderSuggestion.findById(req.params.id);
    if (!suggestion) return res.status(404).json({ error: 'Reorder suggestion not found' });

    suggestion.status = status;
    await suggestion.save();

    const product = await Product.findById(suggestion.productId);
    const productName = product ? product.name : 'Product';
    const productSku = product ? product.sku : '';

    if (status === 'ACCEPTED' && product) {
      const oldStock = product.stockLevel;
      product.stockLevel += suggestion.recommendedQuantity;
      if (product.stockLevel > 0 && product.status === 'OUT_OF_STOCK') {
        product.status = 'ACTIVE';
      }
      await product.save();

      await ActivityLog.create({
        type: 'HUMAN_CHECKPOINT_ACCEPTED',
        title: 'Human Checkpoint: Reorder Recommendation ACCEPTED',
        details: `Merchandiser approved inbound shipment of +${suggestion.recommendedQuantity} units for ${productName}. Stock restored from ${oldStock} to ${product.stockLevel} units.`,
        productName,
        productSku,
        badge: 'SUCCESS'
      });
    } else if (status === 'REJECTED') {
      await ActivityLog.create({
        type: 'HUMAN_CHECKPOINT_REJECTED',
        title: 'Human Checkpoint: Reorder Recommendation REJECTED',
        details: `Merchandiser rejected proposed reorder of +${suggestion.recommendedQuantity} units for ${productName}.`,
        productName,
        productSku,
        badge: 'DANGER'
      });
    }

    res.json(suggestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
