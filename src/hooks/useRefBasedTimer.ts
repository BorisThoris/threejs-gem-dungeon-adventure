import { useRef, useCallback, useEffect } from 'react';
import { refBasedGameState } from '../utils/refBasedGameState';

interface UseRefBasedTimerProps {
  id: string;
  duration: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export const useRefBasedTimer = ({
  id,
  duration,
  onComplete,
  autoStart = false,
}: UseRefBasedTimerProps) => {
  const timerRef = useRef<{
    id: string;
    duration: number;
    startTime: number;
    active: boolean;
    onComplete?: () => void;
  } | null>(null);

  const start = useCallback(() => {
    refBasedGameState.startTimer(id, duration, onComplete);
    timerRef.current = {
      id,
      duration,
      startTime: performance.now(),
      active: true,
      onComplete,
    };
  }, [id, duration, onComplete]);

  const stop = useCallback(() => {
    refBasedGameState.stopTimer(id);
    timerRef.current = null;
  }, [id]);

  const reset = useCallback(() => {
    stop();
    start();
  }, [stop, start]);

  const getTimeLeft = useCallback(() => {
    if (!timerRef.current || !timerRef.current.active) return 0;
    const elapsed = performance.now() - timerRef.current.startTime;
    return Math.max(0, timerRef.current.duration - elapsed);
  }, []);

  const isActive = useCallback(() => {
    return timerRef.current?.active || false;
  }, []);

  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      stop();
    };
  }, [autoStart, start, stop]);

  return {
    start,
    stop,
    reset,
    getTimeLeft,
    isActive,
  };
};
