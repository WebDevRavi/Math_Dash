export type DifficultyMode = 'EASY' | 'NORMAL' | 'HARD' | 'VERY_HARD';

export interface DifficultySettings {
  name: string;
  cyberLabel: string;
  operations: ('+' | '-' | '×' | '÷')[];
  operandRangeA: [number, number];
  operandRangeB: [number, number];
  timeLimitSec: number;
  wrongPenaltySec: number;
  fastThresholdMs: number;
  fastStreakForBonus: number;
}

export const DIFFICULTY_PRESETS: Record<DifficultyMode, DifficultySettings> = {
  EASY: {
    name: 'Proxy',
    cyberLabel: 'PROXY',
    operations: ['+', '-'],
    operandRangeA: [5, 25],
    operandRangeB: [3, 18],
    timeLimitSec: 45,
    wrongPenaltySec: 2,
    fastThresholdMs: 1600,
    fastStreakForBonus: 3
  },
  NORMAL: {
    name: 'Firewall',
    cyberLabel: 'FIREWALL',
    operations: ['+', '-', '×', '÷'],
    operandRangeA: [12, 55],
    operandRangeB: [6, 35],
    timeLimitSec: 40,
    wrongPenaltySec: 2,
    fastThresholdMs: 1400,
    fastStreakForBonus: 3
  },
  HARD: {
    name: 'Mainframe',
    cyberLabel: 'MAINFRAME',
    operations: ['+', '-', '×', '÷'],
    operandRangeA: [18, 95],
    operandRangeB: [8, 55],
    timeLimitSec: 30,
    wrongPenaltySec: 3,
    fastThresholdMs: 1200,
    fastStreakForBonus: 4
  },
  VERY_HARD: {
    name: 'Black ICE',
    cyberLabel: 'BLACK ICE',
    operations: ['+', '-', '×', '÷'],
    operandRangeA: [25, 140],
    operandRangeB: [12, 85],
    timeLimitSec: 25,
    wrongPenaltySec: 3,
    fastThresholdMs: 1000,
    fastStreakForBonus: 4
  }
};

export class LevelProgression {
  /**
   * Steeper and faster sector progression:
   * Reaches Sector 2 at 6 points, Sector 3 at 14 points, up to Sector 10+
   */
  public static getLevelForScore(score: number): number {
    if (score < 6) return 1;
    if (score < 14) return 2;
    if (score < 24) return 3;
    if (score < 36) return 4;
    if (score < 50) return 5;
    if (score < 66) return 6;
    if (score < 84) return 7;
    if (score < 105) return 8;
    if (score < 130) return 9;
    return Math.min(20, 10 + Math.floor((score - 130) / 25));
  }
}
