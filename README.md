# Orbkeep

**Place keepers. Pop the orbs. Knowledge lasts forever.**

Mobile-first tower-defense web game. BTD6-inspired *feel / layout / loop / UI chrome* only — 100% original names, maps, sprites, and copy. No Bloons, monkeys, or Ninja Kiwi assets.

## Stack

- **Vite + React 19 + TypeScript (strict)**
- **React Router** (TanStack Start skipped for simpler greenfield scaffolding; React+TS+Vite PWA intent kept)
- Canvas 2D renderer, fixed timestep `1/60`, React HUD overlay
- Zustand + `persist` → `localStorage` (meta **and** in-progress run snapshots)
- PWA: web manifest, service worker (**network-first** for HTML/JS), standalone, apple-touch-icon, theme-color
- `capacitor.config.ts` scaffold for a later Android APK

## Run

```bash
cd /workspace/orbkeep
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc -b && vite build
npm run preview      # serve dist/
```

## Play loop

1. Home → giant green **PLAY** (coin counter, Double Cash pill, dock: Knowledge / Medals / Install / Settings). **Continue** if a run is saved.
2. Map select → 6 maps, Easy / Medium / Hard orbs, Double Cash, **PLAY** / **PLAY 2×**.
3. Place keepers, press **GO** (or Auto), pop orbs along the painted road.
4. Upgrade **all 3 paths to tier 4** on one tower (4/4/4 allowed — no two-path lock). Sell 70%.
5. Win → medals + coins (+25 on Double Cash) → Restart / Home / **Continue freeplay** (~1.07× HP per extra round).
6. Spend coins on Knowledge (18 nodes). Browse Medals / Achievements.

### In-match

Lives, cash, round, 2× badge, pause, speed 1/2/3, Auto vs Hold, GO, tower tray, 3-column upgrades, targeting first/last/close/strong/weak, range circle, damage numbers, pop FX, shake toggle.

### Hidden admin

Settings → tap **Orbkeep v1.0.0** **7×** → add coins, all knowledge, all medals. In-match admin: +gold / ∞ lives / skip round.

## PWA install

- **Android Chrome:** Install app / Add to Home screen
- **iOS Safari:** Share → Add to Home Screen
- SW is network-first for documents/scripts/styles so PLAY is not stuck on a stale cache
- Buttons use **pointerup and click** (`Pressable`) for installed Android Chrome

Icons live in `public/icons/` (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`).

## Capacitor Android APK

`capacitor.config.ts` is ready (`appId: com.orbkeep.game`, `webDir: dist`).

```bash
npm i @capacitor/core @capacitor/cli @capacitor/android
# config already present — or:
# npx cap init Orbkeep com.orbkeep.game --web-dir dist
npm run build
npx cap add android
npx cap copy android
npx cap open android
# Android Studio → Build APK → sideload
```

Progress saves via `localStorage` (works in the WebView). Optional: Capacitor Preferences later.

## Layout

```
src/
  components/   Pressable, CoinBadge, DoubleCashPill
  data/         orbs, towers (16×3×4), maps (6), waves (1–60), knowledge (18), achievements, difficulties
  engine/       Path, GameEngine, mapArt, render
  screens/      Home, MapSelect, Play, Knowledge, Medals, Settings, Install
  store/        metaStore (zustand persist)
```

## Content checklist

| Feature | Status |
|--------|--------|
| 6 maps, painted roads = waypoints | Yes |
| 16 towers, 3×4 upgrades, 4/4/4 | Yes |
| Orb layer-pop, camo/regen/lead, bosses | Yes |
| Rounds 1–60 + freeplay scaling | Yes |
| Double Cash (start + pops), medals still award | Yes |
| Knowledge 18 nodes / 3 columns | Yes |
| Medals + achievements → coins | Yes |
| Autosave meta + Continue run | Yes |
| `navigator.storage.persist` | Yes |
| PWA + Capacitor scaffold | Yes |
| Original procedural canvas art | Yes |

## Legal

Genre-inspired only. Not affiliated with Ninja Kiwi / Bloons TD 6.
