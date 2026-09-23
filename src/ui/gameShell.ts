export class GameShell {
  private rootElement: HTMLElement;
  private screenContainer!: HTMLElement;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.render();
  }

  private render(): void {
    this.rootElement.innerHTML = `
      <div class="game-viewport">
        <div class="chalkboard-frame cyberdeck-frame" id="chalkboard-frame">
          <!-- 4 Corner Cyber Status LEDs -->
          <div class="frame-bolt bolt-tl" title="System Normal"></div>
          <div class="frame-bolt bolt-tr" title="Breach Protocol Active"></div>
          <div class="frame-bolt bolt-bl" title="Neural Link Sync"></div>
          <div class="frame-bolt bolt-br" title="Firewall Bypass"></div>

          <!-- Cyber Terminal Screen Surface -->
          <div class="chalkboard-surface cyberdeck-surface" id="chalkboard-surface">
            <!-- CRT Scanlines Overlay -->
            <div class="chalk-dust-overlay cyber-scanlines-overlay"></div>

            <!-- High-Tech Cyber Circuit & Grid SVG Background Layer -->
            <svg class="chalk-doodles-bg cyber-circuit-bg" viewBox="0 0 1200 675" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="cyberGridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.3" />
                  <stop offset="100%" stop-color="#ff0055" stop-opacity="0.1" />
                </linearGradient>
                <pattern id="hexGrid" width="40" height="40" patternUnits="userSpaceOnUse" opacity="0.12">
                  <path d="M20 0 L40 11.5 L40 34.5 L20 46 L0 34.5 L0 11.5 Z" fill="none" stroke="#00f0ff" stroke-width="0.8" />
                </pattern>
              </defs>

              <!-- Subtle Hex Grid Fill -->
              <rect width="1200" height="675" fill="url(#hexGrid)" />

              <!-- Top Left Circuit & System Specs -->
              <path d="M 40 40 L 180 40 L 220 80 L 320 80" stroke="#00f0ff" stroke-width="1.5" opacity="0.4" />
              <circle cx="320" cy="80" r="3" fill="#00f0ff" opacity="0.6" />
              <text x="45" y="32" font-family="'JetBrains Mono', monospace" font-size="11" fill="#00f0ff" opacity="0.5" letter-spacing="1.5">NETRUNNER RIG // V4.09</text>
              <text x="45" y="60" font-family="'JetBrains Mono', monospace" font-size="9" fill="#00f0ff" opacity="0.35">PORT: 8080 [TLS_AES_256]</text>

              <!-- Top Right Circuit Traces -->
              <path d="M 1160 40 L 1020 40 L 980 80 L 880 80" stroke="#ff0055" stroke-width="1.5" opacity="0.4" />
              <circle cx="880" cy="80" r="3" fill="#ff0055" opacity="0.6" />
              <text x="1000" y="32" font-family="'JetBrains Mono', monospace" font-size="11" fill="#ff0055" opacity="0.5" letter-spacing="1.5" text-anchor="end">TRACE COUNTERMEASURE</text>

              <!-- Left Side Data Stream -->
              <g opacity="0.25" font-family="'JetBrains Mono', monospace" font-size="10" fill="#00f0ff">
                <text x="40" y="240">0x7F 0x00 0x1A</text>
                <text x="40" y="260">0xA4 0x8C 0x3E</text>
                <text x="40" y="280">SYS_OVERCLOCK</text>
                <text x="40" y="300">STATUS: ACTIVE</text>
              </g>

              <!-- Right Side Memory Matrix -->
              <g opacity="0.25" font-family="'JetBrains Mono', monospace" font-size="10" fill="#00ff66">
                <text x="1100" y="240" text-anchor="end">BUFFER: OK</text>
                <text x="1100" y="260" text-anchor="end">LATENCY: 0.8ms</text>
                <text x="1100" y="280" text-anchor="end">FIREWALL: ENGAGED</text>
                <text x="1100" y="300" text-anchor="end">ENCRYPT: HYPERBOLIC</text>
              </g>

              <!-- Bottom Left Circuit Trace -->
              <path d="M 40 635 L 140 635 L 180 595 L 260 595" stroke="#00f0ff" stroke-width="1.5" opacity="0.35" />
              <circle cx="260" cy="595" r="3" fill="#00f0ff" opacity="0.5" />

              <!-- Bottom Right Circuit Trace -->
              <path d="M 1160 635 L 1060 635 L 1020 595 L 940 595" stroke="#ffb700" stroke-width="1.5" opacity="0.35" />
              <circle cx="940" cy="595" r="3" fill="#ffb700" opacity="0.5" />
            </svg>

            <!-- Dynamic Screens Container -->
            <div class="screen-container" id="screen-container"></div>
          </div>
        </div>
      </div>
    `;

    this.screenContainer = document.getElementById('screen-container') as HTMLElement;
  }

  public getScreenContainer(): HTMLElement {
    return this.screenContainer;
  }
}
