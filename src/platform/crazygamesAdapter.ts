import { PlatformInterface, SaveDataSchema } from './platformInterface.ts';
import { GAME_CONFIG } from '../core/config.ts';

// Type definitions for CrazyGames SDK v3
interface CrazyGamesSDK {
  init: () => Promise<void>;
  game: {
    loadingStart: () => void;
    loadingStop: () => void;
    gameplayStart: () => void;
    gameplayStop: () => void;
    happytime?: () => void;
  };
  ad: {
    requestAd: (
      type: 'midgame' | 'rewarded',
      callbacks?: {
        adStarted?: () => void;
        adFinished?: () => void;
        adError?: (error: unknown) => void;
      }
    ) => Promise<void>;
  };
  data: {
    setItem: (key: string, value: string) => Promise<void>;
    getItem: (key: string) => Promise<string | null>;
  };
}

declare global {
  interface Window {
    CrazyGames?: {
      SDK: CrazyGamesSDK;
    };
  }
}

export class CrazyGamesAdapter implements PlatformInterface {
  private sdk: CrazyGamesSDK | null = null;
  private isInitialized: boolean = false;

  public async init(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.CrazyGames?.SDK) {
        this.sdk = window.CrazyGames.SDK;
        await this.sdk.init();
        this.isInitialized = true;
      }
    } catch (err) {
      console.warn('CrazyGames SDK init failed or running in unsupported environment:', err);
    }
  }

  public loadingStart(): void {
    try {
      if (this.sdk?.game?.loadingStart) {
        this.sdk.game.loadingStart();
      }
    } catch (e) {
      console.warn('CrazyGames loadingStart error:', e);
    }
  }

  public loadingStop(): void {
    try {
      if (this.sdk?.game?.loadingStop) {
        this.sdk.game.loadingStop();
      }
    } catch (e) {
      console.warn('CrazyGames loadingStop error:', e);
    }
  }

  public gameplayStart(): void {
    try {
      if (this.sdk?.game?.gameplayStart) {
        this.sdk.game.gameplayStart();
      }
    } catch (e) {
      console.warn('CrazyGames gameplayStart error:', e);
    }
  }

  public gameplayStop(): void {
    try {
      if (this.sdk?.game?.gameplayStop) {
        this.sdk.game.gameplayStop();
      }
    } catch (e) {
      console.warn('CrazyGames gameplayStop error:', e);
    }
  }

  public async requestMidgameAd(): Promise<boolean> {
    if (!this.sdk?.ad?.requestAd) return true;

    return new Promise((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(true);
        }
      }, 8000); // 8s safety timeout

      try {
        this.sdk?.ad.requestAd('midgame', {
          adStarted: () => {
            // Ad started callback
          },
          adFinished: () => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              resolve(true);
            }
          },
          adError: (err) => {
            console.warn('CrazyGames midgame ad error:', err);
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              resolve(false);
            }
          }
        });
      } catch (e) {
        console.warn('Exception requesting midgame ad:', e);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(false);
        }
      }
    });
  }

  public async requestRewardedAd(): Promise<boolean> {
    if (!this.sdk?.ad?.requestAd) return true;

    return new Promise((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, 10000);

      try {
        this.sdk?.ad.requestAd('rewarded', {
          adStarted: () => {
            // Ad started
          },
          adFinished: () => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              resolve(true);
            }
          },
          adError: (err) => {
            console.warn('CrazyGames rewarded ad error:', err);
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              resolve(false);
            }
          }
        });
      } catch (e) {
        console.warn('Exception requesting rewarded ad:', e);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(false);
        }
      }
    });
  }

  public async saveData(data: SaveDataSchema): Promise<void> {
    const serialized = JSON.stringify(data);
    if (this.sdk?.data?.setItem) {
      try {
        await this.sdk.data.setItem(GAME_CONFIG.storageKey, serialized);
        return;
      } catch (err) {
        console.warn('CrazyGames data.setItem error, falling back to localStorage:', err);
      }
    }

    try {
      localStorage.setItem(GAME_CONFIG.storageKey, serialized);
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  }

  public async loadData(): Promise<SaveDataSchema | null> {
    if (this.sdk?.data?.getItem) {
      try {
        const cloudData = await this.sdk.data.getItem(GAME_CONFIG.storageKey);
        if (cloudData) {
          return JSON.parse(cloudData) as SaveDataSchema;
        }
      } catch (err) {
        console.warn('CrazyGames data.getItem error, falling back to localStorage:', err);
      }
    }

    try {
      const local = localStorage.getItem(GAME_CONFIG.storageKey);
      if (local) {
        return JSON.parse(local) as SaveDataSchema;
      }
    } catch (err) {
      console.warn('LocalStorage read error:', err);
    }

    return null;
  }

  public isCrazyGames(): boolean {
    return this.isInitialized && !!this.sdk;
  }
}
