Original prompt: [$develop-web-game](/Users/rocm/.codex/skills/develop-web-game/SKILL.md) [$frontend-design](/Users/rocm/.agents/skills/frontend-design/SKILL.md) [$ui-ux-pro-max](/Users/rocm/.agents/skills/ui-ux-pro-max/SKILL.md) 将首页热门网站和本站页面入口区分开，新增一个入口，设计一款网页游戏

- Initialized progress tracking.
- Plan: split homepage links into external/internal sections, add a new internal game entry, build a small classic web game route with deterministic test hooks, and validate with Playwright client screenshots/text state.

- Split homepage card area into two explicit groups: external popular websites and internal site page entrances.
- Added a new internal nav entry `/game` and wired new locale keys for section labels and item text in all language files.
- Implemented a new localized game route `/[locale]/game` with a classic snake game component.

- Follow-up UX request: shifted snake game to a lighter/fashion-forward visual direction.
- Removed heavy header from game route and introduced a compact top bar so gameplay can occupy most of the viewport.
- Expanded canvas rendering resolution and responsive sizing so the game area fills the view as much as possible on desktop and mobile.
- Enlarged game viewport again per user feedback: removed residual width caps and switched to viewport-first square sizing (`min(100vw, 100vh)` with compact chrome) so gameplay approaches full browser view.
- Per latest UI feedback: moved top layout to left back button + right title.
- Made `game-stage` the full interactive rounded region by letting canvas fill 100% of stage width/height with no inner gap.
- Reworked game header into in-card layout: left back button inside rounded container, right side title/subtitle/controls.
- Removed external game-page top bar to reclaim vertical space.
- Kept game-stage as the full middle rounded interactive region with canvas filling 100% width/height.
- Applied web-guidelines touch-target improvement: back button min-height set to 44px.
- Fixed stretch regression by making `game-stage` a responsive square (`aspect-ratio: 1/1`) and keeping canvas at 100% of stage.
- This preserves current large size while preventing non-uniform scaling.
- Pulled latest web-interface-guidelines and re-checked touched game files.
- Added anti-stretch fix: game-stage is now a responsive square with `aspect-ratio: 1 / 1`, canvas fills stage without distortion.
- Added `touch-action: manipulation` on back button and game buttons for mobile interaction compliance.
- Adjusted stage fill strategy to avoid distortion while maximizing occupied area: stage fills available middle region; canvas uses `object-fit: cover` + center crop (no stretch).
- Fixed viewport overflow/cropping issue: switched canvas fit from `cover` to `contain` and centered inside stage, so full game bounds remain visible while preserving aspect ratio.
- Replaced CSS-only fit strategy with robust ResizeObserver sizing.
- Canvas now always uses the largest square that fits inside game-stage (no stretch, no crop, no overflow).
