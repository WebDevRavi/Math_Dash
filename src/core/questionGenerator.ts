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

    while (attempts < 30) {
      attempts++;
      const op = this.pickOperator(level, preset.operations, mode);
      const generated = this.generateForOperator(op, level, preset, mode);
      const qKey = `${generated.operandA}${generated.operator}${generated.operandB}`;

      if (!this.recentQuestions.includes(qKey) || attempts >= 25) {
        this.recentQuestions.push(qKey);
        if (this.recentQuestions.length > GAME_CONFIG.maxRecentQuestions) {
          this.recentQuestions.shift();
        }
        question = generated;
        break;
      }
    }

    return question || this.generateForOperator('+', 1, preset, mode);
  }

  private pickOperator(level: number, allowedOps: MathOperator[], mode: DifficultyMode): MathOperator {
    if (allowedOps.length === 1) return allowedOps[0];

    // On HARD and VERY_HARD (Black ICE), prioritize complex multiplication & division
    if (mode === 'HARD' || mode === 'VERY_HARD') {
      const r = Math.random();
      if (r < 0.22) return '+';
      if (r < 0.44) return '-';
      if (r < 0.74) return '×';
      return '÷';
    }

    // NORMAL Mode: balanced ramp up
    if (level === 1) {
      const r = Math.random();
      if (r < 0.35) return '+';
      if (r < 0.65) return '-';
      if (r < 0.85) return allowedOps.includes('×') ? '×' : '+';
      return allowedOps.includes('÷') ? '÷' : '-';
    }

    // Level 2+: uniform mix of all allowed operators
    return allowedOps[Math.floor(Math.random() * allowedOps.length)];
  }

  private generateForOperator(
    op: MathOperator,
    level: number,
    preset: typeof DIFFICULTY_PRESETS['NORMAL'],
    mode: DifficultyMode = 'NORMAL'
  ): Question {
    let a = 0;
    let b = 0;
    let correct = 0;

    // Sector scaling multiplier (steeper scaling for higher sectors)
    const levelMultiplier = 1 + (level - 1) * 0.28;
    const maxA = Math.round(preset.operandRangeA[1] * levelMultiplier);
    const minA = Math.round(preset.operandRangeA[0] * (1 + (level - 1) * 0.15));
    const maxB = Math.round(preset.operandRangeB[1] * levelMultiplier);
    const minB = preset.operandRangeB[0];

    switch (op) {
      case '+': {
        a = this.randomInt(minA, maxA);
        b = this.randomInt(minB, maxB);
        // On HARD and VERY_HARD, ensure numbers require carrying
        if ((mode === 'HARD' || mode === 'VERY_HARD') && (a % 10) + (b % 10) < 10) {
          b += (10 - ((a % 10) + (b % 10)));
        }
        correct = a + b;
        break;
      }
      case '-': {
        const val1 = this.randomInt(minA, maxA);
        const val2 = this.randomInt(minB, maxB);
        a = Math.max(val1, val2);
        b = Math.min(val1, val2);

        // Ensure non-trivial subtraction: avoid a - a = 0
        if (a === b) {
          a += this.randomInt(2, 12);
        }
        // On HARD and VERY_HARD, ensure subtraction requires borrowing
        if ((mode === 'HARD' || mode === 'VERY_HARD') && (a % 10) >= (b % 10) && a > b) {
          a = Math.floor(a / 10) * 10 + Math.max(0, (b % 10) - this.randomInt(1, 4));
          while (a <= b) a += 10;
        }
        correct = a - b;
        break;
      }
      case '×': {
        let minMultA: number;
        let maxMultA: number;
        let minMultB: number;
        let maxMultB: number;

        if (mode === 'VERY_HARD') {
          minMultA = 8;
          maxMultA = Math.min(32, 16 + level * 2);
          minMultB = 5;
          maxMultB = Math.min(20, 9 + level);
        } else if (mode === 'HARD') {
          minMultA = 6;
          maxMultA = Math.min(24, 12 + Math.floor(level * 1.5));
          minMultB = 4;
          maxMultB = Math.min(16, 7 + level);
        } else {
          // NORMAL
          minMultA = 4;
          maxMultA = Math.min(15, 8 + Math.floor(level * 0.9));
          minMultB = 3;
          maxMultB = Math.min(13, 5 + Math.floor(level * 0.9));
        }

        a = this.randomInt(minMultA, maxMultA);
        b = this.randomInt(minMultB, maxMultB);
        correct = a * b;
        break;
      }
      case '÷': {
        let minQuotient: number;
        let maxQuotient: number;
        let minDivisor: number;
        let maxDivisor: number;

        if (mode === 'VERY_HARD') {
          minQuotient = 8;
          maxQuotient = Math.min(32, 12 + level * 2);
          minDivisor = 6;
          maxDivisor = Math.min(24, 8 + level);
        } else if (mode === 'HARD') {
          minQuotient = 5;
          maxQuotient = Math.min(24, 8 + Math.floor(level * 1.6));
          minDivisor = 4;
          maxDivisor = Math.min(18, 6 + level);
        } else {
          // NORMAL
          minQuotient = 3;
          maxQuotient = Math.min(16, 6 + level);
          minDivisor = 3;
          maxDivisor = Math.min(14, 4 + Math.floor(level * 0.9));
        }

        const quotient = this.randomInt(minQuotient, maxQuotient);
        b = this.randomInt(minDivisor, maxDivisor);
        a = quotient * b; // Clean integer division
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

  /**
   * Smart distractor generator:
   * Prevents parity cheating, introduces carrying/borrowing traps, and keeps distractors tight.
   */
  private generatePlausibleDistractor(
    correct: number,
    op: MathOperator,
    a: number,
    b: number
  ): number {
    const distractors: number[] = [];
    const isEven = correct % 2 === 0;

    if (op === '×') {
      // Multiplication neighbor multiples (very convincing!)
      distractors.push(correct + a);
      distractors.push(correct - a);
      distractors.push(correct + b);
      distractors.push(correct - b);
      if (a > 3 && b > 3) {
        distractors.push((a - 1) * (b + 1));
        distractors.push((a + 1) * (b - 1));
      }
      // Common table calculation errors
      distractors.push(correct + 10);
      distractors.push(correct - 10);
      distractors.push(correct + 2);
      distractors.push(correct - 2);
      distractors.push(correct + 4);
      distractors.push(correct - 4);
    } else if (op === '÷') {
      // Close quotients
      distractors.push(correct + 1);
      distractors.push(correct - 1);
      distractors.push(correct + 2);
      distractors.push(correct - 2);
      if (correct > 4) distractors.push(correct + 3);
      if (correct > 5) distractors.push(correct - 3);
    } else if (op === '+') {
      // Carrying error traps: missed carry (+10 / -10)
      distractors.push(correct - 10);
      distractors.push(correct + 10);
      // Off-by-one and off-by-two calculation traps
      distractors.push(correct + 1);
      distractors.push(correct - 1);
      distractors.push(correct + 2);
      distractors.push(correct - 2);
      // Last digit trap
      distractors.push(correct - 8);
      distractors.push(correct + 8);
    } else if (op === '-') {
      // Borrowing error traps: missed borrow (+10 / -10)
      distractors.push(correct + 10);
      distractors.push(correct - 10);
      distractors.push(correct + 1);
      distractors.push(correct - 1);
      distractors.push(correct + 2);
      distractors.push(correct - 2);
    }

    // Filter valid positive integers distinct from correct answer
    const valid = distractors.filter(d => d !== correct && d > 0 && Number.isInteger(d));

    // Prefer distractors matching parity of correct answer to prevent parity elimination
    const sameParity = valid.filter(d => (d % 2 === 0) === isEven);
    if (sameParity.length > 0 && Math.random() < 0.75) {
      return sameParity[Math.floor(Math.random() * sameParity.length)];
    }

    if (valid.length > 0) {
      return valid[Math.floor(Math.random() * valid.length)];
    }

    // Fallback safe non-zero positive distractor
    return Math.max(1, correct + (Math.random() > 0.5 ? 2 : -2));
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
