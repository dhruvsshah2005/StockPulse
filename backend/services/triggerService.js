const Product = require('../models/Product');
const PricingSuggestion = require('../models/PricingSuggestion');
const ReorderSuggestion = require('../models/ReorderSuggestion');
const ActivityLog = require('../models/ActivityLog');
const advisorFactory = require('./advisorFactory');

/**
 * Calculates category average demand velocity.
 */
async function getCategoryAvgVelocity(category) {
  const products = await Product.find({ category });
  if (!products.length) return 1;
  const totalVelocity = products.reduce((acc, p) => acc + (p.demandVelocity || 0), 0);
  return totalVelocity / products.length;
}

/**
 * Evaluates stock and demand velocity signals and asynchronously fires recommendation triggers.
 * NON-BLOCKING: returns immediately while work processes in background.
 */
function evaluateTriggersAsync(productId) {
  setImmediate(async () => {
    try {
      const product = await Product.findById(productId);
      if (!product) return;

      const categoryAvgVelocity = await getCategoryAvgVelocity(product.category);

      // --- Trigger A: INVENTORY_LOW ---
      if (product.stockLevel < product.reorderThreshold) {
        await processTrigger(product, 'INVENTORY_LOW', categoryAvgVelocity);
      }

      // --- Trigger B: DEMAND_SPIKE (demandVelocity > 3x category average) ---
      if (categoryAvgVelocity > 0 && product.demandVelocity > 3 * categoryAvgVelocity) {
        await processTrigger(product, 'DEMAND_SPIKE', categoryAvgVelocity);
      }
    } catch (err) {
      console.error(`[AgenticLoop Error] Failed evaluating triggers for ${productId}: ${err.message}`);
    }
  });
}

/**
 * Generates pricing and reorder suggestions for a specific trigger with deduplication.
 */
async function processTrigger(product, triggerReason, categoryAvgVelocity) {
  // Deduplication check
  const existingPricing = await PricingSuggestion.findOne({
    productId: product._id,
    triggerReason,
    status: 'PENDING'
  });

  const existingReorder = await ReorderSuggestion.findOne({
    productId: product._id,
    triggerReason,
    status: 'PENDING'
  });

  if (existingPricing && existingReorder) {
    console.log(`[AgenticLoop] Deduplicated: PENDING suggestions already exist for ${product.name} [${triggerReason}]`);
    return;
  }

  console.log(`[AgenticLoop] Trigger Fired! Product: ${product.name} | Signal: ${triggerReason}`);

  // Log Signal Detection Event
  await ActivityLog.create({
    type: triggerReason === 'INVENTORY_LOW' ? 'INVENTORY_LOW_TRIGGER' : 'DEMAND_SPIKE_TRIGGER',
    title: `Agentic Signal Fired: ${triggerReason}`,
    details: triggerReason === 'INVENTORY_LOW'
      ? `${product.name} stock level (${product.stockLevel}) dropped below reorder threshold (${product.reorderThreshold}).`
      : `${product.name} demand velocity (${product.demandVelocity}/24h) crossed 3x category average (${categoryAvgVelocity.toFixed(1)}/24h).`,
    productName: product.name,
    productSku: product.sku,
    badge: triggerReason === 'INVENTORY_LOW' ? 'WARNING' : 'PURPLE'
  });

  const activeAdvisor = advisorFactory.getStrategy();
  const context = { categoryAvgVelocity, triggerReason };
  const { pricing, reorder } = await activeAdvisor.generateRecommendations(product, context);

  let createdPricing = null;
  let createdReorder = null;

  if (!existingPricing) {
    createdPricing = await PricingSuggestion.create(pricing);
  }

  if (!existingReorder) {
    createdReorder = await ReorderSuggestion.create(reorder);
  }

  // Log AI Recommendation Queued Event
  await ActivityLog.create({
    type: 'AI_RECOMMENDATION_QUEUED',
    title: `AI Recommendation Queued (${activeAdvisor.constructor.name})`,
    details: `Suggested Price: $${pricing.recommendedPrice.toFixed(2)} (${pricing.direction}) | Suggested Reorder: +${reorder.recommendedQuantity} units`,
    productName: product.name,
    productSku: product.sku,
    badge: 'PURPLE'
  });

  // Update product status to PRICE_REVIEW_PENDING if active
  if (product.status === 'ACTIVE') {
    product.status = 'PRICE_REVIEW_PENDING';
    await product.save();
  }

  console.log(`[AgenticLoop] Suggestions queued for ${product.name}: Pricing #${createdPricing?._id || 'skipped'}, Reorder #${createdReorder?._id || 'skipped'}`);
}

module.exports = {
  evaluateTriggersAsync,
  getCategoryAvgVelocity
};
