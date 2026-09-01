import { DifficultyMode } from '../core/difficulty.ts';

export interface HomeScreenCallbacks {
  onPlay: () => void;
  onOpenInstructions: () => void;
  onToggleSound: () => void;
  onOpenAchievements: () => void;
  onSelectDifficulty: (mode: DifficultyMode) => void;
  onOpenStats: () => void;
}

export class HomeScreen {
  private container: HTMLElement;
  private callbacks: HomeScreenCallbacks;
  private isSoundOn: boolean;
  private isVeryHardUnlocked: boolean;
  private currentDifficulty: DifficultyMode;

  constructor(
    container: HTMLElement,
    callbacks: HomeScreenCallbacks,
    initialState: {
      isSoundOn: boolean;
      isVeryHardUnlocked: boolean;
      currentDifficulty: DifficultyMode;
    }
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.isSoundOn = initialState.isSoundOn;
    this.isVeryHardUnlocked = initialState.isVeryHardUnlocked;
    this.currentDifficulty = initialState.currentDifficulty;
    this.render();
  }

  public updateState(state: {
    isSoundOn?: boolean;
    isVeryHardUnlocked?: boolean;
    currentDifficulty?: DifficultyMode;
  }): void {
    if (state.isSoundOn !== undefined) this.isSoundOn = state.isSoundOn;
    if (state.isVeryHardUnlocked !== undefined) this.isVeryHardUnlocked = state.isVeryHardUnlocked;
    if (state.currentDifficulty !== undefined) this.currentDifficulty = state.currentDifficulty;
    this.render();
  }

  private render(): void {
    const modes: DifficultyMode[] = ['EASY', 'NORMAL', 'HARD', 'VERY_HARD'];

    this.container.innerHTML = `
      <div class="screen-home anim-fade">
        <!-- Top Utility Bar: Info & Sound -->
        <div class="home-top-bar">
          <button class="icon-btn" id="btn-home-info" title="Instructions & How to Play" aria-label="Instructions">
            i
          </button>
          <button class="icon-btn" id="btn-home-sound" title="Toggle Sound" aria-label="Toggle Sound">
            ${this.isSoundOn ? `
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            ` : `
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            `}
          </button>
        </div>

        <!-- Brand & Title Header -->
        <div class="home-brand-area">
          <svg class="home-crown" viewBox="0 0 100 60" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 50 L20 15 L50 35 L80 15 L90 50 Z" />
            <line x1="20" y1="5" x2="20" y2="8" />
            <line x1="50" y1="18" x2="50" y2="22" />
            <line x1="80" y1="5" x2="80" y2="8" />
          </svg>

          <h1 class="home-title">
            <span class="white-text">MATH</span>
            <span class="yellow-text">DASH</span>
          </h1>

          <div class="home-tagline">
            <span class="think-fast">Think Fast. </span>
            <span class="solve-faster">Solve Faster!</span>
          </div>
        </div>

        <!-- Center Large PLAY Button -->
        <div class="home-center-play">
          <button class="home-play-btn anim-pop" id="btn-home-play" aria-label="Start Game">
            <svg viewBox="0 0 24 24">
              <polygon points="6 3 20 12 6 21 6 3"></polygon>
            </svg>
          </button>
          <span class="home-play-label">PLAY</span>
        </div>

        <!-- Difficulty Mode Selector Bar -->
        <div class="home-difficulty-bar">
          ${modes.map(mode => {
            const isLocked = mode === 'VERY_HARD' && !this.isVeryHardUnlocked;
            const isActive = this.currentDifficulty === mode;
            const label = mode === 'VERY_HARD' ? (isLocked ? 'VERY HARD 🔒' : 'VERY HARD ⚡') : mode;
            return `
              <button 
                class="diff-pill-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}" 
                data-mode="${mode}"
                ${isLocked ? 'title="Unlock 5 achievements to play Very Hard"' : ''}
              >
                ${label}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Bottom Actions: Achievements, Very Hard Toggle, Statistics -->
        <div class="home-bottom-actions">
          <div class="sub-action-item">
            <button class="sub-action-btn btn-achievements" id="btn-home-achievements" aria-label="Achievements">
              <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"></path>
                <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
              </svg>
            </button>
            <span class="sub-action-label btn-achievements">Achievements</span>
          </div>

          <div class="sub-action-item">
            <button class="sub-action-btn btn-veryhard ${this.isVeryHardUnlocked ? '' : 'locked'} ${this.currentDifficulty === 'VERY_HARD' ? 'active' : ''}" id="btn-home-veryhard" aria-label="Toggle Very Hard Mode">
              ${this.isVeryHardUnlocked ? `
                <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="13" r="8"></circle>
                  <path d="M12 9v4l2 2"></path>
                  <path d="M5 3L2 6"></path>
                  <path d="M22 6l-3-3"></path>
                  <path d="M6 13H2"></path>
                  <path d="M22 13h-4"></path>
                </svg>
              ` : `
                <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              `}
            </button>
            <span class="sub-action-label btn-veryhard">
              ${this.isVeryHardUnlocked ? (this.currentDifficulty === 'VERY_HARD' ? '⚡ VERY HARD' : 'VERY HARD') : 'LOCKED 🔒'}
            </span>
          </div>

          <div class="sub-action-item">
            <button class="sub-action-btn btn-stats" id="btn-home-stats" aria-label="Statistics">
              <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </button>
            <span class="sub-action-label btn-stats">Statistics</span>
          </div>
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

    playBtn?.addEventListener('click', () => this.callbacks.onPlay());
    infoBtn?.addEventListener('click', () => this.callbacks.onOpenInstructions());
    soundBtn?.addEventListener('click', () => this.callbacks.onToggleSound());
    achBtn?.addEventListener('click', () => this.callbacks.onOpenAchievements());
    statsBtn?.addEventListener('click', () => this.callbacks.onOpenStats());

    veryHardBtn?.addEventListener('click', () => {
      if (!this.isVeryHardUnlocked) {
        this.callbacks.onSelectDifficulty('VERY_HARD'); // will trigger locked audio/alert
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
