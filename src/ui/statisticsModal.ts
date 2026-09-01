import { LifetimeStats } from '../core/statistics.ts';

export class StatisticsModal {
  private container: HTMLElement;
  private onClose: () => void;
  private onReset: () => void;
  private isConfirmingReset: boolean = false;
  private resetTimeoutId: number | null = null;

  constructor(
    container: HTMLElement,
    stats: LifetimeStats,
    accuracy: number,
    onClose: () => void,
    onReset: () => void
  ) {
    this.container = container;
    this.onClose = onClose;
    this.onReset = onReset;
    this.render(stats, accuracy);
  }

  private render(stats: LifetimeStats, accuracy: number): void {
    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-header">
          <h2 class="modal-title chalk-heading">Statistics</h2>
          <button class="modal-close-btn" id="btn-close-stats" aria-label="Close Statistics">✕</button>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 10px 0;">
          <div class="stats-grid">
            <div class="stat-row">
              <span class="stat-title">Best Score:</span>
              <span class="stat-value chalk-gold">${stats.bestScore}</span>
            </div>

            <div class="stat-row">
              <span class="stat-title">Best Level:</span>
              <span class="stat-value chalk-yellow">Level ${stats.bestLevel}</span>
            </div>

            <div class="stat-row">
              <span class="stat-title">Best Streak:</span>
              <span class="stat-value chalk-orange">x${stats.bestStreak}</span>
            </div>

            <div class="stat-row">
              <span class="stat-title">Accuracy:</span>
              <span class="stat-value chalk-green">${accuracy}%</span>
            </div>

            <div class="stat-row">
              <span class="stat-title">Games Played:</span>
              <span class="stat-value chalk-white">${stats.gamesPlayed}</span>
            </div>

            <div class="stat-row">
              <span class="stat-title">Questions Solved:</span>
              <span class="stat-value chalk-white">${stats.questionsAnswered}</span>
            </div>

            <div class="stat-row">
              <span class="stat-title">Total Correct:</span>
              <span class="stat-value chalk-green">${stats.correctAnswers}</span>
            </div>

            <div class="stat-row">
              <span class="stat-title">Total Wrong:</span>
              <span class="stat-value chalk-red">${stats.wrongAnswers}</span>
            </div>

            <div class="stat-row">
              <span class="stat-title">Stars Earned:</span>
              <span class="stat-value chalk-yellow">⭐ ${stats.starsEarned}</span>
            </div>

            <div class="stat-row">
              <span class="stat-title">Time Bonuses:</span>
              <span class="stat-value chalk-yellow">⚡ ${stats.timeBonusesUsed}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(248,250,252,0.2); padding-top: 10px;">
          <button id="btn-reset-stats" style="font-family: var(--font-chalk-subheading); font-size: 15px; color: var(--chalk-red); text-decoration: underline; opacity: 0.9; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: all 0.15s ease;">
            Reset Lifetime Statistics
          </button>
          <span style="font-family: var(--font-chalk-body); font-size: 14px; color: var(--chalk-dim);">Math Dash v1.0</span>
        </div>
      </div>
    `;

    document.getElementById('btn-close-stats')?.addEventListener('click', () => this.onClose());

    const resetBtn = document.getElementById('btn-reset-stats');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!this.isConfirmingReset) {
          this.isConfirmingReset = true;
          resetBtn.textContent = '⚠️ Tap again to confirm reset';
          resetBtn.style.backgroundColor = 'rgba(248, 113, 113, 0.25)';
          resetBtn.style.border = '1px dashed var(--chalk-red)';

          if (this.resetTimeoutId !== null) {
            clearTimeout(this.resetTimeoutId);
          }
          this.resetTimeoutId = window.setTimeout(() => {
            this.isConfirmingReset = false;
            resetBtn.textContent = 'Reset Lifetime Statistics';
            resetBtn.style.backgroundColor = 'transparent';
            resetBtn.style.border = 'none';
          }, 4000);
        } else {
          if (this.resetTimeoutId !== null) {
            clearTimeout(this.resetTimeoutId);
            this.resetTimeoutId = null;
          }
          this.isConfirmingReset = false;
          this.onReset();
        }
      });
    }
  }
}
