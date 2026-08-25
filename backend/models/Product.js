const mongoose = require('mongoose');
const memoryDb = require('../config/memoryDb');

const ProductSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['ELECTRONICS', 'APPAREL', 'HOME'],
      index: true
    },
    currentPrice: { type: Number, required: true, min: 0 },
    stockLevel: { type: Number, required: true, min: 0 },
    reorderThreshold: { type: Number, required: true, min: 0 },
    demandVelocity: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'PRICE_REVIEW_PENDING', 'OUT_OF_STOCK'],
      default: 'ACTIVE'
    },
    costPrice: { type: Number, default: null },
    supplierId: { type: String, default: null }
  },
  { timestamps: true }
);

const MongooseProduct = mongoose.model('Product', ProductSchema);

const ProductProxy = new Proxy(MongooseProduct, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return memoryDb.Product[prop];
  },
  construct(target, args) {
    if (mongoose.connection.readyState === 1) {
      return new target(...args);
    }
    const data = args[0] || {};
    return {
      ...data,
      save: async function() {
        return memoryDb.Product.create(this);
      }
    };
  }
});

module.exports = ProductProxy;
