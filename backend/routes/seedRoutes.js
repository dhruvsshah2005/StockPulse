const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const PricingSuggestion = require('../models/PricingSuggestion');
const ReorderSuggestion = require('../models/ReorderSuggestion');

const SEED_PRODUCTS = [
  { sku: 'PRD-001', name: 'Wireless Earbuds Pro', category: 'ELECTRONICS', currentPrice: 79.99, stockLevel: 45, reorderThreshold: 20, demandVelocity: 3, status: 'ACTIVE' },
  { sku: 'PRD-002', name: 'USB-C Hub 7-Port', category: 'ELECTRONICS', currentPrice: 34.99, stockLevel: 120, reorderThreshold: 30, demandVelocity: 1, status: 'ACTIVE' },
  { sku: 'PRD-003', name: 'Organic Cotton T-Shirt', category: 'APPAREL', currentPrice: 24.99, stockLevel: 8, reorderThreshold: 15, demandVelocity: 12, status: 'PRICE_REVIEW_PENDING' },
  { sku: 'PRD-004', name: 'Running Shorts — Navy', category: 'APPAREL', currentPrice: 39.99, stockLevel: 55, reorderThreshold: 20, demandVelocity: 2, status: 'ACTIVE' },
  { sku: 'PRD-005', name: 'Ceramic Pour-Over Set', category: 'HOME', currentPrice: 49.99, stockLevel: 22, reorderThreshold: 10, demandVelocity: 4, status: 'ACTIVE' },
  { sku: 'PRD-006', name: 'LED Desk Lamp — Dimmable', category: 'HOME', currentPrice: 59.99, stockLevel: 0, reorderThreshold: 15, demandVelocity: 0, status: 'OUT_OF_STOCK' },
  { sku: 'PRD-007', name: 'Portable Charger 20K', category: 'ELECTRONICS', currentPrice: 44.99, stockLevel: 18, reorderThreshold: 25, demandVelocity: 8, status: 'ACTIVE' },
  { sku: 'PRD-008', name: 'Hoodie — Heather Grey', category: 'APPAREL', currentPrice: 54.99, stockLevel: 11, reorderThreshold: 12, demandVelocity: 15, status: 'ACTIVE' }
];

router.post('/seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    await PricingSuggestion.deleteMany({});
    await ReorderSuggestion.deleteMany({});

    const insertedProducts = await Product.insertMany(SEED_PRODUCTS);

    // Initial low-stock suggestion for PRD-003 (Cotton T-Shirt)
    const tshirt = insertedProducts.find(p => p.sku === 'PRD-003');
    if (tshirt) {
      await PricingSuggestion.create({
        productId: tshirt._id,
        currentPrice: 24.99,
        recommendedPrice: 27.49,
        direction: 'INCREASE',
        confidence: 0.88,
        reasoning: 'Stock level (8) is below threshold (15). Recommending 10% price increase to manage demand rate.',
        status: 'PENDING',
        triggerReason: 'INVENTORY_LOW'
      });

      await ReorderSuggestion.create({
        productId: tshirt._id,
        currentStock: 8,
        recommendedQuantity: 37,
        suggestedLeadTimeDays: 7,
        confidence: 0.85,
        reasoning: 'Stock level is critical (8/15). Recommending 37 units to restore target buffer of 45 units.',
        status: 'PENDING',
        triggerReason: 'INVENTORY_LOW'
      });
    }

    res.json({
      message: 'Database reset & seeded successfully',
      count: insertedProducts.length,
      products: insertedProducts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
