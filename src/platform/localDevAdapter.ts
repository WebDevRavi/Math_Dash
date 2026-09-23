import { PlatformInterface, SaveDataSchema, AdCallbacks, PlatformSettings, CrazyUser, CrazySystemInfo } from './platformInterface.ts';
import { GAME_CONFIG } from '../core/config.ts';

export class LocalDevAdapter implements PlatformInterface {
  private settingsListeners: ((settings: PlatformSettings) => void)[] = [];
  private authListeners: ((user: CrazyUser | null) => void)[] = [];
  private roomJoinListeners: ((data: unknown) => void)[] = [];

  public async init(): Promise<void> {
    // console.log('[LocalDev] Platform initialized in local dev mode');
  }

  public getSettings(): PlatformSettings {
    let urlMute = false;
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        urlMute = params.get('muteAudio') === 'true';
      } catch {
        // ignore
      }
    }
    return {
      muteAudio: urlMute,
      disableChat: false
    };
  }

  public onSettingsChange(listener: (settings: PlatformSettings) => void): void {
    this.settingsListeners.push(listener);
    listener(this.getSettings());
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

  public happytime(): void {
    // console.log('[LocalDev] happytime() 🎉');
  }

  public reportGameCompletedPercentage(_percentage: number): void {
    // console.log(`[LocalDev] reportGameCompletedPercentage: ${_percentage}%`);
  }

  public async inviteLink(params?: Record<string, string>): Promise<string | null> {
    const search = params ? '?' + new URLSearchParams(params).toString() : '';
    return `https://www.crazygames.com/game/cyber-hack-overdrive${search}`;
  }

  public updateRoom(_roomId: string): void {
    // console.log(`[LocalDev] updateRoom: ${_roomId}`);
  }

  public addRoomJoinListener(listener: (data: unknown) => void): void {
    this.roomJoinListeners.push(listener);
  }

  public removeRoomJoinListener(listener: (data: unknown) => void): void {
    this.roomJoinListeners = this.roomJoinListeners.filter(l => l !== listener);
  }

  public showInviteButton(_params?: Record<string, string>): void {
    // console.log('[LocalDev] showInviteButton');
  }

  public hideInviteButton(): void {
    // console.log('[LocalDev] hideInviteButton');
  }

  public async getUser(): Promise<CrazyUser | null> {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mockUser') === 'true') {
          return {
            username: 'NetrunnerElite',
            profilePictureUrl: 'https://images.crazygames.com/userportal/avatars/4.png'
          };
        }
      } catch {
        // ignore
      }
    }
    return null;
  }

  public async showAuthPrompt(): Promise<CrazyUser | null> {
    const user: CrazyUser = {
      username: 'NetrunnerElite',
      profilePictureUrl: 'https://images.crazygames.com/userportal/avatars/4.png'
    };
    for (const listener of this.authListeners) {
      listener(user);
    }
    return user;
  }

  public async showAccountLinkPrompt(): Promise<boolean> {
    return true;
  }

  public async getUserToken(): Promise<string | null> {
    return 'local-mock-user-token';
  }

  public async getXsollaUserToken(): Promise<string | null> {
    return 'local-mock-xsolla-token';
  }

  public addAuthListener(listener: (user: CrazyUser | null) => void): void {
    this.authListeners.push(listener);
  }

  public removeAuthListener(listener: (user: CrazyUser | null) => void): void {
    this.authListeners = this.authListeners.filter(l => l !== listener);
  }

  public async submitScore(_score: number): Promise<boolean> {
    // console.log(`[LocalDev] submitScore: ${_score}`);
    return true;
  }

  public getSystemInfo(): CrazySystemInfo | null {
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    return {
      countryCode: 'US',
      locale: 'en-US',
      device: {
        type: isTouch ? 'mobile' : 'desktop'
      },
      os: { name: 'LocalDev', version: '1.0' },
      browser: { name: 'Browser', version: '1.0' },
      applicationType: 'web'
    };
  }

  /* Cloud Storage via LocalStorage */
  public setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  }

  public getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  public removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

  public clearData(): void {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
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
      let raw = localStorage.getItem(GAME_CONFIG.storageKey);
      if (!raw) {
        raw = localStorage.getItem(GAME_CONFIG.legacyStorageKey);
      }
      if (raw) {
        return JSON.parse(raw) as SaveDataSchema;
      }
    } catch (e) {
      console.warn('[LocalDev] Failed to read from localStorage', e);
    }
    return null;
  }

  public trackOrder(_provider: string, _order: unknown): void {
    // console.log(`[LocalDev] trackOrder: ${_provider}`, _order);
  }

  public hasAdSupport(): boolean {
    return false;
  }

  public async requestResponsiveBanner(_containerId: string): Promise<void> {
    // Basic launch: strictly disabled
  }

  public clearBanner(_containerId: string): void {
    // Basic launch: strictly disabled
  }

  public clearAllBanners(): void {
    // Basic launch: strictly disabled
  }

  public async requestMidgameAd(callbacks?: AdCallbacks): Promise<boolean> {
    callbacks?.adStarted?.();
    callbacks?.adFinished?.();
    return true;
  }

  public async requestRewardedAd(callbacks?: AdCallbacks): Promise<boolean> {
    callbacks?.adStarted?.();
    callbacks?.adFinished?.();
    return true;
  }

  public isCrazyGames(): boolean {
    return false;
  }
}
