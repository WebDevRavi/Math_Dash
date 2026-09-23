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
      <div class="modal-overlay cyber-modal-overlay">
        <div class="modal-header cyber-modal-header">
          <h2 class="modal-title cyber-heading neon-cyan">NETRUNNER PROTOCOL // BRIEFING</h2>
          <button class="modal-close-btn cyber-close-btn" id="btn-close-instructions" aria-label="Close Briefing">✕</button>
        </div>

        <div class="instructions-grid">
          <!-- Column 1 -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <!-- 1. Decrypt -->
            <div class="instruction-block cyber-block">
              <div class="instruction-title cyber-subheading neon-cyan">1. Decrypt Security Keys</div>
              <div class="instruction-desc">Calculate each firewall checksum and lock onto the correct security node before the trace counter runs dry.</div>
              <div class="instruction-demo-box cyber-demo-box">
                <span style="font-family: var(--font-cyber-display); font-size: 22px; font-weight: 700; color: var(--cyber-white);">14 + 18 = ?</span>
                <div style="display: flex; gap: 14px;">
                  <span style="width: 44px; height: 44px; border-radius: 8px; border: 2px solid var(--cyber-green); box-shadow: 0 0 12px var(--cyber-green-glow); display: flex; align-items: center; justify-content: center; font-family: var(--font-cyber-display); font-weight: 800; color: var(--cyber-green);">32</span>
                  <span style="width: 44px; height: 44px; border-radius: 8px; border: 2px dashed rgba(240,246,252,0.4); display: flex; align-items: center; justify-content: center; font-family: var(--font-cyber-display); font-weight: 700; color: var(--cyber-dim);">28</span>
                </div>
              </div>
            </div>

            <!-- 2. Controls -->
            <div class="instruction-block cyber-block">
              <div class="instruction-title cyber-subheading neon-cyan">2. Neural Inputs</div>
              <div class="instruction-desc">
                • <strong>Mouse / Touch:</strong> Click or tap a node.<br />
                • <strong>Keyboard:</strong> <strong>[1] / [2]</strong> or <strong>[←] / [→]</strong> keys.<br />
                • <strong>Trace Penalty:</strong> Rejections deduct <strong>-2 seconds</strong> from your counter-trace!
              </div>
            </div>

            <!-- Security Rating -->
            <div style="display: flex; align-items: center; gap: 10px; margin-top: auto; border-top: 1px dashed rgba(0,240,255,0.25); padding-top: 8px;">
              <span style="font-size: 26px;">⭐</span>
              <span class="instruction-desc" style="font-size: 14px;">Attain up to <strong>5 Stars</strong> based on decryption speed and trace efficiency!</span>
            </div>
          </div>

          <!-- Column 2 -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <!-- 3. Streak & Overclock -->
            <div class="instruction-block cyber-block">
              <div class="instruction-title cyber-subheading neon-yellow">3. Overclock Charging</div>
              <div class="instruction-desc">Execute 3 consecutive rapid decryptions to fully prime your <strong>⚡ Overclock Surge</strong>!</div>
              <div class="instruction-demo-box cyber-demo-box">
                <span style="color: var(--cyber-green); font-weight: bold; font-family: var(--font-cyber-code); font-size: 13px;">✓ 3 RAPID NODES</span>
                <span style="color: var(--cyber-yellow); font-size: 18px; font-family: var(--font-cyber-display);">➔ OVERCLOCK READY!</span>
              </div>
            </div>

            <!-- 4. Inject Overclock -->
            <div class="instruction-block cyber-block">
              <div class="instruction-title cyber-subheading neon-yellow">4. Inject Overclock</div>
              <div class="instruction-desc">
                Click <strong>⚡ OVERCLOCK</strong> or hit <strong>SPACEBAR</strong> to instantly inject <strong>+3 Seconds</strong> into your buffer!
              </div>
            </div>

            <!-- 5. Black ICE Protocol -->
            <div class="instruction-block cyber-block">
              <div class="instruction-title cyber-subheading neon-magenta">5. Black ICE Protocol</div>
              <div class="instruction-desc">Earn 5 Netrunner badges to unlock access to the ultimate high-speed <strong>Black ICE</strong> protocol.</div>
            </div>

            <!-- Footer -->
            <div style="display: flex; align-items: center; gap: 8px; margin-top: auto; border-top: 1px dashed rgba(0,240,255,0.25); padding-top: 8px;">
              <span style="color: var(--cyber-cyan); font-size: 18px;">⚡</span>
              <span class="instruction-desc cyber-mono" style="color: var(--cyber-cyan); font-weight: bold; font-size: 13px;">NEURAL LINK ARMED // CREATED BY RAVI SOLANKI</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-instructions')?.addEventListener('click', () => this.onClose());
  }
}
