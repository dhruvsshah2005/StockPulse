const mongoose = require('mongoose');
const memoryDb = require('../config/memoryDb');

// Ensure MemoryCollection supports User if memory fallback is active
if (memoryDb && !memoryDb.User) {
  const { v4: uuidv4 } = require('crypto');
  memoryDb.User = new (memoryDb.Product.constructor)('User');
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Admin Merchandiser' },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'MERCHANDISER'], default: 'ADMIN' }
  },
  { timestamps: true }
);

const MongooseUser = mongoose.model('User', UserSchema);

const UserProxy = new Proxy(MongooseUser, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return memoryDb.User[prop];
  },
  construct(target, args) {
    if (mongoose.connection.readyState === 1) {
      return new target(...args);
    }
    const data = args[0] || {};
    return {
      ...data,
      save: async function() {
        return memoryDb.User.create(this);
      }
    };
  }
});

module.exports = UserProxy;
