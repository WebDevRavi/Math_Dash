export const GAME_CONFIG = {
  // Round timing
  baseRoundSeconds: 60,
  countdownSeconds: 3,
  
  // Time bonus mechanics
  fastAnswerThresholdMs: 1800,
  fastAnswersForTimeBonus: 3,
  timeBonusSeconds: 5,
  maxTimerCapSeconds: 75,
  
  // Question generation memory
  maxRecentQuestions: 14,
  feedbackDurationMs: 250,
  
  // Star criteria thresholds
  starThresholds: [
    { stars: 1, minScore: 5, minAccuracy: 0 },
    { stars: 2, minScore: 15, minAccuracy: 0.6 },
    { stars: 3, minScore: 30, minAccuracy: 0.75 },
    { stars: 4, minScore: 45, minAccuracy: 0.85 },
    { stars: 5, minScore: 60, minAccuracy: 0.92 }
  ],
  
  // Storage keys
  storageKey: 'mathdash_save_data_v1',
  schemaVersion: 1
};
