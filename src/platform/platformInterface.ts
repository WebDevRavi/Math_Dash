export interface SaveDataSchema {
  schemaVersion: number;
  settings: {
    sound: boolean;
    showInstructions: boolean;
    difficulty?: string;
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

export interface AdCallbacks {
  adStarted?: () => void;
  adFinished?: () => void;
  adError?: (error: unknown) => void;
}

export interface PlatformSettings {
  muteAudio?: boolean;
  disableChat?: boolean;
}

export interface CrazyUser {
  username: string;
  profilePictureUrl?: string;
}

export interface CrazySystemInfo {
  countryCode?: string;
  locale?: string;
  device?: {
    type?: 'desktop' | 'tablet' | 'mobile';
  };
  os?: {
    name?: string;
    version?: string;
  };
  browser?: {
    name?: string;
    version?: string;
  };
  applicationType?: 'web' | 'google_play_store' | 'apple_store' | 'pwa';
}

export interface PlatformInterface {
  init(): Promise<void>;
  
  // Game Module
  loadingStart(): void;
  loadingStop(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  happytime(): void;
  reportGameCompletedPercentage(percentage: number): void;
  inviteLink(params?: Record<string, string>): Promise<string | null>;
  updateRoom(roomId: string): void;
  addRoomJoinListener(listener: (data: unknown) => void): void;
  removeRoomJoinListener(listener: (data: unknown) => void): void;
  showInviteButton(params?: Record<string, string>): void;
  hideInviteButton(): void;
  
  // User Module
  getUser(): Promise<CrazyUser | null>;
  showAuthPrompt(): Promise<CrazyUser | null>;
  showAccountLinkPrompt(): Promise<boolean>;
  getUserToken(): Promise<string | null>;
  getXsollaUserToken(): Promise<string | null>;
  addAuthListener(listener: (user: CrazyUser | null) => void): void;
  removeAuthListener(listener: (user: CrazyUser | null) => void): void;
  submitScore(score: number): Promise<boolean>;
  getSystemInfo(): CrazySystemInfo | null;
  
  // Data Module (Cloud Storage)
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
  clearData(): void;
  saveData(data: SaveDataSchema): Promise<void>;
  loadData(): Promise<SaveDataSchema | null>;
  
  // Analytics Module
  trackOrder(provider: string, order: unknown): void;

  // Basic Launch Ad Compliance (All Ads & Banners strictly disabled for Basic Launch)
  hasAdSupport(): boolean;
  requestMidgameAd(callbacks?: AdCallbacks): Promise<boolean>;
  requestRewardedAd(callbacks?: AdCallbacks): Promise<boolean>;
  requestResponsiveBanner(containerId: string): Promise<void>;
  clearBanner(containerId: string): void;
  clearAllBanners(): void;

  // Platform Audio & Settings
  getSettings(): PlatformSettings;
  onSettingsChange(listener: (settings: PlatformSettings) => void): void;
  
  isCrazyGames(): boolean;
}
