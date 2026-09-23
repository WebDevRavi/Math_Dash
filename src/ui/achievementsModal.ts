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
      <div class="achievement-card cyber-ach-card ${a.unlocked ? 'unlocked' : ''}">
        <div class="achievement-icon">${a.unlocked ? a.icon : '🔒'}</div>
        <div class="achievement-info">
          <div class="achievement-name ${a.unlocked ? 'neon-yellow' : 'neon-dim'}">
            ${a.title} ${a.unlocked ? '✓' : ''}
          </div>
          <div class="achievement-desc cyber-mono">${a.description}</div>
        </div>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="modal-overlay cyber-modal-overlay">
        <div class="modal-header cyber-modal-header">
          <div style="display: flex; align-items: baseline; gap: 14px;">
            <h2 class="modal-title cyber-heading neon-cyan">NETRUNNER BADGES</h2>
            <span class="neon-yellow cyber-mono" style="font-size: 16px;">
              [ ${unlockedCount} / ${achievements.length} DECRYPTED ]
            </span>
          </div>
          <button class="modal-close-btn cyber-close-btn" id="btn-close-achievements" aria-label="Close Badges">✕</button>
        </div>

        <div style="margin-bottom: 10px; padding: 8px 14px; border-radius: 8px; background: rgba(0, 240, 255, 0.08); border: 1px solid var(--cyber-cyan); display: flex; align-items: center; justify-content: space-between;">
          <span class="cyber-mono" style="font-size: 13px; color: var(--cyber-white);">
            ⚡ Decrypt 5 Badges to unlock classified <strong>BLACK ICE PROTOCOL</strong>!
          </span>
          <span class="cyber-mono" style="font-size: 13px; font-weight: bold; color: ${isVeryHardUnlocked ? 'var(--cyber-green)' : 'var(--cyber-yellow)'};">
            ${isVeryHardUnlocked ? 'BLACK ICE UNLOCKED ✓' : `[ ${Math.max(0, 5 - unlockedCount)} REMAINING ]`}
          </span>
        </div>

        <div class="achievements-list cyber-ach-list">
          ${cardsHtml}
        </div>
      </div>
    `;

    document.getElementById('btn-close-achievements')?.addEventListener('click', () => this.onClose());
  }
}
