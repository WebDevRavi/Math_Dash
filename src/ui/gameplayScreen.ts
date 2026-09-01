import { Question } from '../core/questionGenerator.ts';
import { TimerWarningState } from '../core/timer.ts';
import { DifficultyMode } from '../core/difficulty.ts';

export interface GameplayScreenCallbacks {
  onSelectAnswer: (choiceIndex: 0 | 1) => void;
  onActivateTimeBonus: () => void;
  onExit: () => void;
}

export type GuideStep = 'ANSWER' | 'STREAK' | 'BONUS' | null;

export class GameplayScreen {
  private container: HTMLElement;
  private callbacks: GameplayScreenCallbacks;
  private focusedIndex: 0 | 1 | null = null;
  private isAnsweringDisabled: boolean = false;
  private activeDifficulty: DifficultyMode = 'NORMAL';

  // Cached DOM references
  private levelEl!: HTMLElement;
  private diffBadgeEl!: HTMLElement;
  private timerBarInnerEl!: HTMLElement;
  private starsContainerEl!: HTMLElement;
  private equationEl!: HTMLElement;
  private btnChoice0!: HTMLButtonElement;
  private btnChoice1!: HTMLButtonElement;
  private feedbackEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private streakEl!: HTMLElement;
  private timeBonusContainerEl!: HTMLElement;
  private guideContainerEl!: HTMLElement;

  constructor(
    container: HTMLElement,
    callbacks: GameplayScreenCallbacks,
    initialDifficulty: DifficultyMode = 'NORMAL'
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.activeDifficulty = initialDifficulty;
    this.render();
  }

  private render(): void {
    const diffLabel = this.activeDifficulty.replace('_', ' ');

    this.container.innerHTML = `
      <div class="screen-gameplay" style="position: relative;">
        <!-- Top HUD -->
        <div class="game-hud-top">
          <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 2px;">
            <div class="hud-level chalk-underline" id="hud-level">Level 1</div>
            <div class="hud-difficulty-badge hud-diff-${this.activeDifficulty}" id="hud-diff-badge">
              MODE: ${diffLabel}
            </div>
          </div>
          
          <div class="hud-timer-area">
            <span class="timer-label">Time Left</span>
            <div class="timer-bar-outer">
              <div class="timer-bar-inner" id="timer-bar-inner" style="width: 100%;"></div>
            </div>
            <div class="game-stars-bar" id="game-stars-bar">
              ${this.renderStarsHtml(0)}
            </div>
          </div>

          <button class="hud-exit-btn" id="btn-hud-exit" title="Exit Game" aria-label="Exit Game">✕</button>
        </div>

        <!-- Center Math Question Area -->
        <div class="game-question-area" style="position: relative;">
          <div class="question-equation" id="question-equation">...</div>

          <div class="game-answers-container" id="game-answers-container" style="position: relative;">
            <button class="answer-btn" id="answer-btn-0" aria-label="Answer Option 1">--</button>
            <button class="answer-btn" id="answer-btn-1" aria-label="Answer Option 2">--</button>
          </div>

          <div class="feedback-banner" id="game-feedback-banner"></div>
        </div>

        <!-- Bottom HUD: Score, Streak, Time Bonus -->
        <div class="game-hud-bottom" style="position: relative;">
          <div class="hud-bottom-item align-left">
            <span class="bottom-stat-label">Score</span>
            <div class="bottom-stat-val chalk-yellow">
              <span id="stat-score-val">0</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; opacity: 0.85;">
                <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"></path>
                <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
              </svg>
            </div>
          </div>

          <div class="hud-bottom-item" id="hud-streak-item" style="position: relative;">
            <span class="bottom-stat-label">Streak</span>
            <div class="bottom-stat-val chalk-orange" id="stat-streak-val">x0</div>
          </div>

          <div class="hud-bottom-item align-right" id="hud-bonus-item" style="position: relative;">
            <span class="bottom-stat-label">Time Bonus</span>
            <div class="time-bonus-charge-btn" id="time-bonus-btn" title="Click or Press SPACE for +5s Bonus!">
              <svg class="lightning-bolt" id="bolt-0" viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <svg class="lightning-bolt" id="bolt-1" viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <svg class="lightning-bolt" id="bolt-2" viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
          </div>
        </div>

        <!-- First-Time Player Guide Hand Overlay -->
        <div id="game-guide-layer" style="position: absolute; inset: 0; pointer-events: none; z-index: 100;"></div>
      </div>
    `;

    // Cache elements
    this.levelEl = document.getElementById('hud-level')!;
    this.diffBadgeEl = document.getElementById('hud-diff-badge')!;
    this.timerBarInnerEl = document.getElementById('timer-bar-inner')!;
    this.starsContainerEl = document.getElementById('game-stars-bar')!;
    this.equationEl = document.getElementById('question-equation')!;
    this.btnChoice0 = document.getElementById('answer-btn-0') as HTMLButtonElement;
    this.btnChoice1 = document.getElementById('answer-btn-1') as HTMLButtonElement;
    this.feedbackEl = document.getElementById('game-feedback-banner')!;
    this.scoreEl = document.getElementById('stat-score-val')!;
    this.streakEl = document.getElementById('stat-streak-val')!;
    this.timeBonusContainerEl = document.getElementById('time-bonus-btn')!;
    this.guideContainerEl = document.getElementById('game-guide-layer')!;

    this.attachEvents();
  }

  private attachEvents(): void {
    document.getElementById('btn-hud-exit')?.addEventListener('click', () => {
      this.callbacks.onExit();
    });

    this.btnChoice0.addEventListener('click', () => {
      if (this.isAnsweringDisabled) return;
      this.hideGuide();
      this.callbacks.onSelectAnswer(0);
    });

    this.btnChoice1.addEventListener('click', () => {
      if (this.isAnsweringDisabled) return;
      this.hideGuide();
      this.callbacks.onSelectAnswer(1);
    });

    this.timeBonusContainerEl.addEventListener('click', () => {
      this.hideGuide();
      this.callbacks.onActivateTimeBonus();
    });
  }

  public setDifficulty(mode: DifficultyMode): void {
    this.activeDifficulty = mode;
    const diffLabel = mode.replace('_', ' ');
    if (this.diffBadgeEl) {
      this.diffBadgeEl.textContent = `MODE: ${diffLabel}`;
      this.diffBadgeEl.className = `hud-difficulty-badge hud-diff-${mode}`;
    }
  }

  public setQuestion(question: Question): void {
    this.isAnsweringDisabled = false;
    this.focusedIndex = null; // Fix: Ensure NO option starts focused or glowing

    this.equationEl.textContent = question.equationText;
    this.btnChoice0.textContent = question.choices[0].toString();
    this.btnChoice1.textContent = question.choices[1].toString();

    // CRITICAL FIX: Both options start completely NORMAL (no 'focused', no 'correct', no 'wrong')
    this.btnChoice0.className = 'answer-btn';
    this.btnChoice1.className = 'answer-btn';
    this.feedbackEl.textContent = '';
    this.feedbackEl.className = 'feedback-banner';
  }

  public handleKeyInput(e: KeyboardEvent): boolean {
    if (this.isAnsweringDisabled) return false;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === '1') {
      this.hideGuide();
      this.focusedIndex = 0;
      this.updateKeyboardFocus();
      if (e.key === '1') {
        this.callbacks.onSelectAnswer(0);
      }
      return true;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === '2') {
      this.hideGuide();
      this.focusedIndex = 1;
      this.updateKeyboardFocus();
      if (e.key === '2') {
        this.callbacks.onSelectAnswer(1);
      }
      return true;
    }

    if (e.key === 'Enter') {
      if (this.focusedIndex !== null) {
        this.hideGuide();
        this.callbacks.onSelectAnswer(this.focusedIndex);
        return true;
      }
    }

    if (e.key === ' ' || e.code === 'Space') {
      this.hideGuide();
      this.callbacks.onActivateTimeBonus();
      return true;
    }

    return false;
  }

  private updateKeyboardFocus(): void {
    if (this.focusedIndex === 0) {
      this.btnChoice0.classList.add('focused');
      this.btnChoice1.classList.remove('focused');
    } else if (this.focusedIndex === 1) {
      this.btnChoice0.classList.remove('focused');
      this.btnChoice1.classList.add('focused');
    } else {
      this.btnChoice0.classList.remove('focused');
      this.btnChoice1.classList.remove('focused');
    }
  }

  public showAnswerFeedback(
    selectedIndex: 0 | 1,
    isCorrect: boolean,
    streak: number,
    isLevelUp: boolean = false
  ): void {
    this.isAnsweringDisabled = true;
    this.hideGuide();

    const targetBtn = selectedIndex === 0 ? this.btnChoice0 : this.btnChoice1;
    const otherBtn = selectedIndex === 0 ? this.btnChoice1 : this.btnChoice0;

    // Remove any focus class
    this.btnChoice0.classList.remove('focused');
    this.btnChoice1.classList.remove('focused');

    if (isCorrect) {
      targetBtn.className = 'answer-btn correct';
      otherBtn.className = 'answer-btn';

      if (isLevelUp) {
        this.feedbackEl.textContent = '⚡ LEVEL UP! ⚡';
        this.feedbackEl.className = 'feedback-banner correct anim-pop';
      } else {
        this.feedbackEl.textContent = `✓ Correct! ${streak > 1 ? `(${streak} Streak)` : ''}`;
        this.feedbackEl.className = 'feedback-banner correct anim-pop';
      }
    } else {
      targetBtn.className = 'answer-btn wrong';
      otherBtn.className = 'answer-btn';

      this.feedbackEl.textContent = '✕ Wrong!';
      this.feedbackEl.className = 'feedback-banner wrong anim-shake';
    }
  }

  public showTimeBonusActivated(): void {
    this.feedbackEl.textContent = '⚡ +5s TIME BONUS! ⚡';
    this.feedbackEl.className = 'feedback-banner correct anim-pop';
  }

  public updateTimer(percentage: number, state: TimerWarningState): void {
    this.timerBarInnerEl.style.width = `${percentage}%`;
    this.timerBarInnerEl.className = `timer-bar-inner ${state}`;
  }

  public updateStats(data: {
    score: number;
    streak: number;
    stars: number;
    level: number;
    timeBonusCharges: number;
  }): void {
    this.scoreEl.textContent = data.score.toString();
    this.streakEl.textContent = `x${data.streak}`;
    this.levelEl.textContent = `Level ${data.level}`;

    // Update stars
    this.starsContainerEl.innerHTML = this.renderStarsHtml(data.stars);

    // Update bolts
    const bolts = [
      document.getElementById('bolt-0'),
      document.getElementById('bolt-1'),
      document.getElementById('bolt-2')
    ];

    bolts.forEach((bolt, idx) => {
      if (bolt) {
        if (idx < data.timeBonusCharges) {
          bolt.classList.add('charged');
        } else {
          bolt.classList.remove('charged');
        }
      }
    });

    if (data.timeBonusCharges > 0) {
      this.timeBonusContainerEl.classList.add('ready');
    } else {
      this.timeBonusContainerEl.classList.remove('ready');
    }
  }

  /* ----------------------------------------------------
     FIRST-TIME PLAYER HAND GUIDE SYSTEM
  ---------------------------------------------------- */
  public showGuide(step: GuideStep): void {
    if (!this.guideContainerEl || !step) {
      this.hideGuide();
      return;
    }

    if (step === 'ANSWER') {
      // Point toward the answer choices
      this.guideContainerEl.innerHTML = `
        <div class="hand-guide-wrapper anim-hand-tap" style="bottom: 85px; left: 50%; transform: translateX(-50%);">
          <div class="hand-guide-bubble">👆 Choose an answer!</div>
          <div class="hand-guide-icon">👆</div>
        </div>
      `;
    } else if (step === 'STREAK') {
      // Point toward streak indicator
      this.guideContainerEl.innerHTML = `
        <div class="hand-guide-wrapper anim-hand-tap" style="bottom: 50px; left: 50%; transform: translateX(-50%);">
          <div class="hand-guide-bubble">🔥 Build your streak!</div>
          <div class="hand-guide-icon">👆</div>
        </div>
      `;
    } else if (step === 'BONUS') {
      // Point toward Time Bonus button
      this.guideContainerEl.innerHTML = `
        <div class="hand-guide-wrapper anim-hand-tap" style="bottom: 55px; right: 24px;">
          <div class="hand-guide-bubble">⚡ Tap for +5 SEC!</div>
          <div class="hand-guide-icon">👆</div>
        </div>
      `;
    }
  }

  public hideGuide(): void {
    if (this.guideContainerEl) {
      this.guideContainerEl.innerHTML = '';
    }
  }

  private renderStarsHtml(filledCount: number): string {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= filledCount;
      html += `
        <svg class="star-icon ${isFilled ? 'filled anim-star-pop' : ''}" viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      `;
    }
    return html;
  }
}
