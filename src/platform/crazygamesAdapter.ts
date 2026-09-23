import { PlatformInterface, SaveDataSchema, AdCallbacks, PlatformSettings, CrazyUser, CrazySystemInfo } from './platformInterface.ts';
import { GAME_CONFIG } from '../core/config.ts';

// Comprehensive Type definitions for CrazyGames SDK v3
interface CrazyGamesSDK {
  init: () => Promise<void>;
  environment?: 'local' | 'crazygames' | 'disabled';
  game: {
    loadingStart: () => void;
    loadingStop: () => void;
    gameplayStart: () => void;
    gameplayStop: () => void;
    happytime?: () => void;
    reportGameCompletedPercentage?: (percentage: number) => void;
    inviteLink?: (params?: Record<string, string>) => Promise<string>;
    updateRoom?: (roomId: string) => void;
    addRoomJoinListener?: (listener: (data: unknown) => void) => void;
    removeRoomJoinListener?: (listener: (data: unknown) => void) => void;
    showInviteButton?: (params?: Record<string, string>) => void;
    hideInviteButton?: () => void;
    settings?: {
      muteAudio?: boolean;
      disableChat?: boolean;
    };
    addSettingsChangeListener?: (listener: (settings: { muteAudio?: boolean; disableChat?: boolean }) => void) => void;
    removeSettingsChangeListener?: (listener: (settings: { muteAudio?: boolean; disableChat?: boolean }) => void) => void;
  };
  user?: {
    isUserAccountAvailable?: boolean;
    systemInfo?: CrazySystemInfo;
    getUser?: () => Promise<{ __dangerousUserId?: string; username: string; profilePictureUrl?: string } | null>;
    showAuthPrompt?: () => Promise<unknown>;
    showAccountLinkPrompt?: () => Promise<unknown>;
    getUserToken?: () => Promise<string>;
    getXsollaUserToken?: () => Promise<string>;
    addAuthListener?: (listener: (user: unknown) => void) => void;
    removeAuthListener?: (listener: (user: unknown) => void) => void;
    submitScore?: (score: number) => Promise<unknown>;
    SubmitScore?: (encryptedScore: string, finalScore: number) => Promise<unknown>;
  };
  data?: {
    setItem?: (key: string, value: string) => void;
    getItem?: (key: string) => string | null;
    removeItem?: (key: string) => void;
    clear?: () => void;
  };
  analytics?: {
    trackOrder?: (provider: string, order: unknown) => void;
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
  private settingsListeners: ((settings: PlatformSettings) => void)[] = [];
  private authListeners: ((user: CrazyUser | null) => void)[] = [];

  private withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
    ]);
  }

  public async init(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.CrazyGames?.SDK) {
        this.sdk = window.CrazyGames.SDK;
        await this.withTimeout(this.sdk.init(), 2500, undefined);
        this.isInitialized = true;

        // 1. Hook Settings Listener for system-wide Audio Mute
        if (this.sdk.game?.addSettingsChangeListener) {
          this.sdk.game.addSettingsChangeListener((newSettings) => {
            this.notifySettingsChange({
              muteAudio: newSettings.muteAudio,
              disableChat: newSettings.disableChat
            });
          });
        }

        // 2. Hook Auth Listener for User Account Changes
        if (this.sdk.user?.addAuthListener) {
          this.sdk.user.addAuthListener(async () => {
            const user = await this.getUser();
            for (const listener of this.authListeners) {
              try {
                listener(user);
              } catch (e) {
                console.warn('Auth listener callback error:', e);
              }
            }
          });
        }
      }
    } catch (err) {
      console.warn('CrazyGames SDK init failed or running in unsupported environment:', err);
    }
  }

  /* ----------------------------------------------------
     PLATFORM SETTINGS & AUDIO MUTE
     Must respect CrazyGames system mute with highest priority
  ---------------------------------------------------- */
  public getSettings(): PlatformSettings {
    let urlMute: boolean | undefined;
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('muteAudio') === 'true') {
          urlMute = true;
        }
      } catch {
        // ignore
      }
    }

    const sdkMute = this.sdk?.game?.settings?.muteAudio;
    return {
      muteAudio: urlMute ?? sdkMute ?? false,
      disableChat: this.sdk?.game?.settings?.disableChat ?? false
    };
  }

  public onSettingsChange(listener: (settings: PlatformSettings) => void): void {
    this.settingsListeners.push(listener);
    listener(this.getSettings());
  }

  private notifySettingsChange(settings: PlatformSettings): void {
    const current = this.getSettings();
    const merged: PlatformSettings = {
      ...current,
      ...settings
    };
    for (const listener of this.settingsListeners) {
      try {
        listener(merged);
      } catch (err) {
        console.warn('Settings listener error:', err);
      }
    }
  }

  /* ----------------------------------------------------
     GAME MODULE LIFECYCLE
  ---------------------------------------------------- */
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

  public happytime(): void {
    try {
      if (this.sdk?.game?.happytime) {
        this.sdk.game.happytime();
      }
    } catch (e) {
      console.warn('CrazyGames happytime error:', e);
    }
  }

  public reportGameCompletedPercentage(percentage: number): void {
    try {
      const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
      if (this.sdk?.game?.reportGameCompletedPercentage) {
        this.sdk.game.reportGameCompletedPercentage(clamped);
      }
    } catch (e) {
      console.warn('CrazyGames reportGameCompletedPercentage error:', e);
    }
  }

  public async inviteLink(params?: Record<string, string>): Promise<string | null> {
    try {
      if (this.sdk?.game?.inviteLink) {
        return await this.sdk.game.inviteLink(params);
      }
    } catch (e) {
      console.warn('CrazyGames inviteLink error:', e);
    }
    return null;
  }

  public updateRoom(roomId: string): void {
    try {
      if (this.sdk?.game?.updateRoom) {
        this.sdk.game.updateRoom(roomId);
      }
    } catch (e) {
      console.warn('CrazyGames updateRoom error:', e);
    }
  }

  public addRoomJoinListener(listener: (data: unknown) => void): void {
    try {
      if (this.sdk?.game?.addRoomJoinListener) {
        this.sdk.game.addRoomJoinListener(listener);
      }
    } catch (e) {
      console.warn('CrazyGames addRoomJoinListener error:', e);
    }
  }

  public removeRoomJoinListener(listener: (data: unknown) => void): void {
    try {
      if (this.sdk?.game?.removeRoomJoinListener) {
        this.sdk.game.removeRoomJoinListener(listener);
      }
    } catch (e) {
      console.warn('CrazyGames removeRoomJoinListener error:', e);
    }
  }

  public showInviteButton(params?: Record<string, string>): void {
    try {
      if (this.sdk?.game?.showInviteButton) {
        this.sdk.game.showInviteButton(params);
      }
    } catch (e) {
      console.warn('CrazyGames showInviteButton error:', e);
    }
  }

  public hideInviteButton(): void {
    try {
      if (this.sdk?.game?.hideInviteButton) {
        this.sdk.game.hideInviteButton();
      }
    } catch (e) {
      console.warn('CrazyGames hideInviteButton error:', e);
    }
  }

  /* ----------------------------------------------------
     USER MODULE
  ---------------------------------------------------- */
  public async getUser(): Promise<CrazyUser | null> {
    try {
      if (this.sdk?.user?.getUser) {
        const user = await this.withTimeout(this.sdk.user.getUser(), 1500, null);
        if (user && user.username) {
          return {
            username: user.username,
            profilePictureUrl: user.profilePictureUrl
          };
        }
      }
    } catch (e) {
      console.warn('CrazyGames getUser error:', e);
    }
    return null;
  }

  public async showAuthPrompt(): Promise<CrazyUser | null> {
    try {
      if (this.sdk?.user?.showAuthPrompt) {
        await this.sdk.user.showAuthPrompt();
        return await this.getUser();
      }
    } catch (e) {
      console.warn('CrazyGames showAuthPrompt error:', e);
    }
    return null;
  }

  public async showAccountLinkPrompt(): Promise<boolean> {
    try {
      if (this.sdk?.user?.showAccountLinkPrompt) {
        await this.sdk.user.showAccountLinkPrompt();
        return true;
      }
    } catch (e) {
      console.warn('CrazyGames showAccountLinkPrompt error:', e);
    }
    return false;
  }

  public async getUserToken(): Promise<string | null> {
    try {
      if (this.sdk?.user?.getUserToken) {
        return await this.sdk.user.getUserToken();
      }
    } catch (e) {
      console.warn('CrazyGames getUserToken error:', e);
    }
    return null;
  }

  public async getXsollaUserToken(): Promise<string | null> {
    try {
      if (this.sdk?.user?.getXsollaUserToken) {
        return await this.sdk.user.getXsollaUserToken();
      }
    } catch (e) {
      console.warn('CrazyGames getXsollaUserToken error:', e);
    }
    return null;
  }

  public addAuthListener(listener: (user: CrazyUser | null) => void): void {
    this.authListeners.push(listener);
  }

  public removeAuthListener(listener: (user: CrazyUser | null) => void): void {
    this.authListeners = this.authListeners.filter(l => l !== listener);
  }

  public async submitScore(score: number): Promise<boolean> {
    try {
      if (this.sdk?.user?.submitScore) {
        await this.sdk.user.submitScore(score);
        return true;
      } else if (this.sdk?.user?.SubmitScore) {
        await this.sdk.user.SubmitScore('', score);
        return true;
      }
    } catch (e) {
      console.warn('CrazyGames submitScore error:', e);
    }
    return false;
  }

  public getSystemInfo(): CrazySystemInfo | null {
    try {
      if (this.sdk?.user?.systemInfo) {
        return this.sdk.user.systemInfo;
      }
    } catch (e) {
      console.warn('CrazyGames systemInfo error:', e);
    }
    return null;
  }

  /* ----------------------------------------------------
     DATA MODULE (Cloud Storage)
  ---------------------------------------------------- */
  public setItem(key: string, value: string): void {
    try {
      if (this.sdk?.data?.setItem) {
        this.sdk.data.setItem(key, value);
      }
    } catch (e) {
      console.warn('CrazyGames data.setItem error:', e);
    }
  }

  public getItem(key: string): string | null {
    try {
      if (this.sdk?.data?.getItem) {
        return this.sdk.data.getItem(key);
      }
    } catch (e) {
      console.warn('CrazyGames data.getItem error:', e);
    }
    return null;
  }

  public removeItem(key: string): void {
    try {
      if (this.sdk?.data?.removeItem) {
        this.sdk.data.removeItem(key);
      }
    } catch (e) {
      console.warn('CrazyGames data.removeItem error:', e);
    }
  }

  public clearData(): void {
    try {
      if (this.sdk?.data?.clear) {
        this.sdk.data.clear();
      }
    } catch (e) {
      console.warn('CrazyGames data.clear error:', e);
    }
  }

  public async saveData(data: SaveDataSchema): Promise<void> {
    const serialized = JSON.stringify(data);

    // 1. Local cache fallback
    try {
      localStorage.setItem(GAME_CONFIG.storageKey, serialized);
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    // 2. CrazyGames cloud data module
    this.setItem(GAME_CONFIG.storageKey, serialized);
  }

  public async loadData(): Promise<SaveDataSchema | null> {
    // 1. Try CrazyGames cloud data module
    const cloudData = this.getItem(GAME_CONFIG.storageKey) || this.getItem(GAME_CONFIG.legacyStorageKey);
    if (cloudData) {
      try {
        return JSON.parse(cloudData) as SaveDataSchema;
      } catch (err) {
        console.warn('CrazyGames data parse error:', err);
      }
    }

    // 2. Fallback to LocalStorage
    try {
      let local = localStorage.getItem(GAME_CONFIG.storageKey);
      if (!local) {
        local = localStorage.getItem(GAME_CONFIG.legacyStorageKey);
      }
      if (local) {
        return JSON.parse(local) as SaveDataSchema;
      }
    } catch (err) {
      console.warn('LocalStorage read error:', err);
    }

    return null;
  }

  /* ----------------------------------------------------
     ANALYTICS MODULE
  ---------------------------------------------------- */
  public trackOrder(provider: string, order: unknown): void {
    try {
      if (this.sdk?.analytics?.trackOrder) {
        this.sdk.analytics.trackOrder(provider, order);
      }
    } catch (e) {
      console.warn('CrazyGames analytics.trackOrder error:', e);
    }
  }

  /* ----------------------------------------------------
     BASIC LAUNCH AD COMPLIANCE:
     CrazyGames requires all Basic Launch submissions to be
     completely AD-FREE.
     We strictly suppress all ad and banner calls so the game
     never triggers the Basic Launch ad rejection rule.
  ---------------------------------------------------- */
  public hasAdSupport(): boolean {
    return false;
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

  public async requestResponsiveBanner(_containerId: string): Promise<void> {
    // Basic launch: strictly no banners
  }

  public clearBanner(_containerId: string): void {
    // Basic launch: strictly no banners
  }

  public clearAllBanners(): void {
    // Basic launch: strictly no banners
  }

  public isCrazyGames(): boolean {
    return this.isInitialized && !!this.sdk;
  }
}
