export const GAME_CONFIG = {
  // Title & game branding
  title: 'CYBER HACK: OVERDRIVE',
  subtitle: 'BREACH THE MAINFRAME • OVERCLOCK YOUR BRAIN',

  // Round timing
  baseRoundSeconds: 60,
  countdownSeconds: 3,
  
  // Overclock (time bonus) mechanics
  fastAnswerThresholdMs: 1500,
  fastAnswersForTimeBonus: 3,
  timeBonusSeconds: 3,
  wrongAnswerPenaltySeconds: 2,
  maxTimerCapSeconds: 70,
  
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
  storageKey: 'cyberhack_save_data_v2',
  legacyStorageKey: 'mathdash_save_data_v1',
  schemaVersion: 2
};
