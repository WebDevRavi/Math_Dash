import { PlatformInterface, SaveDataSchema } from '../platform/platformInterface.ts';
import { GAME_CONFIG } from '../core/config.ts';
import { LifetimeStats } from '../core/statistics.ts';

export class SaveService {
  private platform: PlatformInterface;

  constructor(platform: PlatformInterface) {
    this.platform = platform;
  }

  public async save(data: {
    sound: boolean;
    showInstructions: boolean;
    stats: LifetimeStats;
    achievements: Record<string, boolean>;
    veryHardUnlocked: boolean;
    tutorialCompleted?: boolean;
  }): Promise<void> {
    const payload: SaveDataSchema = {
      schemaVersion: GAME_CONFIG.schemaVersion,
      settings: {
        sound: data.sound,
        showInstructions: data.showInstructions
      },
      statistics: {
        gamesPlayed: data.stats.gamesPlayed,
        questionsAnswered: data.stats.questionsAnswered,
        correctAnswers: data.stats.correctAnswers,
        wrongAnswers: data.stats.wrongAnswers,
        bestScore: data.stats.bestScore,
        bestLevel: data.stats.bestLevel,
        bestStreak: data.stats.bestStreak,
        starsEarned: data.stats.starsEarned,
        timeBonusesUsed: data.stats.timeBonusesUsed
      },
      achievements: data.achievements,
      veryHardUnlocked: data.veryHardUnlocked,
      tutorialCompleted: data.tutorialCompleted
    };

    await this.platform.saveData(payload);
  }

  public async load(): Promise<SaveDataSchema | null> {
    return await this.platform.loadData();
  }
}
