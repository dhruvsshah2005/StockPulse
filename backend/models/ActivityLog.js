const mongoose = require('mongoose');
const memoryDb = require('../config/memoryDb');

if (memoryDb && !memoryDb.ActivityLog) {
  memoryDb.ActivityLog = new (memoryDb.Product.constructor)('ActivityLog');
}

const ActivityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'SALE_SIMULATED',
        'STOCK_UPDATED',
        'INVENTORY_LOW_TRIGGER',
        'DEMAND_SPIKE_TRIGGER',
        'AI_RECOMMENDATION_QUEUED',
        'HUMAN_CHECKPOINT_ACCEPTED',
        'HUMAN_CHECKPOINT_REJECTED'
      ]
    },
    title: { type: String, required: true },
    details: { type: String, required: true },
    productName: { type: String, default: null },
    productSku: { type: String, default: null },
    badge: { type: String, default: 'INFO' } // 'INFO' | 'WARNING' | 'PURPLE' | 'SUCCESS' | 'DANGER'
  },
  { timestamps: true }
);

const MongooseActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

const ActivityLogProxy = new Proxy(MongooseActivityLog, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return memoryDb.ActivityLog[prop];
  },
  construct(target, args) {
    if (mongoose.connection.readyState === 1) {
      return new target(...args);
    }
    const data = args[0] || {};
    return {
      ...data,
      save: async function() {
        return memoryDb.ActivityLog.create(this);
      }
    };
  }
});

module.exports = ActivityLogProxy;
