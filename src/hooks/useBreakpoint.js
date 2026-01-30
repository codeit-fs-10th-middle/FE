'use client';

import { useEffect, useState } from 'react';

const DEFAULT_BREAKPOINTS = {
  sm: 0,
  md: 768,
  lg: 1024,
};

export default function useBreakpoint(breakpoints = DEFAULT_BREAKPOINTS) {
  const [bp, setBp] = useState(null);

  useEffect(() => {
    const entries = Object.entries(breakpoints).sort((a, b) => a[1] - b[1]);

    const getCurrent = () => {
      const w = window.innerWidth;
      let current = entries[0][0];
      for (const [name, min] of entries) {
        if (w >= min) current = name;
      }
      return current;
    };

    const update = () => setBp(getCurrent());

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [breakpoints]);

  return bp;
}
