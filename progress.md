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

- New user prompt: build a classic Snake game with only the core loop, deterministic/testable logic, minimal UI, and tests only if the repo can support them without new dependencies.
- Refactored the `/[locale]/game` implementation into a classic Snake-only feature set:
  extracted pure movement/collision/food logic into `src/lib/snake-game.mjs`,
  simplified rendering to a DOM grid with score/state/restart,
  kept keyboard controls and added on-screen directional controls for touch/mobile.
- Added dependency-free core tests with Node's built-in test runner in `src/lib/snake-game.test.mjs` and a `yarn test:snake` script.
- Verification completed:
  `node --test src/lib/snake-game.test.mjs` passed,
  `yarn build` passed,
  `yarn lint` passed with existing warnings outside this task.
- Attempted Playwright game-loop validation via the shared web-game client, but the local environment does not have the `playwright` package installed, so browser automation could not run without adding new tooling.

- New user prompt: design a web-based Dou Dizhu game using the existing repo, with polished UI and an actual playable core rather than a static mock.
- Replaced the `/[locale]/game` route with a lightweight single-player Dou Dizhu table:
  player is fixed as landlord, two bots play as farmers, the game supports singles, pairs, triples, triple-with-single, triple-with-pair, straights, bombs, and rocket.
- Added a pure rules engine in `src/lib/dou-dizhu-game.mjs` for deck creation, dealing, combo validation, turn order, pass/reset handling, simple AI responses, and deterministic AI timing via `advanceGame`.
- Added `src/components/dou-dizhu-game.tsx` with a felt-table layout, interactive player hand, face-up table pile, bottom cards, bot hand counts, localized feedback text, and `window.render_game_to_text` / `window.advanceTime`.
- Updated route wiring, nav/game locale strings, and tabletop styling in `src/app/[locale]/game/page.tsx`, `src/messages/*.json`, and `src/app/globals.css`.
- Added dependency-free logic coverage in `src/lib/dou-dizhu-game.test.mjs` and a `yarn test:doudizhu` script.
- Verification completed:
  `node --test src/lib/dou-dizhu-game.test.mjs` passed,
  `yarn build` passed,
  `yarn lint` reported only pre-existing warnings outside the new Dou Dizhu files.
- Web guideline pass:
  kept 44px+ interactive targets,
  added visible keyboard focus on playable cards,
  maintained text contrast and responsive stacking in the touched UI.
- Playwright/web-game-client validation is still blocked in this environment because the `playwright` package is not installed locally, and no new dependency was added for this request.

- New user prompt: do not overwrite the original Snake game; add a separate Dou Dizhu entry, ensure played cards appear in the shared public area, and make the UI/sound feel lighter.
- Restored route separation:
  `/[locale]/game` is Snake again via `src/components/retro-snake-game.tsx`,
  added a new `/[locale]/doudizhu` route backed by `src/components/dou-dizhu-game.tsx`.
- Added a second internal nav entry `/doudizhu` in `src/data/nav-links.ts` and split locale copy so `game` maps to Snake while `doudizhu` has its own strings in all message files.
- Enhanced Dou Dizhu state/UI:
  added per-player recent actions in the public area via `lastActions` in `src/lib/dou-dizhu-game.mjs`,
  kept the central active trick area,
  added a light sound toggle and synthesized card/pass/win tones with Web Audio,
  shifted the table visuals toward a brighter, lighter tabletop treatment in `src/app/globals.css`.
- Verification completed after the split:
  `node --test src/lib/dou-dizhu-game.test.mjs` passed,
  `node --test src/lib/snake-game.test.mjs` passed,
  `yarn build` passed with both `/[locale]/game` and `/[locale]/doudizhu`,
  `yarn lint` shows only pre-existing warnings outside this task plus generated `.open-next` warnings.
- Playwright-based game-loop validation remains blocked because `playwright` is not installed in the local environment, and no dependency was added.
