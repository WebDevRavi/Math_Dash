export class InstructionsScreen {
  private container: HTMLElement;
  private onClose: () => void;

  constructor(container: HTMLElement, onClose: () => void) {
    this.container = container;
    this.onClose = onClose;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-header">
          <h2 class="modal-title chalk-heading">Instructions</h2>
          <button class="modal-close-btn" id="btn-close-instructions" aria-label="Close Instructions">✕</button>
        </div>

        <div class="instructions-grid">
          <!-- Column 1 -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <!-- 1. Solve -->
            <div class="instruction-block">
              <div class="instruction-title">1. Solve the math problems</div>
              <div class="instruction-desc">Read each equation and choose the correct answer before time expires.</div>
              <div class="instruction-demo-box">
                <span style="font-family: var(--font-chalk-display); font-size: 24px; font-weight: 700;">8 + 7 = ?</span>
                <div style="display: flex; gap: 16px;">
                  <span style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--chalk-green); box-shadow: 0 0 10px var(--chalk-green-glow); display: flex; align-items: center; justify-content: center; font-family: var(--font-chalk-display); font-weight: 700; color: var(--chalk-green);">15</span>
                  <span style="width: 44px; height: 44px; border-radius: 50%; border: 2px dashed rgba(248,250,252,0.6); display: flex; align-items: center; justify-content: center; font-family: var(--font-chalk-display); font-weight: 700;">17</span>
                </div>
              </div>
            </div>

            <!-- 2. Controls -->
            <div class="instruction-block">
              <div class="instruction-title">2. Choose an answer</div>
              <div class="instruction-desc">
                • <strong>Mouse / Touch:</strong> Click or tap an answer.<br />
                • <strong>Keyboard:</strong> Use <strong>← / →</strong> arrow keys to select, then press <strong>ENTER</strong> to submit.
              </div>
            </div>

            <!-- Stars & Motivation -->
            <div style="display: flex; align-items: center; gap: 10px; margin-top: auto; border-top: 1px dashed rgba(248,250,252,0.2); padding-top: 8px;">
              <span style="font-size: 28px;">⭐</span>
              <span class="instruction-desc" style="font-size: 15px;">Earn up to <strong>5 Stars</strong> based on your score, speed, and accuracy!</span>
            </div>
          </div>

          <!-- Column 2 -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <!-- 3. Streak & Time Bonus -->
            <div class="instruction-block">
              <div class="instruction-title">3. Streak & Time Bonus</div>
              <div class="instruction-desc">Answer quickly and correctly 3 times in a row to charge a <strong>⚡ Time Bonus</strong>!</div>
              <div class="instruction-demo-box">
                <span style="color: var(--chalk-green); font-weight: bold;">✓ 3 Fast Answers</span>
                <span style="color: var(--chalk-yellow); font-size: 22px;">➔ ⚡ Time Bonus Ready!</span>
              </div>
            </div>

            <!-- 4. Activate Time Bonus -->
            <div class="instruction-block">
              <div class="instruction-title">4. Activate Time Bonus</div>
              <div class="instruction-desc">
                Click the <strong>⚡ Time Bonus</strong> or press <strong>SPACE</strong> to add <strong>+3 Seconds</strong> to your clock!
              </div>
            </div>

            <!-- 5. Achievements & Very Hard Mode -->
            <div class="instruction-block">
              <div class="instruction-title">5. Achievements & Very Hard Mode</div>
              <div class="instruction-desc">Complete achievements to prove your mastery and unlock the intense <strong>Very Hard Mode</strong>!</div>
            </div>

            <!-- Motivational Footer -->
            <div style="display: flex; align-items: center; gap: 8px; margin-top: auto; border-top: 1px dashed rgba(248,250,252,0.2); padding-top: 8px;">
              <span style="color: var(--chalk-red); font-size: 22px;">❤️</span>
              <span class="instruction-desc" style="color: var(--chalk-yellow); font-weight: bold;">Have Fun, Think Fast and Become a Math Master!</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-instructions')?.addEventListener('click', () => this.onClose());
  }
}
