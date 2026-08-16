import { useBoardStore, useDerived } from '../../state/boardStore'
import { BoardPreview } from '../preview/BoardPreview'
import { StripEditor } from '../editor/StripEditor'
import { PresetGallery } from '../editor/PresetGallery'
import { ShopTicket } from '../shop/ShopTicket'
import { ShareBar } from '../shop/ShareBar'
import { InventoryPanel } from '../scraps/InventoryPanel'
import { BuildGuide } from '../guide/BuildGuide'
import { PrintShopSheet } from '../shop/PrintShopSheet'
import { BuyListSheet } from '../shop/BuyListSheet'
import { ThemeToggle } from '../theme/theme-toggle'
import { formatInches } from '../../domain/cutList'
import { useIsDesktop } from '@/hooks/use-is-desktop'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'
import { BookOpen, PanelsTopLeft, ShoppingCart } from 'lucide-react'

export function AppShell() {
  const appView = useBoardStore((s) => s.appView)
  const setAppView = useBoardStore((s) => s.setAppView)
  const sheetTab = useBoardStore((s) => s.sheetTab)
  const setSheetTab = useBoardStore((s) => s.setSheetTab)
  const board = useBoardStore((s) => s.board)
  const setBuyListOpen = useBoardStore((s) => s.setBuyListOpen)
  const { summary } = useDerived()
  const isDesktop = useIsDesktop()

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-svh w-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
        <header className="no-print flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
          <PanelsTopLeft className="size-4 text-primary" />
          <div className="text-sm font-semibold tracking-tight">
            Cutting Board Designer
          </div>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <nav className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={appView === 'design' ? 'default' : 'ghost'}
              onClick={() => setAppView('design')}
            >
              Design
            </Button>
            <Button
              type="button"
              size="sm"
              variant={appView === 'guide' ? 'default' : 'ghost'}
              onClick={() => setAppView('guide')}
            >
              <BookOpen className="size-3.5" />
              Guide
            </Button>
          </nav>

          {isDesktop && (
            <>
              <Separator orientation="vertical" className="mx-1 h-5" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={() => setBuyListOpen(true)}
              >
                <ShoppingCart className="size-3.5" />
                Buy List
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                  {summary.buyList.length}
                </span>
              </Button>
            </>
          )}

          <div className="ml-auto flex min-w-0 max-w-full items-center gap-2 overflow-x-auto">
            <ShareBar />
            <ThemeToggle />
          </div>
        </header>

        {!isDesktop ? (
          <div className="no-print flex min-h-0 flex-1 flex-col">
            <div className="h-[40vh] min-h-[180px] shrink-0 border-b border-border">
              <BoardPreview />
            </div>
            <div className="shrink-0 border-b border-border bg-card px-3 py-2">
              <div className="tabular-nums text-sm font-medium">
                Stop {formatInches(summary.stopBlock)}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {summary.buyList.map((b) => b.label).join(' · ') || board.name}
              </div>
            </div>
            <div className="flex shrink-0 gap-2 border-b border-border px-3 py-2">
              {(['woods', 'strips', 'shop'] as const).map((t) => (
                <Button
                  key={t}
                  type="button"
                  size="sm"
                  className="h-10 flex-1 capitalize"
                  variant={sheetTab === t ? 'default' : 'outline'}
                  onClick={() => setSheetTab(t)}
                >
                  {t === 'woods' ? 'Woods' : t === 'strips' ? 'Strips' : 'Shop'}
                </Button>
              ))}
            </div>
            <ScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col gap-4 p-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {sheetTab === 'woods' && (
                  <div className="flex flex-col gap-4">
                    <StripEditor />
                    <InventoryPanel />
                  </div>
                )}
                {sheetTab === 'strips' && <StripEditor />}
                {sheetTab === 'shop' && <ShopTicket />}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="no-print flex min-h-0 flex-1">
            <aside className="flex w-[360px] shrink-0 flex-col overflow-hidden border-r border-border bg-card">
              <div className="shrink-0 border-b border-border px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground">Library</span>
              </div>
              <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-4 p-4">
                  <PresetGallery />
                  <Separator />
                  <StripEditor />
                  <Separator />
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start px-2 font-medium"
                      >
                        Inventory
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3">
                      <InventoryPanel />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </ScrollArea>
            </aside>

            <main className="min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
              <BoardPreview />
            </main>

            <aside className="flex w-[320px] shrink-0 flex-col overflow-hidden border-l border-border bg-card">
              <div className="shrink-0 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
                Settings
              </div>
              <div className="min-h-0 flex-1">
                <ShopTicket />
              </div>
            </aside>
          </div>
        )}

        <BuildGuide />
        <BuyListSheet />
        <PrintShopSheet />
        <Toaster position="bottom-right" toastOptions={{ className: 'rounded-lg' }} />
      </div>
    </TooltipProvider>
  )
}
