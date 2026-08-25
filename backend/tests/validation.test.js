const test = require('node:test');
const assert = require('node:assert');
const RuleBasedAdvisor = require('../strategies/RuleBasedAdvisor');

test('Sanity Validation - Low stock recommendations strictly respect positive quantities & price bounds', async () => {
  const advisor = new RuleBasedAdvisor();
  const product = {
    _id: 'test_prd_bounds',
    name: 'Bounded Product',
    currentPrice: 100.00,
    stockLevel: 2,
    reorderThreshold: 10,
    demandVelocity: 5
  };

  const { pricing, reorder } = await advisor.generateRecommendations(product, { categoryAvgVelocity: 2 });

  // Recommended price must be positive and strictly within bounds [50, 250]
  assert.ok(pricing.recommendedPrice > 0, 'Price must be positive');
  assert.ok(pricing.recommendedPrice >= product.currentPrice * 0.5, 'Price must be >= 50% current');
  assert.ok(pricing.recommendedPrice <= product.currentPrice * 2.5, 'Price must be <= 250% current');

  // Reorder quantity must be positive integer
  assert.ok(Number.isInteger(reorder.recommendedQuantity), 'Reorder quantity must be an integer');
  assert.ok(reorder.recommendedQuantity >= 1, 'Reorder quantity must be at least 1');
});
