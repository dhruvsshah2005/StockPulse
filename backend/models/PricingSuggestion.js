const mongoose = require('mongoose');
const memoryDb = require('../config/memoryDb');

const PricingSuggestionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    currentPrice: { type: Number, required: true },
    recommendedPrice: { type: Number, required: true },
    direction: {
      type: String,
      enum: ['INCREASE', 'DECREASE', 'HOLD'],
      required: true
    },
    confidence: { type: Number, min: 0, max: 1, required: true },
    reasoning: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    triggerReason: {
      type: String,
      enum: ['INITIAL', 'INVENTORY_LOW', 'DEMAND_SPIKE', 'MANUAL'],
      required: true
    }
  },
  { timestamps: true }
);

const MongoosePricingSuggestion = mongoose.model('PricingSuggestion', PricingSuggestionSchema);

const PricingSuggestionProxy = new Proxy(MongoosePricingSuggestion, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return memoryDb.PricingSuggestion[prop];
  },
  construct(target, args) {
    if (mongoose.connection.readyState === 1) {
      return new target(...args);
    }
    const data = args[0] || {};
    return {
      ...data,
      save: async function() {
        return memoryDb.PricingSuggestion.create(this);
      }
    };
  }
});

module.exports = PricingSuggestionProxy;
