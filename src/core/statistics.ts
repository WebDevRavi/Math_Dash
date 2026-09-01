export interface LifetimeStats {
  gamesPlayed: number;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  bestScore: number;
  bestLevel: number;
  bestStreak: number;
  starsEarned: number;
  timeBonusesUsed: number;
}

export class StatisticsManager {
  private stats: LifetimeStats;

  constructor(initialData?: Partial<LifetimeStats>) {
    this.stats = {
      gamesPlayed: initialData?.gamesPlayed || 0,
      questionsAnswered: initialData?.questionsAnswered || 0,
      correctAnswers: initialData?.correctAnswers || 0,
      wrongAnswers: initialData?.wrongAnswers || 0,
      bestScore: initialData?.bestScore || 0,
      bestLevel: initialData?.bestLevel || 1,
      bestStreak: initialData?.bestStreak || 0,
      starsEarned: initialData?.starsEarned || 0,
      timeBonusesUsed: initialData?.timeBonusesUsed || 0
    };
  }

  public recordGame(data: {
    score: number;
    level: number;
    streak: number;
    correct: number;
    wrong: number;
    stars: number;
    bonusesUsed: number;
  }): { isNewBestScore: boolean } {
    this.stats.gamesPlayed++;
    this.stats.questionsAnswered += (data.correct + data.wrong);
    this.stats.correctAnswers += data.correct;
    this.stats.wrongAnswers += data.wrong;
    this.stats.starsEarned += data.stars;
    this.stats.timeBonusesUsed += data.bonusesUsed;

    if (data.level > this.stats.bestLevel) {
      this.stats.bestLevel = data.level;
    }
    if (data.streak > this.stats.bestStreak) {
      this.stats.bestStreak = data.streak;
    }

    let isNewBestScore = false;
    if (data.score > this.stats.bestScore) {
      this.stats.bestScore = data.score;
      isNewBestScore = true;
    }

    return { isNewBestScore };
  }

  public getStats(): LifetimeStats {
    return { ...this.stats };
  }

  public getAccuracy(): number {
    const total = this.stats.correctAnswers + this.stats.wrongAnswers;
    if (total === 0) return 100;
    return Math.round((this.stats.correctAnswers / total) * 100);
  }

  public reset(): void {
    this.stats = {
      gamesPlayed: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      bestScore: 0,
      bestLevel: 1,
      bestStreak: 0,
      starsEarned: 0,
      timeBonusesUsed: 0
    };
  }
}
