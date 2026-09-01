import { GAME_CONFIG } from './config.ts';
import { DifficultyMode, DIFFICULTY_PRESETS } from './difficulty.ts';

export type MathOperator = '+' | '-' | '×' | '÷';

export interface Question {
  id: string;
  operandA: number;
  operator: MathOperator;
  operandB: number;
  equationText: string;
  correctAnswer: number;
  wrongAnswer: number;
  choices: [number, number]; // [left, right]
  correctIndex: 0 | 1;
}

export class QuestionGenerator {
  private recentQuestions: string[] = [];

  public resetHistory(): void {
    this.recentQuestions = [];
  }

  public generate(level: number = 1, mode: DifficultyMode = 'NORMAL'): Question {
    const preset = DIFFICULTY_PRESETS[mode];
    let attempts = 0;
    let question: Question | null = null;

    while (attempts < 20) {
      attempts++;
      const op = this.pickOperator(level, preset.operations);
      const generated = this.generateForOperator(op, level, preset);
      const qKey = `${generated.operandA}${generated.operator}${generated.operandB}`;

      if (!this.recentQuestions.includes(qKey) || attempts >= 18) {
        this.recentQuestions.push(qKey);
        if (this.recentQuestions.length > GAME_CONFIG.maxRecentQuestions) {
          this.recentQuestions.shift();
        }
        question = generated;
        break;
      }
    }

    return question || this.generateForOperator('+', 1, preset);
  }

  private pickOperator(level: number, allowedOps: MathOperator[]): MathOperator {
    if (allowedOps.length === 1) return allowedOps[0];
    if (level === 1) {
      // Level 1: 75% addition/subtraction, 25% multiplication if available
      const r = Math.random();
      if (r < 0.5) return '+';
      if (r < 0.85) return '-';
      return allowedOps.includes('×') ? '×' : '+';
    }
    // Levels 2+: balanced mix of allowed operators
    return allowedOps[Math.floor(Math.random() * allowedOps.length)];
  }

  private generateForOperator(
    op: MathOperator,
    level: number,
    preset: typeof DIFFICULTY_PRESETS['NORMAL']
  ): Question {
    let a = 0;
    let b = 0;
    let correct = 0;

    const levelMultiplier = 1 + (level - 1) * 0.25;
    const maxA = Math.round(preset.operandRangeA[1] * levelMultiplier);
    const minA = preset.operandRangeA[0];
    const maxB = Math.round(preset.operandRangeB[1] * levelMultiplier);
    const minB = preset.operandRangeB[0];

    switch (op) {
      case '+': {
        a = this.randomInt(minA, maxA);
        b = this.randomInt(minB, maxB);
        correct = a + b;
        break;
      }
      case '-': {
        const val1 = this.randomInt(minA, maxA);
        const val2 = this.randomInt(minB, maxB);
        a = Math.max(val1, val2);
        b = Math.min(val1, val2);
        correct = a - b;
        break;
      }
      case '×': {
        const tableMaxA = Math.min(12, Math.round(preset.operandRangeA[1] * (0.5 + level * 0.15)));
        const tableMaxB = Math.min(12, Math.round(preset.operandRangeB[1] * (0.5 + level * 0.15)));
        a = this.randomInt(2, Math.max(3, tableMaxA));
        b = this.randomInt(2, Math.max(3, tableMaxB));
        correct = a * b;
        break;
      }
      case '÷': {
        const quotient = this.randomInt(2, Math.min(12, 3 + level * 2));
        b = this.randomInt(2, Math.min(10, 3 + level));
        a = quotient * b; // ensure clean integer division
        correct = quotient;
        break;
      }
    }

    const wrong = this.generatePlausibleDistractor(correct, op, a, b);
    const isLeftCorrect = Math.random() < 0.5;
    const choices: [number, number] = isLeftCorrect ? [correct, wrong] : [wrong, correct];
    const correctIndex: 0 | 1 = isLeftCorrect ? 0 : 1;

    return {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      operandA: a,
      operator: op,
      operandB: b,
      equationText: `${a} ${op} ${b} = ?`,
      correctAnswer: correct,
      wrongAnswer: wrong,
      choices,
      correctIndex
    };
  }

  private generatePlausibleDistractor(
    correct: number,
    op: MathOperator,
    a: number,
    b: number
  ): number {
    const distractors: number[] = [];

    // Subtle mental math mistakes:
    distractors.push(correct + 1);
    distractors.push(correct - 1);
    distractors.push(correct + 2);
    distractors.push(correct - 2);

    if (op === '+') {
      distractors.push(correct + 10);
      distractors.push(correct - 10);
      distractors.push(a + b + (Math.random() > 0.5 ? 3 : -3));
    } else if (op === '-') {
      distractors.push(Math.abs(a - b + (Math.random() > 0.5 ? 2 : -2)));
      distractors.push(correct + 5);
    } else if (op === '×') {
      distractors.push(correct + a);
      distractors.push(correct - a);
      distractors.push(correct + b);
      distractors.push(correct - b);
    } else if (op === '÷') {
      distractors.push(correct + 1);
      distractors.push(correct - 1);
      distractors.push(correct + 2);
    }

    // Filter valid distractors: positive, not equal to correct answer
    const valid = distractors.filter(d => d !== correct && d >= 0 && Number.isInteger(d));
    if (valid.length > 0) {
      return valid[Math.floor(Math.random() * valid.length)];
    }

    return correct + (Math.random() > 0.5 ? 2 : -2);
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
