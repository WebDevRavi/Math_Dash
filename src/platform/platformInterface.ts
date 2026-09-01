export interface SaveDataSchema {
  schemaVersion: number;
  settings: {
    sound: boolean;
    showInstructions: boolean;
  };
  statistics: {
    gamesPlayed: number;
    questionsAnswered: number;
    correctAnswers: number;
    wrongAnswers: number;
    bestScore: number;
    bestLevel: number;
    bestStreak: number;
    starsEarned: number;
    timeBonusesUsed: number;
  };
  achievements: Record<string, boolean>;
  veryHardUnlocked: boolean;
  tutorialCompleted?: boolean;
}

export interface PlatformInterface {
  init(): Promise<void>;
  loadingStart(): void;
  loadingStop(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  requestMidgameAd(): Promise<boolean>;
  requestRewardedAd(): Promise<boolean>;
  saveData(data: SaveDataSchema): Promise<void>;
  loadData(): Promise<SaveDataSchema | null>;
  isCrazyGames(): boolean;
}
