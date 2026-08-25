const test = require('node:test');
const assert = require('node:assert');
const RuleBasedAdvisor = require('../strategies/RuleBasedAdvisor');

test('RuleBasedAdvisor - Low Stock Trigger recommends +10% price increase', async () => {
  const advisor = new RuleBasedAdvisor();
  const product = {
    _id: 'test_prd_1',
    name: 'Test T-Shirt',
    currentPrice: 20.00,
    stockLevel: 5,
    reorderThreshold: 10,
    demandVelocity: 2
  };

  const { pricing, reorder } = await advisor.generateRecommendations(product, { categoryAvgVelocity: 2 });

  assert.strictEqual(pricing.direction, 'INCREASE');
  assert.strictEqual(pricing.recommendedPrice, 22.00); // 10% increase
  assert.strictEqual(reorder.recommendedQuantity, 25); // (10 * 3) - 5 = 25
});

test('RuleBasedAdvisor - Stable stock & velocity recommends HOLD', async () => {
  const advisor = new RuleBasedAdvisor();
  const product = {
    _id: 'test_prd_2',
    name: 'Test Earbuds',
    currentPrice: 50.00,
    stockLevel: 30,
    reorderThreshold: 10,
    demandVelocity: 2
  };

  const { pricing } = await advisor.generateRecommendations(product, { categoryAvgVelocity: 2 });

  assert.strictEqual(pricing.direction, 'HOLD');
  assert.strictEqual(pricing.recommendedPrice, 50.00);
});
