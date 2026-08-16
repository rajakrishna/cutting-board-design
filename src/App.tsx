import { useEffect } from 'react'
import { AppShell } from './components/layout/AppShell'
import { ThemeProvider } from './components/theme/theme-provider'
import { useBoardStore } from './state/boardStore'

export default function App() {
  const hydrateFromUrl = useBoardStore((s) => s.hydrateFromUrl)

  useEffect(() => {
    hydrateFromUrl()
  }, [hydrateFromUrl])

  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}
