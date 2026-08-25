
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DATA } from '../data/data';

const STORAGE_KEY = 'rota_watts_v1';

type WattsContextValue = { watts: number; addWatts: (n: number) => void };

const WattsContext = createContext<WattsContextValue | null>(null);

export function WattsProvider({ children }: { children: React.ReactNode }) {
  // Starts from the same mock figure the source shipped (DATA.user.watts),
  // then diverges as the driver actually earns more.
  const [watts, setWatts] = useState(DATA.user.watts);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw == null) return;
      const n = Number(raw);
      if (Number.isFinite(n)) setWatts(n);
    });
  }, []);

  const value = useMemo<WattsContextValue>(
    () => ({
      watts,
      addWatts: (n: number) =>
        setWatts((w) => {
          const next = w + n;
          AsyncStorage.setItem(STORAGE_KEY, String(next));
          return next;
        }),
    }),
    [watts]
  );

  return <WattsContext.Provider value={value}>{children}</WattsContext.Provider>;
}

export function useWatts() {
  const ctx = useContext(WattsContext);
  if (!ctx) throw new Error('useWatts must be used within WattsProvider');
  return ctx;
}
