const RuleBasedAdvisor = require('../strategies/RuleBasedAdvisor');
const AIAdvisor = require('../strategies/AIAdvisor');

class AdvisorFactory {
  constructor() {
    this.ruleAdvisor = new RuleBasedAdvisor();
    this.aiAdvisor = new AIAdvisor();
    this.activeStrategyName = process.env.STRATEGY || 'AI';
  }

  setStrategy(strategyName) {
    if (['AI', 'RULE'].includes(strategyName.toUpperCase())) {
      this.activeStrategyName = strategyName.toUpperCase();
      console.log(`[AdvisorFactory] Active strategy switched to: ${this.activeStrategyName}`);
      return true;
    }
    return false;
  }

  getStrategy() {
    if (this.activeStrategyName === 'RULE') {
      return this.ruleAdvisor;
    }
    return this.aiAdvisor;
  }

  getActiveStrategyName() {
    return this.activeStrategyName;
  }
}

module.exports = new AdvisorFactory();
