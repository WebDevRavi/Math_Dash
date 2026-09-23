export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', title: 'First Breach', description: 'Decrypt your first security node.', icon: '⚡', unlocked: false },
  { id: 'warm_up', title: 'Script Kiddie', description: 'Bypass 10 security nodes.', icon: '💾', unlocked: false },
  { id: 'mental_gym', title: 'Data Runner', description: 'Bypass 25 security nodes.', icon: '🦾', unlocked: false },
  { id: 'math_whiz', title: 'Master Netrunner', description: 'Bypass 50 security nodes in a single run.', icon: '🔥', unlocked: false },
  { id: 'centurion', title: 'Gigabyte Legion', description: 'Bypass 100 total security nodes.', icon: '💯', unlocked: false },
  { id: 'streak_5', title: 'Signal Lock', description: 'Achieve a 5-node breach streak.', icon: '🎯', unlocked: false },
  { id: 'streak_10', title: 'Neural Overload', description: 'Achieve a 10-node breach streak.', icon: '🚀', unlocked: false },
  { id: 'streak_20', title: 'Ghost in the Shell', description: 'Achieve a 20-node breach streak.', icon: '👑', unlocked: false },
  { id: 'speed_solver', title: 'Overclock King', description: 'Trigger 3 Overclock injections in one run.', icon: '⚡', unlocked: false },
  { id: 'level_master', title: 'Sector Infiltrator', description: 'Infiltrate Sector 4 or higher.', icon: '🏆', unlocked: false },
  { id: 'star_collector', title: 'System Root', description: 'Attain 5 stars in a single run.', icon: '⭐', unlocked: false },
  { id: 'flawless', title: 'Zero Trace', description: 'Finish a run with ≥95% accuracy (min 15 nodes).', icon: '✨', unlocked: false },
  { id: 'grand_master', title: 'Black ICE Protocol', description: 'Unlock Black ICE Mode (earn 5+ achievements).', icon: '🗝️', unlocked: false }
];

export class AchievementManager {
  private achievements: Achievement[] = [];
  private onUnlockCallback?: (achievement: Achievement) => void;

  constructor(savedState?: Record<string, boolean>) {
    this.achievements = INITIAL_ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: !!savedState?.[a.id]
    }));

    // Ensure grand_master is unlocked if player already holds 5+ achievements
    if (this.getUnlockedCount() >= 5) {
      const gm = this.achievements.find(a => a.id === 'grand_master');
      if (gm) gm.unlocked = true;
    }
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

    if (newlyUnlocked.length > 0 && this.onUnlockCallback) {
      newlyUnlocked.forEach(a => this.onUnlockCallback?.(a));
    }

    return newlyUnlocked;
  }

  public serialize(): Record<string, boolean> {
    const map: Record<string, boolean> = {};
    this.achievements.forEach(a => {
      map[a.id] = a.unlocked;
    });
    return map;
  }

  public getProgressPercentage(): number {
    return Math.round((this.getUnlockedCount() / this.achievements.length) * 100);
  }
}
