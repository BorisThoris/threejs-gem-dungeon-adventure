// Event-driven timer system that doesn't cause React re-renders
// This prevents UI stutters from countdowns and timers

type TimerCallback = (timeLeft: number) => void;
type TimerCompleteCallback = () => void;

interface GameTimer {
  id: string;
  duration: number;
  timeLeft: number;
  isRunning: boolean;
  intervalId: number | null;
  onTick: TimerCallback;
  onComplete: TimerCompleteCallback;
}

class GameTimerManager {
  private timers: Map<string, GameTimer> = new Map();
  private globalInterval: number | null = null;
  private isRunning = false;

  constructor() {
    this.startGlobalTimer();
  }

  // Start the global timer that updates all active timers
  private startGlobalTimer() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    this.globalInterval = window.setInterval(() => {
      this.updateAllTimers();
    }, 100); // Update every 100ms for smooth countdowns
  }

  // Stop the global timer
  private stopGlobalTimer() {
    if (this.globalInterval) {
      clearInterval(this.globalInterval);
      this.globalInterval = null;
    }
    this.isRunning = false;
  }

  // Update all active timers
  private updateAllTimers() {
    const now = Date.now();
    
    for (const [id, timer] of this.timers) {
      if (!timer.isRunning) continue;

      timer.timeLeft = Math.max(0, timer.timeLeft - 0.1);
      
      // Call the tick callback
      timer.onTick(timer.timeLeft);

      // Check if timer is complete
      if (timer.timeLeft <= 0) {
        timer.isRunning = false;
        timer.onComplete();
        
        // Remove completed timer
        this.timers.delete(id);
      }
    }

    // Stop global timer if no active timers
    if (this.timers.size === 0) {
      this.stopGlobalTimer();
    }
  }

  // Create a new timer
  createTimer(
    id: string,
    duration: number,
    onTick: TimerCallback,
    onComplete: TimerCompleteCallback
  ): void {
    // Remove existing timer with same ID
    this.removeTimer(id);

    const timer: GameTimer = {
      id,
      duration,
      timeLeft: duration,
      isRunning: true,
      intervalId: null,
      onTick,
      onComplete,
    };

    this.timers.set(id, timer);
    
    // Start global timer if not running
    if (!this.isRunning) {
      this.startGlobalTimer();
    }
  }

  // Pause a timer
  pauseTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      timer.isRunning = false;
    }
  }

  // Resume a timer
  resumeTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      timer.isRunning = true;
      if (!this.isRunning) {
        this.startGlobalTimer();
      }
    }
  }

  // Remove a timer
  removeTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      this.timers.delete(id);
      
      // Stop global timer if no active timers
      if (this.timers.size === 0) {
        this.stopGlobalTimer();
      }
    }
  }

  // Get timer info
  getTimer(id: string): { timeLeft: number; isRunning: boolean } | null {
    const timer = this.timers.get(id);
    if (!timer) return null;
    
    return {
      timeLeft: timer.timeLeft,
      isRunning: timer.isRunning,
    };
  }

  // Get all active timers
  getAllTimers(): Array<{ id: string; timeLeft: number; isRunning: boolean }> {
    return Array.from(this.timers.values()).map(timer => ({
      id: timer.id,
      timeLeft: timer.timeLeft,
      isRunning: timer.isRunning,
    }));
  }

  // Clear all timers
  clearAll(): void {
    this.timers.clear();
    this.stopGlobalTimer();
  }

  // Destroy the timer manager
  destroy(): void {
    this.clearAll();
  }
}

// Global timer manager instance
export const gameTimers = new GameTimerManager();

// Timer events for UI components to listen to
export const TIMER_EVENTS = {
  TIMER_TICK: 'timer_tick',
  TIMER_COMPLETE: 'timer_complete',
  TIMER_PAUSE: 'timer_pause',
  TIMER_RESUME: 'timer_resume',
} as const;

export type TimerEventType = typeof TIMER_EVENTS[keyof typeof TIMER_EVENTS];
