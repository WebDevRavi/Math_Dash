import { Question } from '../core/questionGenerator.ts';
import { TimerWarningState } from '../core/timer.ts';
import { DifficultyMode } from '../core/difficulty.ts';

export interface GameplayScreenCallbacks {
  onSelectAnswer: (choiceIndex: 0 | 1) => void;
  onActivateTimeBonus: () => void;
  onPause: () => void;
}

export type GuideStep = 'ANSWER' | 'STREAK' | 'BONUS' | null;

const CYBER_DIFF_LABELS: Record<DifficultyMode, string> = {
  EASY: 'PROXY',
  NORMAL: 'FIREWALL',
  HARD: 'MAINFRAME',
  VERY_HARD: 'BLACK ICE'
};

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
    const diffLabel = CYBER_DIFF_LABELS[this.activeDifficulty] || this.activeDifficulty;

    this.container.innerHTML = `
      <div class="screen-gameplay" style="position: relative;">
        <!-- Top HUD -->
        <div class="game-hud-top cyber-hud-top">
          <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 3px;">
            <div class="hud-level cyber-underline" id="hud-level">SECTOR 01</div>
            <div class="hud-difficulty-badge hud-diff-${this.activeDifficulty}" id="hud-diff-badge">
              PROTOCOL: ${diffLabel}
            </div>
          </div>
          
          <div class="hud-timer-area cyber-timer-area">
            <span class="timer-label cyber-mono">COUNTER-TRACE</span>
            <div class="timer-bar-outer cyber-timer-outer">
              <div class="timer-bar-inner" id="timer-bar-inner" style="width: 100%;"></div>
            </div>
            <div class="game-stars-bar cyber-stars-bar" id="game-stars-bar">
              ${this.renderStarsHtml(0)}
            </div>
          </div>

          <button class="hud-pause-btn cyber-pause-btn" id="btn-hud-pause" title="Pause Protocol" aria-label="Pause Protocol">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1.5"></rect>
              <rect x="14" y="4" width="4" height="16" rx="1.5"></rect>
            </svg>
          </button>
        </div>

        <!-- Center Decryption Area -->
        <div class="game-question-area cyber-question-area" style="position: relative;">
          <div class="equation-container">
            <span class="equation-prompt cyber-mono">DECRYPT SECURITY KEY //</span>
            <div class="question-equation cyber-number" id="question-equation">...</div>
          </div>

          <div class="game-answers-container" id="game-answers-container" style="position: relative;">
            <button class="answer-btn cyber-node-btn" id="answer-btn-0" aria-label="Node Alpha">
              <span class="node-tag cyber-mono">NODE α</span>
              <span class="answer-val" id="answer-val-0">--</span>
              <span class="answer-key-hint">[1] or [←]</span>
            </button>
            <button class="answer-btn cyber-node-btn" id="answer-btn-1" aria-label="Node Beta">
              <span class="node-tag cyber-mono">NODE β</span>
              <span class="answer-val" id="answer-val-1">--</span>
              <span class="answer-key-hint">[2] or [→]</span>
            </button>
          </div>

          <div class="feedback-banner cyber-feedback-banner" id="game-feedback-banner"></div>
        </div>

        <!-- Bottom HUD: Score, Streak, Overclock Surge -->
        <div class="game-hud-bottom cyber-hud-bottom" style="position: relative;">
          <div class="hud-bottom-item align-left">
            <span class="bottom-stat-label cyber-mono">DATA EXTRACTED</span>
            <div class="bottom-stat-val neon-cyan">
              <span id="stat-score-val">0</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; opacity: 0.9;">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
          </div>

          <div class="hud-bottom-item" id="hud-streak-item" style="position: relative;">
            <span class="bottom-stat-label cyber-mono">NEURAL STREAK</span>
            <div class="bottom-stat-val neon-green" id="stat-streak-val">x0</div>
          </div>

          <div class="hud-bottom-item align-right" id="hud-bonus-item" style="position: relative;">
            <span class="bottom-stat-label cyber-mono">OVERCLOCK</span>
            <div class="time-bonus-charge-btn cyber-overclock-btn" id="time-bonus-btn" title="Inject +3s Overclock! [SPACE]">
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
            <span class="time-bonus-key-hint cyber-mono">[SPACE]</span>
          </div>
        </div>

        <!-- First-Time Player Guide Overlay -->
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

    document.getElementById('btn-hud-pause')?.addEventListener('click', () => {
      this.callbacks.onPause();
    });
  }

  public setDifficultyBadge(mode: DifficultyMode): void {
    this.activeDifficulty = mode;
    const diffLabel = CYBER_DIFF_LABELS[mode] || mode;
    if (this.diffBadgeEl) {
      this.diffBadgeEl.textContent = `PROTOCOL: ${diffLabel}`;
      this.diffBadgeEl.className = `hud-difficulty-badge hud-diff-${mode}`;
    }
  }

  public setQuestion(question: Question): void {
    this.isAnsweringDisabled = false;
    this.focusedIndex = null;

    this.equationEl.textContent = question.equationText;
    const val0 = document.getElementById('answer-val-0');
    const val1 = document.getElementById('answer-val-1');
    if (val0) val0.textContent = question.choices[0].toString();
    if (val1) val1.textContent = question.choices[1].toString();

    // Dynamically adjust font-size if choice is 3 digits or longer
    if (val0) val0.style.fontSize = question.choices[0] >= 100 ? '42px' : '';
    if (val1) val1.style.fontSize = question.choices[1] >= 100 ? '42px' : '';

    this.btnChoice0.className = 'answer-btn cyber-node-btn';
    this.btnChoice1.className = 'answer-btn cyber-node-btn';
    this.feedbackEl.textContent = '';
    this.feedbackEl.className = 'feedback-banner cyber-feedback-banner';
  }

  public handleKeyInput(e: KeyboardEvent): boolean {
    if (this.isAnsweringDisabled) return false;

    const isLeftKey = e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === '1' || e.code === 'Numpad1' || e.key === 'a' || e.key === 'A';
    const isRightKey = e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === '2' || e.code === 'Numpad2' || e.key === 'd' || e.key === 'D';
    const isPauseKey = e.key === 'p' || e.key === 'P' || e.key === 'Escape';

    if (isPauseKey) {
      this.callbacks.onPause();
      return true;
    }

    if (isLeftKey) {
      this.hideGuide();
      this.focusedIndex = 0;
      this.updateKeyboardFocus();
      this.callbacks.onSelectAnswer(0);
      return true;
    }

    if (isRightKey) {
      this.hideGuide();
      this.focusedIndex = 1;
      this.updateKeyboardFocus();
      this.callbacks.onSelectAnswer(1);
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
    isLevelUp: boolean = false,
    penaltySec?: number
  ): void {
    this.isAnsweringDisabled = true;
    this.hideGuide();

    const targetBtn = selectedIndex === 0 ? this.btnChoice0 : this.btnChoice1;
    const otherBtn = selectedIndex === 0 ? this.btnChoice1 : this.btnChoice0;

    this.btnChoice0.classList.remove('focused');
    this.btnChoice1.classList.remove('focused');
    targetBtn.blur();
    otherBtn.blur();

    if (isCorrect) {
      targetBtn.className = 'answer-btn cyber-node-btn correct';
      otherBtn.className = 'answer-btn cyber-node-btn';

      if (isLevelUp) {
        this.feedbackEl.textContent = '⚡ SECTOR INFILTRATED! ⚡';
        this.feedbackEl.className = 'feedback-banner cyber-feedback-banner correct anim-pop';
      } else {
        this.feedbackEl.textContent = `✓ NODE DECRYPTED! ${streak > 1 ? `(STREAK x${streak})` : ''}`;
        this.feedbackEl.className = 'feedback-banner cyber-feedback-banner correct anim-pop';
      }
    } else {
      targetBtn.className = 'answer-btn cyber-node-btn wrong';
      otherBtn.className = 'answer-btn cyber-node-btn';

      const penaltyText = penaltySec ? ` (-${penaltySec}s)` : '';
      this.feedbackEl.textContent = `✕ FIREWALL BLOCKED!${penaltyText}`;
      this.feedbackEl.className = 'feedback-banner cyber-feedback-banner wrong anim-shake';
    }
  }

  public showTimeBonusActivated(): void {
    this.feedbackEl.textContent = '⚡ OVERCLOCK INJECTED! +3s ⚡';
    this.feedbackEl.className = 'feedback-banner cyber-feedback-banner correct anim-pop';
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
    this.levelEl.textContent = `SECTOR ${data.level < 10 ? '0' : ''}${data.level}`;

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

  public showGuide(step: GuideStep): void {
    if (!this.guideContainerEl || !step) {
      this.hideGuide();
      return;
    }

    if (step === 'ANSWER') {
      this.guideContainerEl.innerHTML = `
        <div class="hand-guide-wrapper anim-hand-tap" style="bottom: 85px; left: 50%; transform: translateX(-50%);">
          <div class="hand-guide-bubble cyber-guide-bubble">👆 DECRYPT NODE</div>
          <div class="hand-guide-icon">👆</div>
        </div>
      `;
    } else if (step === 'STREAK') {
      this.guideContainerEl.innerHTML = `
        <div class="hand-guide-wrapper anim-hand-tap" style="bottom: 50px; left: 50%; transform: translateX(-50%);">
          <div class="hand-guide-bubble cyber-guide-bubble">🔥 CHARGE OVERCLOCK</div>
          <div class="hand-guide-icon">👆</div>
        </div>
      `;
    } else if (step === 'BONUS') {
      this.guideContainerEl.innerHTML = `
        <div class="hand-guide-wrapper anim-hand-tap" style="bottom: 55px; right: 24px;">
          <div class="hand-guide-bubble cyber-guide-bubble">⚡ INJECT +3s</div>
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
