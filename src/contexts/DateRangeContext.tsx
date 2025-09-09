'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

export interface DateRangeValue {
  startDate: Date;
  endDate: Date;
}

interface DateRangeContextValue {
  range: DateRangeValue;
  setRange: (r: DateRangeValue) => void;
  setQuickOption: (id: string | null) => void;
  quickOption: string | null;
}

const DateRangeContext = createContext<DateRangeContextValue | undefined>(undefined);

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const now = useMemo(() => new Date(), []);
  const defaultStart = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() - 29);
    return d;
  }, [now]);

  const [range, setRange] = useState<DateRangeValue>({ startDate: defaultStart, endDate: now });
  const [quickOption, setQuick] = useState<string | null>('last30days');

  const value = useMemo(() => ({
    range,
    setRange: (r: DateRangeValue) => setRange(r),
    setQuickOption: (id: string | null) => setQuick(id),
    quickOption,
  }), [range, quickOption]);

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error('useDateRange must be used within DateRangeProvider');
  return ctx;
}

