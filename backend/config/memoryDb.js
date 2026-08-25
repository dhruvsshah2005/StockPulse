class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.documents = [];
  }

  generateId() {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }

  async create(data) {
    const doc = {
      _id: data._id || this.generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    doc.save = async function() {
      doc.updatedAt = new Date();
      return doc;
    };
    this.documents.push(doc);
    return doc;
  }

  async insertMany(items) {
    const created = [];
    for (const item of items) {
      created.push(await this.create(item));
    }
    return created;
  }

  find(query = {}) {
    let result = this.documents.filter(doc => this.matchesQuery(doc, query));

    const execute = () => Promise.resolve(result.map(doc => ({ ...doc })));

    const promise = execute();

    promise.sort = (sortObj) => {
      const key = Object.keys(sortObj)[0];
      const dir = sortObj[key];
      result.sort((a, b) => {
        if (a[key] < b[key]) return dir === 1 ? -1 : 1;
        if (a[key] > b[key]) return dir === 1 ? 1 : -1;
        return 0;
      });
      return promise;
    };

    promise.populate = (field) => {
      if (field === 'productId') {
        result = result.map(doc => {
          const docCopy = { ...doc };
          const memoryDb = require('./memoryDb');
          const product = memoryDb.Product.documents.find(p => String(p._id) === String(doc.productId));
          if (product) {
            docCopy.productId = {
              _id: product._id,
              name: product.name,
              sku: product.sku,
              category: product.category,
              currentPrice: product.currentPrice,
              stockLevel: product.stockLevel,
              status: product.status
            };
          }
          return docCopy;
        });
      }
      return promise;
    };

    return promise;
  }

  async findOne(query = {}) {
    const list = await this.find(query);
    return list[0] || null;
  }

  async findById(id) {
    const doc = this.documents.find(d => String(d._id) === String(id));
    if (!doc) return null;
    doc.save = async function() {
      doc.updatedAt = new Date();
      return doc;
    };
    return doc;
  }

  async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  }

  async deleteMany(query = {}) {
    if (Object.keys(query).length === 0) {
      this.documents = [];
    } else {
      this.documents = this.documents.filter(doc => !this.matchesQuery(doc, query));
    }
    return { deletedCount: this.documents.length };
  }

  matchesQuery(doc, query) {
    for (const key in query) {
      if (query[key] !== undefined && query[key] !== null) {
        const docVal = doc[key] && typeof doc[key] === 'object' && doc[key]._id ? doc[key]._id : doc[key];
        if (String(docVal) !== String(query[key])) {
          return false;
        }
      }
    }
    return true;
  }
}

const memoryDb = {
  Product: new MemoryCollection('Product'),
  PricingSuggestion: new MemoryCollection('PricingSuggestion'),
  ReorderSuggestion: new MemoryCollection('ReorderSuggestion')
};

module.exports = memoryDb;
