import { GAME_CONFIG } from './config.ts';

export interface ScoreSummary {
  score: number;
  correctCount: number;
  wrongCount: number;
  totalAnswered: number;
  accuracyPercentage: number;
  starsEarned: number;
}

export class ScoreManager {
  private score: number = 0;
  private correctCount: number = 0;
  private wrongCount: number = 0;

  public reset(): void {
    this.score = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
  }

  public addCorrect(streak: number = 1): number {
    this.correctCount++;
    // Base +1 point
    let points = 1;
    if (streak >= 10) points = 2; // subtle rewarding multiplier
    this.score += points;
    return this.score;
  }

  public addWrong(): void {
    this.wrongCount++;
  }

  public getScore(): number {
    return this.score;
  }

  public getCorrectCount(): number {
    return this.correctCount;
  }

  public getWrongCount(): number {
    return this.wrongCount;
  }

  public getAccuracy(): number {
    const total = this.correctCount + this.wrongCount;
    if (total === 0) return 100;
    return Math.round((this.correctCount / total) * 100);
  }

  public calculateStars(): number {
    const accuracy = this.correctCount / Math.max(1, this.correctCount + this.wrongCount);
    let stars = 0;

    for (const threshold of GAME_CONFIG.starThresholds) {
      if (this.score >= threshold.minScore && accuracy >= threshold.minAccuracy) {
        stars = threshold.stars;
      }
    }

    // Give at least 1 star if they answered at least 3 correct
    if (stars === 0 && this.correctCount >= 3) {
      stars = 1;
    }

    return Math.min(5, Math.max(0, stars));
  }

  public getSummary(): ScoreSummary {
    const total = this.correctCount + this.wrongCount;
    return {
      score: this.score,
      correctCount: this.correctCount,
      wrongCount: this.wrongCount,
      totalAnswered: total,
      accuracyPercentage: this.getAccuracy(),
      starsEarned: this.calculateStars()
    };
  }
}
