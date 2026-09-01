import { GAME_CONFIG } from './config.ts';

export class StreakManager {
  private currentStreak: number = 0;
  private bestStreak: number = 0;
  private fastCorrectStreak: number = 0;
  private timeBonusCharges: number = 0;
  private lastQuestionStartTime: number = 0;

  public reset(): void {
    this.currentStreak = 0;
    this.fastCorrectStreak = 0;
    this.timeBonusCharges = 0;
    this.lastQuestionStartTime = performance.now();
  }

  public onNewQuestion(): void {
    this.lastQuestionStartTime = performance.now();
  }

  public recordCorrectAnswer(): { isFast: boolean; bonusReady: boolean; streak: number } {
    const elapsed = performance.now() - this.lastQuestionStartTime;
    this.currentStreak++;
    if (this.currentStreak > this.bestStreak) {
      this.bestStreak = this.currentStreak;
    }

    const isFast = elapsed <= GAME_CONFIG.fastAnswerThresholdMs;
    let bonusReady = false;

    if (isFast) {
      this.fastCorrectStreak++;
      if (this.fastCorrectStreak >= GAME_CONFIG.fastAnswersForTimeBonus) {
        this.fastCorrectStreak = 0;
        this.timeBonusCharges = Math.min(3, this.timeBonusCharges + 1);
        bonusReady = true;
      }
    } else {
      this.fastCorrectStreak = 0;
    }

    return {
      isFast,
      bonusReady,
      streak: this.currentStreak
    };
  }

  public recordWrongAnswer(): void {
    this.currentStreak = 0;
    this.fastCorrectStreak = 0;
  }

  public consumeTimeBonus(): boolean {
    if (this.timeBonusCharges > 0) {
      this.timeBonusCharges--;
      return true;
    }
    return false;
  }

  public getStreak(): number {
    return this.currentStreak;
  }

  public getBestStreak(): number {
    return this.bestStreak;
  }

  public getTimeBonusCharges(): number {
    return this.timeBonusCharges;
  }

  public isBonusReady(): boolean {
    return this.timeBonusCharges > 0;
  }

  public getFastStreakProgress(): number {
    return this.fastCorrectStreak;
  }
}
