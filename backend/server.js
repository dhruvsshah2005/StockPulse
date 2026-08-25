require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const seedRoutes = require('./routes/seedRoutes');
const productRoutes = require('./routes/productRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');
const configRoutes = require('./routes/configRoutes');
const authRoutes = require('./routes/authRoutes');
const rateLimiter = require('./middleware/rateLimiter');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/auth', authRoutes);
app.use('/products', authMiddleware, productRoutes);
app.use('/', suggestionRoutes);
app.use('/config', configRoutes);
app.use('/', seedRoutes);

// OpenAPI Spec Endpoint
app.get('/docs/openapi.json', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'docs', 'openapi.json'));
});

// Centralized Error Handler
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'StockPulse Engine',
    timestamp: new Date().toISOString()
  });
});

// Auto-seed if database is empty on server startup
async function autoSeedIfEmpty() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
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
      const inserted = await Product.insertMany(SEED_PRODUCTS);
      const tshirt = inserted.find(p => p.sku === 'PRD-003');
      if (tshirt) {
        const PricingSuggestion = require('./models/PricingSuggestion');
        const ReorderSuggestion = require('./models/ReorderSuggestion');
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
    }
  } catch (err) {
    // Silenced notice
  }
}

// Start Server
connectDB().then(() => {
  app.listen(PORT, async () => {
    console.log(`[StockPulse Backend] Server running on http://localhost:${PORT}`);
    // Trigger auto-seed
    await autoSeedIfEmpty();
  });
});
