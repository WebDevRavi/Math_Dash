import { ScoreSummary } from '../core/scoring.ts';

export interface GameOverScreenCallbacks {
  onHome: () => void;
  onRestart: () => void;
}

export class GameOverScreen {
  private container: HTMLElement;
  private callbacks: GameOverScreenCallbacks;

  constructor(
    container: HTMLElement,
    callbacks: GameOverScreenCallbacks,
    data: {
      summary: ScoreSummary;
      level: number;
      isNewBest: boolean;
    }
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.render(data);
  }

  private render(data: {
    summary: ScoreSummary;
    level: number;
    isNewBest: boolean;
  }): void {
    const tallyHtml = this.generateTallyMarksHtml(data.summary.correctCount);

    this.container.innerHTML = `
      <div class="screen-game-over anim-fade">
        <!-- Title & Score Header -->
        <div class="game-over-summary-header">
          <h1 class="game-over-title">Game Over</h1>
          
          <div class="game-over-score-row">
            <span class="chalk-white">Score:</span>
            <span class="chalk-yellow">${data.summary.score}</span>
            ${data.isNewBest ? '<span class="chalk-gold anim-pop" style="font-size: 20px; border: 1px dashed var(--chalk-gold); border-radius: 6px; padding: 2px 6px; margin-left: 6px;">NEW BEST!</span>' : ''}
          </div>

          <div class="game-over-star-divider">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>

          <div class="game-over-level-row">
            <span class="chalk-white">Level:</span>
            <span class="chalk-yellow">${data.level}</span>
          </div>
        </div>

        <!-- Chalk Tally Marks Container -->
        <div class="tally-marks-container">
          ${tallyHtml}
        </div>

        <!-- Scorecard Box matching Reference @image6 -->
        <div class="game-over-scorecard">
          <!-- Col 1: Stars Earned -->
          <div class="scorecard-col">
            <svg class="scorecard-icon chalk-yellow" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span class="scorecard-val chalk-yellow">${data.summary.starsEarned}</span>
            <span class="scorecard-label">Stars Earned</span>
          </div>

          <!-- Col 2: Correct -->
          <div class="scorecard-col">
            <svg class="scorecard-icon chalk-green" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="scorecard-val chalk-green">${data.summary.correctCount}</span>
            <span class="scorecard-label">Correct</span>
          </div>

          <!-- Col 3: Wrong -->
          <div class="scorecard-col">
            <svg class="scorecard-icon chalk-red" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span class="scorecard-val chalk-red">${data.summary.wrongCount}</span>
            <span class="scorecard-label">Wrong</span>
          </div>

          <!-- Col 4: Time Left -->
          <div class="scorecard-col">
            <svg class="scorecard-icon chalk-blue" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="13" r="8"></circle>
              <path d="M12 9v4l2 2"></path>
              <path d="M5 3L2 6"></path>
              <path d="M22 6l-3-3"></path>
            </svg>
            <span class="scorecard-val chalk-blue">0s</span>
            <span class="scorecard-label">Time Left</span>
          </div>
        </div>

        <!-- Action Buttons: Home & Restart -->
        <div class="game-over-actions">
          <div class="game-over-btn-item">
            <button class="game-over-btn" id="btn-gameover-home" title="Main Menu" aria-label="Main Menu">
              <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </button>
            <span class="sub-action-label chalk-white">Home</span>
          </div>

          <div class="game-over-btn-item">
            <button class="game-over-btn" id="btn-gameover-restart" title="Restart Game" aria-label="Restart Game">
              <svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
            </button>
            <span class="sub-action-label chalk-white">Restart</span>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-gameover-home')?.addEventListener('click', () => {
      this.callbacks.onHome();
    });

    document.getElementById('btn-gameover-restart')?.addEventListener('click', () => {
      this.callbacks.onRestart();
    });
  }

  private generateTallyMarksHtml(count: number): string {
    const fullGroups = Math.min(6, Math.floor(count / 5));
    const remainder = Math.min(4, count % 5);

    let html = '';
    for (let g = 0; g < fullGroups; g++) {
      html += `
        <div class="tally-group">
          <span class="tally-line"></span>
          <span class="tally-line"></span>
          <span class="tally-line"></span>
          <span class="tally-line"></span>
          <span class="tally-slash"></span>
        </div>
      `;
    }

    if (remainder > 0) {
      html += `<div class="tally-group">`;
      for (let r = 0; r < remainder; r++) {
        html += `<span class="tally-line"></span>`;
      }
      html += `</div>`;
    }

    if (count === 0) {
      html = `<span style="color: var(--chalk-dim); font-family: var(--font-chalk-body); font-size: 16px;">(No correct answers this round)</span>`;
    }

    return html;
  }
}
