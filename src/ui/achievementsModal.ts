import { Achievement } from '../core/achievements.ts';

export class AchievementsModal {
  private container: HTMLElement;
  private onClose: () => void;

  constructor(
    container: HTMLElement,
    achievements: Achievement[],
    isVeryHardUnlocked: boolean,
    onClose: () => void
  ) {
    this.container = container;
    this.onClose = onClose;
    this.render(achievements, isVeryHardUnlocked);
  }

  private render(achievements: Achievement[], isVeryHardUnlocked: boolean): void {
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    const cardsHtml = achievements.map(a => `
      <div class="achievement-card ${a.unlocked ? 'unlocked' : ''}">
        <div class="achievement-icon">${a.unlocked ? a.icon : '🔒'}</div>
        <div class="achievement-info">
          <div class="achievement-name ${a.unlocked ? 'chalk-yellow' : 'chalk-dim'}">
            ${a.title} ${a.unlocked ? '✓' : ''}
          </div>
          <div class="achievement-desc">${a.description}</div>
        </div>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-header">
          <div style="display: flex; align-items: baseline; gap: 14px;">
            <h2 class="modal-title chalk-heading">Achievements</h2>
            <span class="chalk-gold" style="font-family: var(--font-chalk-subheading); font-size: 20px;">
              (${unlockedCount} / ${achievements.length} Unlocked)
            </span>
          </div>
          <button class="modal-close-btn" id="btn-close-achievements" aria-label="Close Achievements">✕</button>
        </div>

        <div style="margin-bottom: 10px; padding: 6px 12px; border-radius: 8px; background: rgba(251, 191, 36, 0.15); border: 1px dashed var(--chalk-gold); display: flex; align-items: center; justify-content: space-between;">
          <span style="font-family: var(--font-chalk-subheading); font-size: 16px; color: var(--chalk-white);">
            🏆 Unlock 5 Achievements to unlock <strong>VERY HARD MODE</strong>!
          </span>
          <span style="font-family: var(--font-chalk-heading); font-size: 16px; color: ${isVeryHardUnlocked ? 'var(--chalk-green)' : 'var(--chalk-orange)'};">
            ${isVeryHardUnlocked ? 'UNLOCKED ✓' : `${Math.max(0, 5 - unlockedCount)} more needed`}
          </span>
        </div>

        <div class="achievements-list">
          ${cardsHtml}
        </div>
      </div>
    `;

    document.getElementById('btn-close-achievements')?.addEventListener('click', () => this.onClose());
  }
}
