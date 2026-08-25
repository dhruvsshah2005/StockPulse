class InventoryAgent {
  constructor() {
    this.name = 'InventoryAgent';
    this.role = 'Stock Burn Rate & Replenishment Specialist';
  }

  async evaluate(product, context = {}) {
    const { triggerReason = 'MANUAL' } = context;

    const targetStock = product.reorderThreshold * 3;
    const recQty = Math.max(1, targetStock - product.stockLevel);
    const confidence = 0.92;
    const reasoning = `Replenishment analysis: Stock level is at ${product.stockLevel} units (Reorder Threshold: ${product.reorderThreshold}). Recommending purchase order of ${recQty} units to restore safety buffer.`;

    return {
      productId: product._id,
      currentStock: product.stockLevel,
      recommendedQuantity: recQty,
      suggestedLeadTimeDays: 7,
      confidence,
      reasoning,
      status: 'PENDING',
      triggerReason
    };
  }
}

module.exports = new InventoryAgent();
