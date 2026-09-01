export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', title: 'First Step', description: 'Solve your first equation.', icon: '✏️', unlocked: false },
  { id: 'warm_up', title: 'Warm Up', description: 'Answer 10 questions correctly.', icon: '🔥', unlocked: false },
  { id: 'mental_gym', title: 'Mental Gym', description: 'Answer 25 questions correctly.', icon: '🧠', unlocked: false },
  { id: 'math_whiz', title: 'Math Whiz', description: 'Answer 50 questions correctly in a run.', icon: '⚡', unlocked: false },
  { id: 'centurion', title: 'Centurion', description: 'Answer 100 total questions correctly.', icon: '💯', unlocked: false },
  { id: 'streak_5', title: 'On A Roll', description: 'Achieve a 5-question streak.', icon: '🎯', unlocked: false },
  { id: 'streak_10', title: 'Unstoppable', description: 'Achieve a 10-question streak.', icon: '🚀', unlocked: false },
  { id: 'streak_20', title: 'Flow State', description: 'Achieve a 20-question streak.', icon: '👑', unlocked: false },
  { id: 'speed_solver', title: 'Speed Solver', description: 'Earn and use 3 Time Bonuses in one run.', icon: '⚡', unlocked: false },
  { id: 'level_master', title: 'Level Master', description: 'Reach Level 4 or higher.', icon: '🏆', unlocked: false },
  { id: 'star_collector', title: 'Star Collector', description: 'Earn 5 stars in a single run.', icon: '⭐', unlocked: false },
  { id: 'flawless', title: 'Flawless', description: 'Finish a run with ≥95% accuracy (min 15 Qs).', icon: '✨', unlocked: false },
  { id: 'grand_master', title: 'Grand Master', description: 'Unlock Very Hard Mode (earn 5+ achievements).', icon: '🗝️', unlocked: false }
];

export class AchievementManager {
  private achievements: Achievement[] = [];
  private onUnlockCallback?: (achievement: Achievement) => void;

  constructor(savedState?: Record<string, boolean>) {
    this.achievements = INITIAL_ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: !!savedState?.[a.id]
    }));
  }

  public setUnlockCallback(cb: (a: Achievement) => void): void {
    this.onUnlockCallback = cb;
  }

  public getAll(): Achievement[] {
    return this.achievements;
  }

  public getUnlockedCount(): number {
    return this.achievements.filter(a => a.unlocked).length;
  }

  public isVeryHardUnlocked(): boolean {
    return this.getUnlockedCount() >= 5 || !!this.achievements.find(a => a.id === 'grand_master')?.unlocked;
  }

  public evaluateRun(data: {
    runScore: number;
    runCorrect: number;
    runWrong: number;
    runStreak: number;
    runLevel: number;
    runStars: number;
    runBonusesUsed: number;
    totalLifetimeCorrect: number;
  }): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    const tryUnlock = (id: string) => {
      const a = this.achievements.find(item => item.id === id);
      if (a && !a.unlocked) {
        a.unlocked = true;
        a.unlockedAt = Date.now();
        newlyUnlocked.push(a);
        if (this.onUnlockCallback) {
          this.onUnlockCallback(a);
        }
      }
    };

    if (data.runCorrect >= 1) tryUnlock('first_step');
    if (data.runCorrect >= 10) tryUnlock('warm_up');
    if (data.runCorrect >= 25) tryUnlock('mental_gym');
    if (data.runCorrect >= 50) tryUnlock('math_whiz');
    if (data.totalLifetimeCorrect >= 100) tryUnlock('centurion');

    if (data.runStreak >= 5) tryUnlock('streak_5');
    if (data.runStreak >= 10) tryUnlock('streak_10');
    if (data.runStreak >= 20) tryUnlock('streak_20');

    if (data.runBonusesUsed >= 3) tryUnlock('speed_solver');
    if (data.runLevel >= 4) tryUnlock('level_master');
    if (data.runStars >= 5) tryUnlock('star_collector');

    const totalAnswered = data.runCorrect + data.runWrong;
    const accuracy = totalAnswered > 0 ? (data.runCorrect / totalAnswered) : 0;
    if (totalAnswered >= 15 && accuracy >= 0.95) {
      tryUnlock('flawless');
    }

    if (this.getUnlockedCount() >= 5) {
      tryUnlock('grand_master');
    }

    return newlyUnlocked;
  }

  public serialize(): Record<string, boolean> {
    const map: Record<string, boolean> = {};
    for (const a of this.achievements) {
      if (a.unlocked) map[a.id] = true;
    }
    return map;
  }
}
