# shadcn Studio editor polish — design

## Goal
Polish the existing cutting-board editor UI using shadcn Studio components. Targeted refine of real app surfaces plus *selective* motion, keeping the warm workshop aesthetic. No landing page, no theme swap, no domain/store changes.

## Approach
Install Studio demos/primitives via the shadcn CLI (registries already wired in `components.json`, license in `.env`). They land under `src/components/shadcn-studio/**` and pull needed `ui/` primitives (`button-group`, `accordion`, `sonner`, `input-group`, `craft-button`). Then rewire app surfaces to use those patterns. Studio demos are references; app components keep their store wiring.

## Surface → component map

| Surface | File | Studio pattern | Change |
|---|---|---|---|
| Toolbar actions | `shop/ShareBar.tsx` | `button-group-03`, `dropdown-menu-09`, `button-28`, `button-41` | Group primary actions; move JSON/Import/Print into an overflow dropdown; Share copies with copy→check + shine hover |
| Feedback | `App.tsx` (+ helper) | `sonner-10` + `<Toaster/>` | Replace all `alert()` with soft toasts |
| Random CTA | `shop/ShareBar.tsx` | `button-49` (`craft-button`) | Craft-styled primary "Random" |
| Zoom | `preview/BoardPreview.tsx` | `button-group-06` | −/%/+ zoom group |
| Mode groups | `preview/BoardPreview.tsx` | `toggle-group` (existing) | Replace raw `<button>` view/face/grain/size groups |
| Dimensions | `preview/BoardPreview.tsx` | `input-group` inch suffix | L/W/T inputs with `"` suffix |
| Settings | `shop/ShopTicket.tsx` | `accordion-09` | Advanced/Extras become accordion; kerf/flatten/panel chips → `toggle-group` |
| Presets | `editor/PresetGallery.tsx` | `card-16` (spotlight) | Selectable strip-thumbnail card grid |
| Buy list | `shop/BuyList.tsx` | `card-06` style rows | Structured species + bf rows |

## Motion (selective only)
Craft button (Random), shine hover on Share, spotlight preset cards, soft success toasts. **Skip** magnetic/ripple/heartbeat/neural/3D-tilt.

## Non-goals
Landing page, theme install, store/domain edits, mobile redesign.

## Verify
`oxlint`, `tsc --noEmit`, `vite build` all pass.
