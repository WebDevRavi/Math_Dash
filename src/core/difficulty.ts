export type DifficultyMode = 'EASY' | 'NORMAL' | 'HARD' | 'VERY_HARD';

export interface DifficultySettings {
  name: string;
  operations: ('+' | '-' | '×' | '÷')[];
  operandRangeA: [number, number];
  operandRangeB: [number, number];
  timeLimitSec: number;
}

export const DIFFICULTY_PRESETS: Record<DifficultyMode, DifficultySettings> = {
  EASY: {
    name: 'Easy',
    operations: ['+', '-'],
    operandRangeA: [1, 12],
    operandRangeB: [1, 10],
    timeLimitSec: 60
  },
  NORMAL: {
    name: 'Normal',
    operations: ['+', '-', '×', '÷'],
    operandRangeA: [2, 20],
    operandRangeB: [2, 12],
    timeLimitSec: 60
  },
  HARD: {
    name: 'Hard',
    operations: ['+', '-', '×', '÷'],
    operandRangeA: [5, 45],
    operandRangeB: [3, 20],
    timeLimitSec: 60
  },
  VERY_HARD: {
    name: 'Very Hard',
    operations: ['+', '-', '×', '÷'],
    operandRangeA: [10, 80],
    operandRangeB: [4, 30],
    timeLimitSec: 45
  }
};

export class LevelProgression {
  public static getLevelForScore(score: number): number {
    if (score < 8) return 1;
    if (score < 18) return 2;
    if (score < 30) return 3;
    if (score < 45) return 4;
    if (score < 65) return 5;
    return Math.min(10, 5 + Math.floor((score - 65) / 20));
  }
}
