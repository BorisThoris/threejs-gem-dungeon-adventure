import { useRef, useCallback } from 'react';
import { refBasedGameState } from '../utils/refBasedGameState';

export const useRefBasedBuffs = () => {
  const buffsRef = useRef<Array<{
    id: string;
    type: string;
    value: number;
    duration: number;
    startTime: number;
    active: boolean;
  }>>([]);

  const addBuff = useCallback((id: string, type: string, value: number, duration: number) => {
    refBasedGameState.addBuff(id, type, value, duration);
    buffsRef.current = refBasedGameState.getActiveBuffs();
  }, []);

  const removeBuff = useCallback((id: string) => {
    refBasedGameState.removeBuff(id);
    buffsRef.current = refBasedGameState.getActiveBuffs();
  }, []);

  const getBuffs = useCallback(() => {
    return refBasedGameState.getActiveBuffs();
  }, []);

  const getBuffValue = useCallback((type: string) => {
    const buffs = refBasedGameState.getActiveBuffs();
    return buffs
      .filter(buff => buff.type === type)
      .reduce((total, buff) => total + buff.value, 0);
  }, []);

  const hasBuff = useCallback((type: string) => {
    const buffs = refBasedGameState.getActiveBuffs();
    return buffs.some(buff => buff.type === type);
  }, []);

  const clearAllBuffs = useCallback(() => {
    const buffs = refBasedGameState.getActiveBuffs();
    buffs.forEach(buff => refBasedGameState.removeBuff(buff.id));
    buffsRef.current = [];
  }, []);

  return {
    addBuff,
    removeBuff,
    getBuffs,
    getBuffValue,
    hasBuff,
    clearAllBuffs,
  };
};
