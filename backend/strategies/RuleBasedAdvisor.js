const CommerceAdvisor = require('./CommerceAdvisor');

class RuleBasedAdvisor extends CommerceAdvisor {
  async generateRecommendations(product, context = {}) {
    const { categoryAvgVelocity = 1, triggerReason = 'MANUAL' } = context;

    // --- PRICING RECOMMENDATION ---
    let recPrice = product.currentPrice;
    let direction = 'HOLD';
    let priceConfidence = 0.90;
    let priceReasoning = `Stock level (${product.stockLevel}) and demand velocity (${product.demandVelocity}) are stable. Hold current price.`;

    if (product.stockLevel < product.reorderThreshold) {
      recPrice = Number((product.currentPrice * 1.10).toFixed(2));
      direction = 'INCREASE';
      priceConfidence = 0.85;
      priceReasoning = `Low stock alert: Stock (${product.stockLevel}) is below threshold (${product.reorderThreshold}). Recommending 10% price increase to optimize margin and slow stockout rate.`;
    } else if (categoryAvgVelocity > 0 && product.demandVelocity > 2 * categoryAvgVelocity) {
      recPrice = Number((product.currentPrice * 1.05).toFixed(2));
      direction = 'INCREASE';
      priceConfidence = 0.80;
      priceReasoning = `Demand spike alert: Demand velocity (${product.demandVelocity}/24h) is >2x category average (${categoryAvgVelocity.toFixed(1)}/24h). Recommending 5% price surge adjustment.`;
    }

    const pricing = {
      productId: product._id,
      currentPrice: product.currentPrice,
      recommendedPrice: recPrice,
      direction,
      confidence: priceConfidence,
      reasoning: priceReasoning,
      status: 'PENDING',
      triggerReason
    };

    // --- REORDER RECOMMENDATION ---
    const targetStock = product.reorderThreshold * 3;
    const recQty = Math.max(1, targetStock - product.stockLevel);
    const reorderConfidence = 0.85;
    const reorderReasoning = `Rule-based reorder: Stock is at ${product.stockLevel} (Threshold: ${product.reorderThreshold}). Recommending ${recQty} units to restore buffer to ${targetStock} units.`;

    const reorder = {
      productId: product._id,
      currentStock: product.stockLevel,
      recommendedQuantity: recQty,
      suggestedLeadTimeDays: 7,
      confidence: reorderConfidence,
      reasoning: reorderReasoning,
      status: 'PENDING',
      triggerReason
    };

    return { pricing, reorder };
  }
}

module.exports = RuleBasedAdvisor;
