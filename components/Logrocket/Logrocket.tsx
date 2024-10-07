// app/components/LogRocketInit.tsx
'use client';

import { useEffect } from 'react';
import LogRocket from 'logrocket';

export default function LogRocketInit() {
  useEffect(() => {
    LogRocket.init('lihykn/proxylink');
  }, []);

  return null;
}
