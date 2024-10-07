// app/components/LogRocketInit.tsx
'use client';

import { useEffect } from 'react';
import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';

export default function LogRocketInit() {
  useEffect(() => {
    LogRocket.init('lihykn/proxylink');
    setupLogRocketReact(LogRocket);
  }, []);

  return null;
}
