export type GameState = 
  | 'BOOT'
  | 'HOME'
  | 'INSTRUCTIONS'
  | 'TUTORIAL'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'ANSWER_FEEDBACK'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'STATISTICS'
  | 'ACHIEVEMENTS'
  | 'SETTINGS';

export type StateChangeCallback = (newState: GameState, prevState: GameState) => void;

export class StateMachine {
  private currentState: GameState = 'BOOT';
  private listeners: StateChangeCallback[] = [];

  constructor(initialState: GameState = 'BOOT') {
    this.currentState = initialState;
  }

  public getState(): GameState {
    return this.currentState;
  }

  public setState(newState: GameState): void {
    if (this.currentState === newState) return;
    const prev = this.currentState;
    this.currentState = newState;
    this.notify(newState, prev);
  }

  public onStateChange(cb: StateChangeCallback): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify(newState: GameState, prevState: GameState): void {
    for (const listener of this.listeners) {
      try {
        listener(newState, prevState);
      } catch (err) {
        console.error('State change listener error:', err);
      }
    }
  }
}
