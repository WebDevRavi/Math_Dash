import { PlatformInterface, SaveDataSchema } from './platformInterface.ts';
import { GAME_CONFIG } from '../core/config.ts';

export class LocalDevAdapter implements PlatformInterface {
  public async init(): Promise<void> {
    // console.log('[LocalDev] Platform initialized in local dev mode');
  }

  public loadingStart(): void {
    // console.log('[LocalDev] loadingStart()');
  }

  public loadingStop(): void {
    // console.log('[LocalDev] loadingStop()');
  }

  public gameplayStart(): void {
    // console.log('[LocalDev] gameplayStart()');
  }

  public gameplayStop(): void {
    // console.log('[LocalDev] gameplayStop()');
  }

  public async requestMidgameAd(): Promise<boolean> {
    // console.log('[LocalDev] requestMidgameAd() -> mock fill');
    return true;
  }

  public async requestRewardedAd(): Promise<boolean> {
    // console.log('[LocalDev] requestRewardedAd() -> mock reward');
    return true;
  }

  public async saveData(data: SaveDataSchema): Promise<void> {
    try {
      localStorage.setItem(GAME_CONFIG.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('[LocalDev] Failed to save to localStorage', e);
    }
  }

  public async loadData(): Promise<SaveDataSchema | null> {
    try {
      const raw = localStorage.getItem(GAME_CONFIG.storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as SaveDataSchema;
    } catch (e) {
      console.warn('[LocalDev] Failed to read from localStorage', e);
      return null;
    }
  }

  public isCrazyGames(): boolean {
    return false;
  }
}
