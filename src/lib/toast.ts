import type { CSSProperties } from 'react'
import { toast } from 'sonner'

const soft = (color: string): CSSProperties =>
  ({
    '--normal-bg': `color-mix(in oklab, ${color} 12%, var(--background))`,
    '--normal-text': color,
    '--normal-border': `color-mix(in oklab, ${color} 40%, var(--background))`,
  }) as CSSProperties

export const notify = {
  success: (message: string) => toast.success(message, { style: soft('var(--primary)') }),
  error: (message: string) => toast.error(message, { style: soft('var(--destructive)') }),
  info: (message: string) => toast(message),
}
