# Merge Plan

Suggested integration order when the side work is ready:

1. Update shared state shapes in `src/shared/types.ts`
2. Extend Torn/TornStats mapping in `electron/runtime/unified-state.cjs`
3. Update renderer fallback state in `src/renderer/App.tsx`
4. Merge icon additions in `src/renderer/components/icons.tsx`
5. Merge header changes in `src/renderer/components/TornLinuxHeader.tsx`
6. Merge overlay changes in `src/renderer/components/TornStatsOverlay.tsx`
7. Merge styling changes in `src/renderer/styles/app.css`
8. Merge styling changes in `src/renderer/styles/torn-header.css`
9. Merge styling changes in `src/renderer/styles/torn-header.tokens.css`

Validate after merge:
- renderer builds
- header still renders in live/system flow
- TornStats button opens overlay
- no preload or live-build paths are affected
