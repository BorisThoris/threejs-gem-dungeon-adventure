// Hook for using event-driven timers without React re-renders
import { useState, useEffect, useCallback, useRef } from 'react';
import { gameTimers, TIMER_EVENTS } from '../utils/gameTimers';
import { gameEvents } from '../utils/gameEvents';

interface UseGameTimerProps {
  id: string;
  duration: number;
  onComplete?: () => void;
  onTick?: (timeLeft: number) => void;
  autoStart?: boolean;
}

export const useGameTimer = ({
  id,
  duration,
  onComplete,
  onTick,
  autoStart = true,
}: UseGameTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<string | null>(null);

  // Create timer callback that doesn't cause re-renders
  const handleTick = useCallback((remainingTime: number) => {
    // Update local state only when needed
    setTimeLeft(remainingTime);
    
    // Call external tick callback
    onTick?.(remainingTime);
    
    // Emit event for other components
    gameEvents.emit(TIMER_EVENTS.TIMER_TICK, { id, timeLeft: remainingTime });
  }, [id, onTick]);

  // Create completion callback
  const handleComplete = useCallback(() => {
    setIsRunning(false);
    setIsComplete(true);
    setTimeLeft(0);
    
    // Call external completion callback
    onComplete?.();
    
    // Emit event for other components
    gameEvents.emit(TIMER_EVENTS.TIMER_COMPLETE, { id });
  }, [id, onComplete]);

  // Start timer
  const start = useCallback(() => {
    if (timerRef.current) {
      gameTimers.removeTimer(timerRef.current);
    }
    
    timerRef.current = id;
    setIsRunning(true);
    setIsComplete(false);
    setTimeLeft(duration);
    
    gameTimers.createTimer(id, duration, handleTick, handleComplete);
  }, [id, duration, handleTick, handleComplete]);

  // Pause timer
  const pause = useCallback(() => {
    gameTimers.pauseTimer(id);
    setIsRunning(false);
    gameEvents.emit(TIMER_EVENTS.TIMER_PAUSE, { id });
  }, [id]);

  // Resume timer
  const resume = useCallback(() => {
    gameTimers.resumeTimer(id);
    setIsRunning(true);
    gameEvents.emit(TIMER_EVENTS.TIMER_RESUME, { id });
  }, [id]);

  // Stop timer
  const stop = useCallback(() => {
    gameTimers.removeTimer(id);
    setIsRunning(false);
    setIsComplete(false);
    setTimeLeft(duration);
    timerRef.current = null;
  }, [id, duration]);

  // Reset timer
  const reset = useCallback(() => {
    stop();
    setTimeLeft(duration);
    setIsComplete(false);
  }, [stop, duration]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      start();
    }
    
    return () => {
      if (timerRef.current) {
        gameTimers.removeTimer(timerRef.current);
      }
    };
  }, [autoStart, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        gameTimers.removeTimer(timerRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    isRunning,
    isComplete,
    start,
    pause,
    resume,
    stop,
    reset,
  };
};

// Hook for listening to timer events without creating a timer
export const useTimerEvents = (callback: (event: string, data: any) => void) => {
  useEffect(() => {
    const unsubscribeTick = gameEvents.on(TIMER_EVENTS.TIMER_TICK, (data) => {
      callback('tick', data);
    });

    const unsubscribeComplete = gameEvents.on(TIMER_EVENTS.TIMER_COMPLETE, (data) => {
      callback('complete', data);
    });

    const unsubscribePause = gameEvents.on(TIMER_EVENTS.TIMER_PAUSE, (data) => {
      callback('pause', data);
    });

    const unsubscribeResume = gameEvents.on(TIMER_EVENTS.TIMER_RESUME, (data) => {
      callback('resume', data);
    });

    return () => {
      unsubscribeTick();
      unsubscribeComplete();
      unsubscribePause();
      unsubscribeResume();
    };
  }, [callback]);
};
