/**
 * Common interface/base class for Commerce Advisors.
 * Defines the contract for evaluating product context and generating
 * pricing and reorder suggestions.
 */
class CommerceAdvisor {
  /**
   * @param {Object} product - Product document
   * @param {Object} context - { categoryAvgVelocity, triggerReason }
   * @returns {Promise<{ pricing: Object, reorder: Object }>}
   */
  async generateRecommendations(product, context) {
    throw new Error('generateRecommendations() must be implemented by subclass');
  }
}

module.exports = CommerceAdvisor;
