import { useCallback, useEffect, useState } from 'react';
import { loadSave, persistSave } from './save';
import { setSoundEnabled } from './audio';
import type { SaveData } from './types';

export function useSave() {
  const [save, setSave] = useState<SaveData | null>(null);

  useEffect(() => {
    const loaded = loadSave();
    setSave(loaded);
    setSoundEnabled(loaded.soundOn);
  }, []);

  const update = useCallback((patch: Partial<SaveData>) => {
    setSave((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      persistSave(next);
      return next;
    });
  }, []);

  return { save, update };
}
