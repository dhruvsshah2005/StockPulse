const mongoose = require('mongoose');
const memoryDb = require('../config/memoryDb');

const ReorderSuggestionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    currentStock: { type: Number, required: true },
    recommendedQuantity: { type: Number, required: true },
    suggestedLeadTimeDays: { type: Number, default: 7 },
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

const MongooseReorderSuggestion = mongoose.model('ReorderSuggestion', ReorderSuggestionSchema);

const ReorderSuggestionProxy = new Proxy(MongooseReorderSuggestion, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return memoryDb.ReorderSuggestion[prop];
  },
  construct(target, args) {
    if (mongoose.connection.readyState === 1) {
      return new target(...args);
    }
    const data = args[0] || {};
    return {
      ...data,
      save: async function() {
        return memoryDb.ReorderSuggestion.create(this);
      }
    };
  }
});

module.exports = ReorderSuggestionProxy;
