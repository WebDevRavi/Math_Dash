import { DifficultyMode } from '../core/difficulty.ts';
import { CrazyUser } from '../platform/platformInterface.ts';

export interface HomeScreenCallbacks {
  onPlay: () => void;
  onOpenInstructions: () => void;
  onToggleSound: () => void;
  onOpenAchievements: () => void;
  onSelectDifficulty: (mode: DifficultyMode) => void;
  onOpenStats: () => void;
  onLogin?: () => void;
}

const CYBER_DIFF_LABELS: Record<DifficultyMode, string> = {
  EASY: 'PROXY',
  NORMAL: 'FIREWALL',
  HARD: 'MAINFRAME',
  VERY_HARD: 'BLACK ICE'
};

export class HomeScreen {
  private container: HTMLElement;
  private callbacks: HomeScreenCallbacks;
  private isSoundOn: boolean;
  private isVeryHardUnlocked: boolean;
  private currentDifficulty: DifficultyMode;
  private user: CrazyUser | null = null;
  private showLoginChip: boolean = false;

  constructor(
    container: HTMLElement,
    callbacks: HomeScreenCallbacks,
    initialState: {
      isSoundOn: boolean;
      isVeryHardUnlocked: boolean;
      currentDifficulty: DifficultyMode;
      user?: CrazyUser | null;
      showLoginChip?: boolean;
    }
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.isSoundOn = initialState.isSoundOn;
    this.isVeryHardUnlocked = initialState.isVeryHardUnlocked;
    this.currentDifficulty = initialState.currentDifficulty;
    this.user = initialState.user ?? null;
    this.showLoginChip = initialState.showLoginChip ?? false;
    this.render();
  }

  public updateState(state: {
    isSoundOn?: boolean;
    isVeryHardUnlocked?: boolean;
    currentDifficulty?: DifficultyMode;
    user?: CrazyUser | null;
    showLoginChip?: boolean;
  }): void {
    if (state.isSoundOn !== undefined) this.isSoundOn = state.isSoundOn;
    if (state.isVeryHardUnlocked !== undefined) this.isVeryHardUnlocked = state.isVeryHardUnlocked;
    if (state.currentDifficulty !== undefined) this.currentDifficulty = state.currentDifficulty;
    if (state.user !== undefined) this.user = state.user ?? null;
    if (state.showLoginChip !== undefined) this.showLoginChip = state.showLoginChip;
    this.render();
  }

  private render(): void {
    const modes: DifficultyMode[] = ['EASY', 'NORMAL', 'HARD', 'VERY_HARD'];

    this.container.innerHTML = `
      <div class="screen-home anim-fade">
        <!-- Top Utility Bar: Info & Sound -->
        <div class="home-top-bar">
          <button class="icon-btn cyber-icon-btn" id="btn-home-info" title="Mission Briefing & Rules" aria-label="Instructions">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
          ${this.user ? `
            <div class="home-user-badge cyber-badge" title="CrazyGames Profile: ${this.user.username}">
              ${this.user.profilePictureUrl ? `<img src="${this.user.profilePictureUrl}" class="home-user-avatar" alt="Avatar" />` : '👤'}
              <span class="home-user-name">${this.user.username}</span>
            </div>
          ` : (this.showLoginChip ? `
            <button class="home-login-chip cyber-login-chip" id="btn-home-login" title="Log in with CrazyGames to sync profile across devices">
              <span>👤 NETRUNNER LOGIN</span>
            </button>
          ` : '')}
          <button class="icon-btn cyber-icon-btn" id="btn-home-sound" title="Toggle Sound" aria-label="Toggle Sound">
            ${this.isSoundOn ? `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            ` : `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            `}
          </button>
        </div>

        <!-- Brand & Title Header -->
        <div class="home-brand-area">
          <!-- Cyberpunk Netrunner Emblem -->
          <div class="cyber-emblem">
            <svg width="68" height="42" viewBox="0 0 100 60" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="50,4 90,26 80,54 20,54 10,26" stroke="#00f0ff" stroke-width="3" fill="rgba(0, 240, 255, 0.08)" />
              <path d="M30 36 L44 22 L56 38 L70 24" stroke="#ff0055" stroke-width="3.5" />
              <circle cx="50" cy="38" r="3" fill="#ffb700" />
            </svg>
          </div>

          <h1 class="home-title cyber-title">
            <span class="cyan-text">CYBER</span>
            <span class="magenta-text">HACK</span>
            <span class="overdrive-pill">OVERDRIVE</span>
          </h1>

          <div class="home-tagline cyber-tagline">
            <span class="tag-p1">BREACH THE MAINFRAME</span>
            <span class="tag-sep">•</span>
            <span class="tag-p2">OVERCLOCK YOUR BRAIN</span>
          </div>
        </div>

        <!-- Center Large BREACH Button -->
        <div class="home-center-play">
          <button class="home-play-btn cyber-play-btn anim-pop" id="btn-home-play" aria-label="Start Infiltration">
            <div class="play-btn-glow"></div>
            <svg viewBox="0 0 24 24">
              <polygon points="6 3 20 12 6 21 6 3"></polygon>
            </svg>
          </button>
          <span class="home-play-label cyber-play-label">BREACH</span>
        </div>

        <!-- Security Level / Difficulty Selector Bar -->
        <div class="home-difficulty-bar">
          ${modes.map(mode => {
            const isLocked = mode === 'VERY_HARD' && !this.isVeryHardUnlocked;
            const isActive = this.currentDifficulty === mode;
            const cyberLabel = CYBER_DIFF_LABELS[mode];
            const displayLabel = mode === 'VERY_HARD' ? (isLocked ? `${cyberLabel} 🔒` : `${cyberLabel} ⚡`) : cyberLabel;
            return `
              <button 
                class="diff-pill-btn cyber-pill-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}" 
                data-mode="${mode}"
                ${isLocked ? 'title="Unlock 5 achievements to decrypt Black ICE"' : ''}
              >
                ${displayLabel}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Bottom Actions: Achievements, Black ICE Toggle, Statistics -->
        <div class="home-bottom-actions">
          <div class="sub-action-item">
            <button class="sub-action-btn cyber-sub-btn btn-achievements" id="btn-home-achievements" aria-label="Achievements">
              <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
            <span class="sub-action-label cyber-sub-label">BADGES</span>
          </div>

          <div class="sub-action-item">
            <button class="sub-action-btn cyber-sub-btn btn-veryhard ${this.isVeryHardUnlocked ? '' : 'locked'} ${this.currentDifficulty === 'VERY_HARD' ? 'active' : ''}" id="btn-home-veryhard" aria-label="Toggle Black ICE Mode">
              ${this.isVeryHardUnlocked ? `
                <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              ` : `
                <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              `}
            </button>
            <span class="sub-action-label cyber-sub-label btn-veryhard">
              ${this.isVeryHardUnlocked ? (this.currentDifficulty === 'VERY_HARD' ? '⚡ BLACK ICE' : 'BLACK ICE') : 'BLACK ICE 🔒'}
            </span>
          </div>

          <div class="sub-action-item">
            <button class="sub-action-btn cyber-sub-btn btn-stats" id="btn-home-stats" aria-label="Telemetry & Statistics">
              <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </button>
            <span class="sub-action-label cyber-sub-label">TELEMETRY</span>
          </div>
        </div>

        <!-- Creator Credits -->
        <div class="home-creator-credits-wrapper">
          <span class="home-creator-credit cyber-credit">CYBER HACK: OVERDRIVE // CREATED BY RAVI SOLANKI</span>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    const playBtn = document.getElementById('btn-home-play');
    const infoBtn = document.getElementById('btn-home-info');
    const soundBtn = document.getElementById('btn-home-sound');
    const achBtn = document.getElementById('btn-home-achievements');
    const veryHardBtn = document.getElementById('btn-home-veryhard');
    const statsBtn = document.getElementById('btn-home-stats');
    const loginBtn = document.getElementById('btn-home-login');

    playBtn?.addEventListener('click', () => this.callbacks.onPlay());
    infoBtn?.addEventListener('click', () => this.callbacks.onOpenInstructions());
    soundBtn?.addEventListener('click', () => this.callbacks.onToggleSound());
    achBtn?.addEventListener('click', () => this.callbacks.onOpenAchievements());
    statsBtn?.addEventListener('click', () => this.callbacks.onOpenStats());
    loginBtn?.addEventListener('click', () => this.callbacks.onLogin?.());

    veryHardBtn?.addEventListener('click', () => {
      if (!this.isVeryHardUnlocked) {
        this.callbacks.onSelectDifficulty('VERY_HARD');
      } else {
        const next = this.currentDifficulty === 'VERY_HARD' ? 'NORMAL' : 'VERY_HARD';
        this.callbacks.onSelectDifficulty(next);
      }
    });

    const diffButtons = this.container.querySelectorAll('.diff-pill-btn');
    diffButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = (e.currentTarget as HTMLElement).getAttribute('data-mode') as DifficultyMode;
        if (mode) {
          this.callbacks.onSelectDifficulty(mode);
        }
      });
    });
  }
}
