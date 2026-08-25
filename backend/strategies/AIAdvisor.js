const CommerceAdvisor = require('./CommerceAdvisor');
const orchestratorAgent = require('../agents/OrchestratorAgent');

class AIAdvisor extends CommerceAdvisor {
  async generateRecommendations(product, context = {}) {
    return orchestratorAgent.processSwarm(product, context);
  }
}

module.exports = AIAdvisor;
