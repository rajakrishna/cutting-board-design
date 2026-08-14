import { useSyncExternalStore } from 'react'

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia('(min-width: 768px)')
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

function getSnapshot() {
  return window.matchMedia('(min-width: 768px)').matches
}

function getServerSnapshot() {
  return true
}

export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
