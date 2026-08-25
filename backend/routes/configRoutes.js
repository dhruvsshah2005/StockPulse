const express = require('express');
const router = express.Router();
const advisorFactory = require('../services/advisorFactory');

// GET /config/strategy
router.get('/strategy', (req, res) => {
  res.json({ strategy: advisorFactory.getActiveStrategyName() });
});

// POST /config/strategy
router.post('/strategy', (req, res) => {
  const { strategy } = req.body;
  if (!strategy) {
    return res.status(400).json({ error: 'Strategy parameter required (AI or RULE)' });
  }

  const success = advisorFactory.setStrategy(strategy);
  if (!success) {
    return res.status(400).json({ error: 'Invalid strategy. Must be AI or RULE' });
  }

  res.json({ message: `Strategy switched to ${advisorFactory.getActiveStrategyName()}`, strategy: advisorFactory.getActiveStrategyName() });
});

module.exports = router;
