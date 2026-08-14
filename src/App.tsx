import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { useBoardStore } from './state/boardStore';

export default function App() {
  const hydrateFromUrl = useBoardStore((s) => s.hydrateFromUrl);

  useEffect(() => {
    hydrateFromUrl();
  }, [hydrateFromUrl]);

  return <AppShell />;
}
