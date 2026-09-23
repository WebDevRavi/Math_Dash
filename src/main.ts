import './styles/reset.css';
import './styles/typography.css';
import './styles/chalkboard.css';
import './styles/animations.css';
import './styles/screens.css';

import { StateMachine, GameState } from './core/stateMachine.ts';
import { QuestionGenerator, Question } from './core/questionGenerator.ts';
import { GameTimer, TimerTickData } from './core/timer.ts';
import { ScoreManager } from './core/scoring.ts';
import { StreakManager } from './core/streak.ts';
import { LevelProgression, DifficultyMode, DIFFICULTY_PRESETS } from './core/difficulty.ts';
import { AchievementManager } from './core/achievements.ts';
import { StatisticsManager } from './core/statistics.ts';
import { AudioService } from './audio/audioService.ts';
import { PlatformInterface, CrazyUser } from './platform/platformInterface.ts';
import { CrazyGamesAdapter } from './platform/crazygamesAdapter.ts';
import { LocalDevAdapter } from './platform/localDevAdapter.ts';
import { SaveService } from './storage/saveService.ts';
import { GAME_CONFIG } from './core/config.ts';

import { OrientationOverlay } from './ui/orientationOverlay.ts';
import { GameShell } from './ui/gameShell.ts';
import { HomeScreen } from './ui/homeScreen.ts';
import { InstructionsScreen } from './ui/instructionsScreen.ts';
import { CountdownScreen } from './ui/countdownScreen.ts';
import { GameplayScreen } from './ui/gameplayScreen.ts';
import { GameOverScreen } from './ui/gameOverScreen.ts';
import { StatisticsModal } from './ui/statisticsModal.ts';
import { AchievementsModal } from './ui/achievementsModal.ts';
import { PauseModal } from './ui/pauseModal.ts';

class MathDashApp {
  private platform!: PlatformInterface;
  private saveService!: SaveService;
  private stateMachine!: StateMachine;
  private audioService!: AudioService;
  private questionGenerator!: QuestionGenerator;
  private timer!: GameTimer;
  private scoreManager!: ScoreManager;
  private streakManager!: StreakManager;
  private achievementManager!: AchievementManager;
  private statisticsManager!: StatisticsManager;

  private gameShell!: GameShell;
  private currentScreenContainer!: HTMLElement;
  private gameplayScreen: GameplayScreen | null = null;
  private countdownScreen: CountdownScreen | null = null;

  // Active game run state
  private activeDifficulty: DifficultyMode = 'NORMAL';
  private currentLevel: number = 1;
  private currentQuestion: Question | null = null;
  private bonusesUsedInRun: number = 0;
  private showInstructionsSetting: boolean = false;
  private isLastRunNewBest: boolean = false;
  private currentUser: CrazyUser | null = null;
  private orientationOverlay!: OrientationOverlay;

  // First-time onboarding state
  private tutorialCompleted: boolean = false;
  private tutorialStreakShown: boolean = false;
  private tutorialBonusShown: boolean = false;
  private isProcessingAnswer: boolean = false;

  public async init(): Promise<void> {
    // 1. Initialize Platform layer
    const isCrazyGamesEnv = typeof window !== 'undefined' && !!window.CrazyGames?.SDK;
    this.platform = isCrazyGamesEnv ? new CrazyGamesAdapter() : new LocalDevAdapter();
    await this.platform.init();
    this.platform.loadingStart();

    // Initialize Orientation Overlay (enforces mobile landscape mode)
    this.orientationOverlay = new OrientationOverlay();

    // 2. Load Save Data & Platform User
    this.saveService = new SaveService(this.platform);
    const saved = await this.saveService.load();
    this.currentUser = await this.platform.getUser();

    const initialSound = saved?.settings?.sound ?? true;
    this.showInstructionsSetting = saved?.settings?.showInstructions ?? false;
    this.tutorialCompleted = saved?.tutorialCompleted ?? false;

    // 3. Initialize Core Managers
    this.audioService = new AudioService(initialSound);

    // Sync platform muteAudio setting (CrazyGames requirement)
    this.platform.onSettingsChange((settings) => {
      this.audioService.setPlatformMuted(settings.muteAudio ?? false);
    });

    // Listen for CrazyGames user authentication
    this.platform.addAuthListener(async (user) => {
      this.currentUser = user;
      if (user) {
        this.showToast(`👤 Netrunner ID Synced: ${user.username}`);
      }
      if (this.stateMachine.getState() === 'HOME') {
        this.renderHomeScreen();
      }
    });

    this.stateMachine = new StateMachine('BOOT');
    this.questionGenerator = new QuestionGenerator();
    this.timer = new GameTimer(GAME_CONFIG.baseRoundSeconds);
    this.scoreManager = new ScoreManager();
    this.streakManager = new StreakManager();
    this.achievementManager = new AchievementManager(saved?.achievements);
    this.statisticsManager = new StatisticsManager(saved?.statistics);

    // Restore difficulty setting if unlocked
    if (saved?.settings?.difficulty) {
      const savedDiff = saved.settings.difficulty as DifficultyMode;
      if (savedDiff === 'VERY_HARD' && !this.achievementManager.isVeryHardUnlocked()) {
        this.activeDifficulty = 'NORMAL';
      } else if (DIFFICULTY_PRESETS[savedDiff]) {
        this.activeDifficulty = savedDiff;
      }
    }

    // Set callback to celebrate unlocked achievements
    this.achievementManager.setUnlockCallback((achievement) => {
      this.audioService.playLevelUp();
      this.platform.happytime();
      this.showToast(`🏆 Achievement: ${achievement.title}!`);
      this.updateCompletionPercentage();
    });

    // 4. Mount Game Shell (Wooden frame & Chalkboard)
    const appRoot = document.getElementById('app')!;
    this.gameShell = new GameShell(appRoot);
    this.currentScreenContainer = this.gameShell.getScreenContainer();

    // 5. Global Event Listeners
    this.setupGlobalEvents();

    // 6. Report progression milestone, save initial state, and complete loading
    this.updateCompletionPercentage();
    await this.saveCurrentProgress();
    this.platform.loadingStop();
    this.stateMachine.setState('HOME');
  }

  private setupGlobalEvents(): void {
    // State change handler
    this.stateMachine.onStateChange((newState) => {
      this.handleStateTransition(newState);
    });

    // Resize orientation listener
    window.addEventListener('resize', () => {
      this.orientationOverlay.checkOrientation();
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      // Audio unlock & start home music on first user gesture
      this.audioService.unlock();
      if (this.stateMachine.getState() === 'HOME') {
        this.audioService.startHomeMusic();
      }

      const state = this.stateMachine.getState();
      if (state === 'PLAYING' && this.gameplayScreen) {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          this.pauseGame();
          return;
        }
        const handled = this.gameplayScreen.handleKeyInput(e);
        if (handled) {
          e.preventDefault();
        }
      } else if (state === 'PAUSED') {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          this.resumeGame();
          e.preventDefault();
        }
      } else if (state === 'GAME_OVER') {
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          this.restartFromGameOver();
        }
      } else if (state === 'INSTRUCTIONS' || state === 'ACHIEVEMENTS' || state === 'STATISTICS') {
        if (e.key === 'Escape') {
          this.audioService.playButtonClick();
          this.stateMachine.setState('HOME');
          e.preventDefault();
        }
      } else if (state === 'HOME') {
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
          if (document.activeElement?.tagName !== 'A' && document.activeElement?.tagName !== 'BUTTON') {
            this.audioService.playButtonClick();
            this.stateMachine.setState('COUNTDOWN');
            e.preventDefault();
          }
        }
      }
    });

    // Mouse/touch audio start for home music
    window.addEventListener('pointerdown', () => {
      this.audioService.unlock();
      if (this.stateMachine.getState() === 'HOME') {
        this.audioService.startHomeMusic();
      }
    }, { once: false });

    // Page visibility / backgrounding: pause game timer and suspend audio when tab hidden (CrazyGames requirement)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.stateMachine.getState() === 'PLAYING') {
          this.pauseGame();
        } else if (this.stateMachine.getState() === 'COUNTDOWN') {
          this.stateMachine.setState('HOME');
        }
        this.audioService.suspend();
      } else {
        this.audioService.resume();
        if (this.stateMachine.getState() === 'HOME') {
          this.audioService.startHomeMusic();
        }
      }
    });
  }

  private handleStateTransition(state: GameState): void {
    // Cancel any running countdown timer before unmounting
    if (this.countdownScreen) {
      this.countdownScreen.cancel();
      this.countdownScreen = null;
    }

    this.currentScreenContainer.innerHTML = '';

    if (state === 'HOME') {
      this.audioService.startHomeMusic();
      this.renderHomeScreen();
    } else {
      this.audioService.stopHomeMusic();

      switch (state) {
        case 'INSTRUCTIONS':
          this.renderInstructionsScreen();
          break;

        case 'COUNTDOWN':
          this.renderCountdownScreen();
          break;

        case 'PLAYING':
          this.renderGameplayScreen();
          break;

        case 'PAUSED':
          this.renderPauseModal();
          break;

        case 'GAME_OVER':
          this.renderGameOverScreen();
          break;

        case 'STATISTICS':
          this.renderStatisticsModal();
          break;

        case 'ACHIEVEMENTS':
          this.renderAchievementsModal();
          break;

        default:
          break;
      }
    }
  }

  /* ----------------------------------------------------
     SCREENS RENDERING
  ---------------------------------------------------- */
  private renderHomeScreen(): void {
    this.platform.gameplayStop();
    const isVeryHardUnlocked = this.achievementManager.isVeryHardUnlocked();

    new HomeScreen(
      this.currentScreenContainer,
      {
        onPlay: () => {
          this.audioService.playButtonClick();
          if (this.showInstructionsSetting) {
            this.stateMachine.setState('INSTRUCTIONS');
          } else {
            this.stateMachine.setState('COUNTDOWN');
          }
        },
        onOpenInstructions: () => {
          this.audioService.playButtonClick();
          this.stateMachine.setState('INSTRUCTIONS');
        },
        onToggleSound: () => {
          if (this.audioService.isPlatformMutedActive()) {
            this.showToast('🔇 Audio is muted by CrazyGames settings');
            return;
          }
          const isNowOn = this.audioService.toggleSound();
          if (isNowOn) {
            this.audioService.playButtonClick();
            this.audioService.startHomeMusic();
          }
          this.saveCurrentProgress();
          this.renderHomeScreen();
        },
        onOpenAchievements: () => {
          this.audioService.playButtonClick();
          this.stateMachine.setState('ACHIEVEMENTS');
        },
        onSelectDifficulty: (mode: DifficultyMode) => {
          if (mode === 'VERY_HARD' && !isVeryHardUnlocked) {
            this.audioService.playWrong();
            this.showToast('🔒 Unlock 5 Achievements to play Very Hard mode!');
            return;
          }
          this.audioService.playButtonClick();
          this.activeDifficulty = mode;
          this.saveCurrentProgress();
          this.renderHomeScreen();
        },
        onOpenStats: () => {
          this.audioService.playButtonClick();
          this.stateMachine.setState('STATISTICS');
        },
        onLogin: async () => {
          this.audioService.playButtonClick();
          const user = await this.platform.showAuthPrompt();
          if (user) {
            this.currentUser = user;
            this.showToast(`👋 Welcome, ${user.username}!`);
            await this.saveCurrentProgress();
            this.renderHomeScreen();
          }
        }
      },
      {
        isSoundOn: this.audioService.isEnabled(),
        isVeryHardUnlocked,
        currentDifficulty: this.activeDifficulty,
        user: this.currentUser,
        showLoginChip: !this.currentUser
      }
    );
  }

  private renderInstructionsScreen(): void {
    new InstructionsScreen(this.currentScreenContainer, () => {
      this.audioService.playButtonClick();
      this.stateMachine.setState('HOME');
    });
  }

  private renderCountdownScreen(): void {
    this.countdownScreen = new CountdownScreen(
      this.currentScreenContainer,
      () => {
        // Countdown completed -> begin active gameplay!
        this.startNewRun();
      },
      () => this.audioService.playCountdownTick(),
      () => this.audioService.playGo()
    );
    this.countdownScreen.start();
  }

  private startNewRun(): void {
    this.scoreManager.reset();
    this.streakManager.reset();
    this.questionGenerator.resetHistory();
    this.bonusesUsedInRun = 0;
    this.currentLevel = 1;
    this.isProcessingAnswer = false;

    // Timer callbacks with mode-appropriate duration!
    const roundDuration = DIFFICULTY_PRESETS[this.activeDifficulty]?.timeLimitSec || GAME_CONFIG.baseRoundSeconds;
    this.timer = new GameTimer(roundDuration);
    this.timer.setCallbacks(
      (tick: TimerTickData) => {
        if (this.gameplayScreen) {
          this.gameplayScreen.updateTimer(tick.percentage, tick.state);
        }
      },
      () => {
        // Round Time Over!
        this.onRoundFinished();
      }
    );

    // Start Authoritative Gameplay on CrazyGames
    this.platform.gameplayStart();
    this.stateMachine.setState('PLAYING');

    this.timer.start();
    this.nextQuestion();

    // First time player answer guide on first ever question
    if (!this.tutorialCompleted) {
      window.setTimeout(() => {
        if (this.stateMachine.getState() === 'PLAYING') {
          this.gameplayScreen?.showGuide('ANSWER');
        }
      }, 400);
    }
  }

  private renderGameplayScreen(): void {
    this.gameplayScreen = new GameplayScreen(
      this.currentScreenContainer,
      {
        onSelectAnswer: (choiceIndex: 0 | 1) => {
          this.handleAnswerSelected(choiceIndex);
        },
        onActivateTimeBonus: () => {
          this.handleTimeBonusUsed();
        },
        onPause: () => {
          this.pauseGame();
        }
      },
      this.activeDifficulty
    );

    if (this.currentQuestion) {
      this.gameplayScreen.setQuestion(this.currentQuestion);
    }

    // Immediately restore HUD & timer bar so pause/resume doesn't wipe stats
    this.updateGameplayHud();
    if (this.timer) {
      this.timer.forceTick();
    }
  }

  private nextQuestion(): void {
    this.isProcessingAnswer = false;
    this.currentQuestion = this.questionGenerator.generate(
      this.currentLevel,
      this.activeDifficulty
    );
    this.streakManager.onNewQuestion();

    if (this.gameplayScreen) {
      this.gameplayScreen.setQuestion(this.currentQuestion);
      this.updateGameplayHud();
    }
  }

  private handleAnswerSelected(choiceIndex: 0 | 1): void {
    if (!this.currentQuestion || this.stateMachine.getState() !== 'PLAYING' || this.isProcessingAnswer) return;
    this.isProcessingAnswer = true;

    const preset = DIFFICULTY_PRESETS[this.activeDifficulty];
    const isCorrect = choiceIndex === this.currentQuestion.correctIndex;

    if (isCorrect) {
      this.audioService.playCorrect();
      const currentStreak = this.streakManager.getStreak() + 1;
      this.scoreManager.addCorrect(currentStreak, this.activeDifficulty);
      const streakResult = this.streakManager.recordCorrectAnswer(
        preset.fastThresholdMs,
        preset.fastStreakForBonus
      );

      if (streakResult.bonusReady) {
        this.audioService.playTimeBonusCharge();
      }

      // Check level up
      const currentScore = this.scoreManager.getScore();
      const newLevel = LevelProgression.getLevelForScore(currentScore);
      const isLevelUp = newLevel > this.currentLevel;
      if (isLevelUp) {
        this.currentLevel = newLevel;
        this.audioService.playLevelUp();
        this.updateCompletionPercentage();
      }

      this.gameplayScreen?.showAnswerFeedback(choiceIndex, true, streakResult.streak, isLevelUp);
      this.updateGameplayHud();

      // Onboarding Step 2: Show streak pointer
      if (!this.tutorialCompleted && !this.tutorialStreakShown && currentStreak >= 3) {
        this.tutorialStreakShown = true;
        this.gameplayScreen?.showGuide('STREAK');
        window.setTimeout(() => {
          this.gameplayScreen?.hideGuide();
        }, 2200);
      }

      // Onboarding Step 3: Show Time Bonus pointer
      if (!this.tutorialCompleted && !this.tutorialBonusShown && streakResult.bonusReady) {
        this.tutorialBonusShown = true;
        window.setTimeout(() => {
          if (this.stateMachine.getState() === 'PLAYING') {
            this.gameplayScreen?.showGuide('BONUS');
          }
        }, 300);
      }

      window.setTimeout(() => {
        if (this.stateMachine.getState() === 'PLAYING') {
          this.nextQuestion();
        }
      }, 230);
    } else {
      this.audioService.playWrong();
      this.scoreManager.addWrong();
      this.streakManager.recordWrongAnswer();

      // Deduct mode-specific wrong answer penalty from timer (3s on Hard/Black ICE, 2s on Normal)
      const penalty = preset.wrongPenaltySec || GAME_CONFIG.wrongAnswerPenaltySeconds;
      this.timer.deductSeconds(penalty);
      this.gameplayScreen?.showAnswerFeedback(choiceIndex, false, 0, false, penalty);
      this.updateGameplayHud();

      window.setTimeout(() => {
        if (this.stateMachine.getState() === 'PLAYING') {
          this.nextQuestion();
        }
      }, 300);
    }
  }

  private handleTimeBonusUsed(): void {
    if (this.stateMachine.getState() !== 'PLAYING') return;
    const consumed = this.streakManager.consumeTimeBonus();
    if (consumed) {
      this.bonusesUsedInRun++;
      this.audioService.playTimeBonusUse();
      this.timer.addBonusSeconds(GAME_CONFIG.timeBonusSeconds);
      this.gameplayScreen?.showTimeBonusActivated();
      this.updateGameplayHud();

      // Tutorial complete!
      if (!this.tutorialCompleted) {
        this.tutorialCompleted = true;
        this.saveCurrentProgress();
      }
    }
  }

  private updateGameplayHud(): void {
    if (!this.gameplayScreen) return;
    this.gameplayScreen.updateStats({
      score: this.scoreManager.getScore(),
      streak: this.streakManager.getStreak(),
      stars: this.scoreManager.calculateStars(),
      level: this.currentLevel,
      timeBonusCharges: this.streakManager.getTimeBonusCharges()
    });
  }

  private pauseGame(): void {
    if (this.stateMachine.getState() !== 'PLAYING') return;
    this.timer.pause();
    this.platform.gameplayStop();
    this.stateMachine.setState('PAUSED');
  }

  private resumeGame(): void {
    this.platform.gameplayStart();
    this.stateMachine.setState('PLAYING');
    this.timer.resume();
  }

  private renderPauseModal(): void {
    new PauseModal(
      this.currentScreenContainer,
      () => {
        this.audioService.playButtonClick();
        this.resumeGame();
      },
      () => {
        this.audioService.playButtonClick();
        this.timer.stop();
        this.platform.gameplayStop();
        this.stateMachine.setState('HOME');
      }
    );
  }

  private async onRoundFinished(): Promise<void> {
    this.timer.stop();
    this.platform.gameplayStop();
    this.audioService.playGameOver();

    const summary = this.scoreManager.getSummary();
    const streak = this.streakManager.getBestStreak();

    // 1. Update Lifetime Statistics
    const recordResult = this.statisticsManager.recordGame({
      score: summary.score,
      level: this.currentLevel,
      streak: streak,
      correct: summary.correctCount,
      wrong: summary.wrongCount,
      stars: summary.starsEarned,
      bonusesUsed: this.bonusesUsedInRun
    });
    this.isLastRunNewBest = recordResult.isNewBestScore;

    // 2. Evaluate Achievements
    this.achievementManager.evaluateRun({
      runScore: summary.score,
      runCorrect: summary.correctCount,
      runWrong: summary.wrongCount,
      runStreak: streak,
      runLevel: this.currentLevel,
      runStars: summary.starsEarned,
      runBonusesUsed: this.bonusesUsedInRun,
      totalLifetimeCorrect: this.statisticsManager.getStats().correctAnswers
    });

    // 3. Immediately render Game Over Screen to avoid perceived stall
    this.stateMachine.setState('GAME_OVER');

    // 4. Submit score to CrazyGames Leaderboards
    try {
      await this.platform.submitScore(summary.score);
    } catch (e) {
      console.warn('Leaderboard score submit error:', e);
    }

    // 5. Celebrate highscore milestone on platform if beaten
    if (this.isLastRunNewBest) {
      this.platform.happytime();
    }

    // 6. Save progress
    await this.saveCurrentProgress();
  }

  private renderGameOverScreen(): void {
    const summary = this.scoreManager.getSummary();

    new GameOverScreen(
      this.currentScreenContainer,
      {
        onHome: () => {
          this.audioService.playButtonClick();
          this.stateMachine.setState('HOME');
        },
        onRestart: () => {
          this.restartFromGameOver();
        },
        onShare: () => {
          this.audioService.playButtonClick();
          const shareText = `⚡ I extracted ${summary.score} data blocks in Cyber Hack: Overdrive! Sector ${this.currentLevel} cleared. Can you breach deeper? Created by Ravi Solanki.`;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText).then(() => {
              this.showToast('📋 Telemetry copied to clipboard!');
            }).catch(() => {
              this.showToast(`🏆 Data Record: ${summary.score}!`);
            });
          } else {
            this.showToast(`🏆 Data Record: ${summary.score}!`);
          }
        }
      },
      {
        summary,
        level: this.currentLevel,
        isNewBest: this.isLastRunNewBest
      }
    );
  }

  private updateCompletionPercentage(): void {
    try {
      const totalAchievements = 10;
      const unlockedCount = this.achievementManager.getUnlockedCount();
      const stats = this.statisticsManager.getStats();
      const bestLevel = stats.bestLevel || 1;

      // 60% weight to achievements, 40% weight to level reached (up to level 20)
      const achProgress = (unlockedCount / totalAchievements) * 60;
      const levelProgress = Math.min(40, (bestLevel / 20) * 40);
      const total = Math.min(100, Math.round(achProgress + levelProgress));

      this.platform.reportGameCompletedPercentage(total);
    } catch (err) {
      console.warn('Error reporting completion percentage:', err);
    }
  }

  private restartFromGameOver(): void {
    this.audioService.playButtonClick();
    this.stateMachine.setState('COUNTDOWN');
  }

  public showToast(message: string, durationMs: number = 2800): void {
    let container = document.getElementById('chalk-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'chalk-toast-container';
      container.className = 'chalk-toast-container cyber-toast-container';
      document.getElementById('chalkboard-surface')?.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'chalk-toast cyber-toast cyber-mono';
    toast.textContent = message;
    container.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add('fade-out');
      window.setTimeout(() => {
        toast.remove();
      }, 350);
    }, durationMs);
  }

  private renderStatisticsModal(): void {
    const stats = this.statisticsManager.getStats();
    const accuracy = this.statisticsManager.getAccuracy();

    new StatisticsModal(
      this.currentScreenContainer,
      stats,
      accuracy,
      () => {
        this.audioService.playButtonClick();
        this.stateMachine.setState('HOME');
      },
      () => {
        this.audioService.playButtonClick();
        this.statisticsManager.reset();
        this.saveCurrentProgress();
        this.renderStatisticsModal();
      }
    );
  }

  private renderAchievementsModal(): void {
    const achievements = this.achievementManager.getAll();
    const isVeryHardUnlocked = this.achievementManager.isVeryHardUnlocked();

    new AchievementsModal(
      this.currentScreenContainer,
      achievements,
      isVeryHardUnlocked,
      () => {
        this.audioService.playButtonClick();
        this.stateMachine.setState('HOME');
      }
    );
  }

  private async saveCurrentProgress(): Promise<void> {
    await this.saveService.save({
      sound: this.audioService.isEnabled(),
      showInstructions: this.showInstructionsSetting,
      difficulty: this.activeDifficulty,
      stats: this.statisticsManager.getStats(),
      achievements: this.achievementManager.serialize(),
      veryHardUnlocked: this.achievementManager.isVeryHardUnlocked(),
      tutorialCompleted: this.tutorialCompleted
    });
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new MathDashApp();
  app.init().catch(err => console.error('Cyber Hack initialization error:', err));
});
