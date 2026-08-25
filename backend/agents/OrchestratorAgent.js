const pricingAgent = require('./PricingAgent');
const inventoryAgent = require('./InventoryAgent');

class OrchestratorAgent {
  constructor() {
    this.name = 'OrchestratorAgent';
    this.role = 'Multi-Agent Swarm Coordinator';
  }

  async processSwarm(product, context = {}) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY;

    if (apiKey) {
      try {
        const llmResult = await this.callLLMSwarm(product, context, apiKey);
        if (llmResult && llmResult.pricing && llmResult.reorder) {
          return llmResult;
        }
      } catch (err) {
        console.log(`[OrchestratorAgent] LLM notice: ${err.message.slice(0, 80)}... -> Delegating to PricingAgent & InventoryAgent swarm.`);
      }
    }

    // Swarm Fallback Execution (Concurrent Agent Evaluation)
    const [pricingRes, reorderRes] = await Promise.all([
      pricingAgent.evaluate(product, context),
      inventoryAgent.evaluate(product, context)
    ]);

    return {
      pricing: pricingRes,
      reorder: reorderRes
    };
  }

  async callLLMSwarm(product, context, apiKey) {
    const { categoryAvgVelocity = 1, triggerReason = 'MANUAL' } = context;
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const prompt = `
You are the OrchestratorAgent leading an E-Commerce Swarm (PricingAgent & InventoryAgent).
Analyze product context and output structured recommendations:

PRODUCT CONTEXT:
- SKU: ${product.sku}
- Name: ${product.name}
- Category: ${product.category}
- Current Price: $${product.currentPrice.toFixed(2)}
- Stock Level: ${product.stockLevel} units (Reorder Threshold: ${product.reorderThreshold})
- Demand Velocity: ${product.demandVelocity} sales/24h (Category Avg: ${categoryAvgVelocity.toFixed(1)})
- Signal Trigger: ${triggerReason}

Return ONLY raw JSON matching:
{
  "pricing": {
    "recommendedPrice": number,
    "direction": "INCREASE" | "DECREASE" | "HOLD",
    "confidence": number,
    "reasoning": "PricingAgent analysis"
  },
  "reorder": {
    "recommendedQuantity": number,
    "suggestedLeadTimeDays": number,
    "confidence": number,
    "reasoning": "InventoryAgent analysis"
  }
}
`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini API status ${res.status}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    let clean = rawText.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
    }
    const parsed = JSON.parse(clean);

    if (!parsed.pricing || !parsed.reorder) return null;

    return {
      pricing: {
        productId: product._id,
        currentPrice: product.currentPrice,
        recommendedPrice: Number(parsed.pricing.recommendedPrice.toFixed(2)),
        direction: parsed.pricing.direction || 'HOLD',
        confidence: Math.min(1, Math.max(0, Number(parsed.pricing.confidence) || 0.9)),
        reasoning: `[PricingAgent] ${parsed.pricing.reasoning}`,
        status: 'PENDING',
        triggerReason
      },
      reorder: {
        productId: product._id,
        currentStock: product.stockLevel,
        recommendedQuantity: Math.max(1, Math.round(parsed.reorder.recommendedQuantity)),
        suggestedLeadTimeDays: Math.max(1, Math.round(parsed.reorder.suggestedLeadTimeDays || 7)),
        confidence: Math.min(1, Math.max(0, Number(parsed.reorder.confidence) || 0.9)),
        reasoning: `[InventoryAgent] ${parsed.reorder.reasoning}`,
        status: 'PENDING',
        triggerReason
      }
    };
  }
}

module.exports = new OrchestratorAgent();
