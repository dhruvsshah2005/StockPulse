class PricingAgent {
  constructor() {
    this.name = 'PricingAgent';
    this.role = 'Dynamic Price & Demand Elasticity Specialist';
  }

  async evaluate(product, context = {}) {
    const { categoryAvgVelocity = 1, triggerReason = 'MANUAL' } = context;

    // Default rule calculation
    let recPrice = product.currentPrice;
    let direction = 'HOLD';
    let confidence = 0.88;
    let reasoning = `Stock level (${product.stockLevel}) and demand velocity (${product.demandVelocity}) are stable. Hold current price.`;

    if (product.stockLevel < product.reorderThreshold) {
      recPrice = Number((product.currentPrice * 1.10).toFixed(2));
      direction = 'INCREASE';
      confidence = 0.90;
      reasoning = `Low inventory alert: Stock (${product.stockLevel}) is below threshold (${product.reorderThreshold}). Recommending 10% price surge to optimize revenue and slow stockout velocity.`;
    } else if (categoryAvgVelocity > 0 && product.demandVelocity > 2 * categoryAvgVelocity) {
      recPrice = Number((product.currentPrice * 1.05).toFixed(2));
      direction = 'INCREASE';
      confidence = 0.85;
      reasoning = `Demand spike alert: Velocity (${product.demandVelocity}/24h) is >2x category peer average (${categoryAvgVelocity.toFixed(1)}/24h). Recommending 5% price adjustment.`;
    }

    return {
      productId: product._id,
      currentPrice: product.currentPrice,
      recommendedPrice: recPrice,
      direction,
      confidence,
      reasoning,
      status: 'PENDING',
      triggerReason
    };
  }
}

module.exports = new PricingAgent();
