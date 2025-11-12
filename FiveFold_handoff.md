# Five Fold — Secret Note Canvas
**Production Handoff (Vite + React + Tailwind + Framer Motion)**  
Version: v1.0 · Date: 2025‑11‑12

---

## 0) TL;DR (What to Build)
Turn Five Fold’s UI into a single “secret note” that **unfolds across 5 phases**. Each phase reveals new UI panels and information while keeping the player focused on one cohesive canvas. Use the provided `FiveFoldNote` prototype as the wrapper and plug in existing or new components per phase. Ship a responsive, accessible, and performant experience (mobile-first) in **React 18 + Vite + Tailwind + Framer Motion**.

---

## 1) Vision & Goals
**Vision:** A tactile, memorable play surface that feels like unfolding a paper note—each fold reveals more context, hints, and AI guidance until the player lands on the answer.

**Primary goals**
- Make “Five Fold” literally **fold**: 3D unfold transitions + paper texture + crease indicators.
- Keep the entire game inside **one canvas**: fewer page jumps, clearer mental model.
- Use **progressive disclosure**: from category → cryptic clue → full hints → AI nudge → AI analysis.
- Ensure **speed** (LCP < 2.5s, < 200KB gzipped app JS), **accessibility** (WCAG AA), and **clarity**.

**Core mechanic**
- Player guesses a **person, place, or thing** with up to **5 progressive phases**.
- Score feel: Gold (Phases 1–2), Silver (3), Bronze (4–5).

---

## 2) What’s Creative / What to Keep
- **Paper‑as‑canvas metaphor** with **origami folds** is fresh, thematic, and brand‑coherent.
- **Unified 5‑panel grid** that physically unfolds (rotateY) is a strong interaction pattern.
- **Wrong‑guess shake**, **creases as phase indicators**, and **“desk” background** add delightful polish.
- **Reduced‑motion fallbacks** (no 3D for users who prefer less animation) maintain inclusivity.

All of the above should be **kept** and refined—this is a unique anchor for the brand.

---

## 3) Player Flow (Phases)
1. **Phase 1 — Category**  
   - Show category picker (or pre‑revealed category). One short starter hint.
2. **Phase 2 — Cryptic Sentence**  
   - One well‑crafted, non‑spoiler sentence to steer thinking without giving it away.
3. **Phase 3 — Hints Stack**  
   - All 5 hints visible; gated reveals are okay if desired (e.g., reveal every 2 user actions).
4. **Phase 4 — AI Nudge**  
   - Contextual guidance based on prior guesses; surface patterns, nudge away from dead ends.
5. **Phase 5 — AI Analysis**  
   - Concise summary: what’s known, what’s ruled out, edges to explore, likely candidates.

**Guessing** is available throughout; **share** affordance on success or when session ends.

---

## 4) UX Spec — Secret Note Canvas
- **Layout:** Responsive 5‑panel container; horizontal unfolds on desktop, vertical stack on mobile.
- **Surface:** Paper texture (subtle), light shadows, visible **creases** between panels (activate as unlocked).
- **Motion:** 3D `rotateY` per panel. Springy but snappy (200–450ms).  
  - Wrong guess: brief X‑axis “shake.”  
  - Win: full unfold + confetti burst (CSS/Framer).  
  - Lose: slight “crumple” (scale/warp) animation.
- **A11y:** `prefers-reduced-motion` => fade/slide only. ARIA labels: “Phase N unfolded,” labeled controls.
- **Focus management:** When a phase unfolds, move focus to primary control in that panel.
- **Handwriting accent:** Optional headline or hint font (e.g., Caveat) used sparingly for readability.

---

## 5) Tech Stack & Constraints
- **React 18 + Vite + TypeScript**
- **Tailwind CSS** (utility‑first, tokens via CSS vars)
- **Framer Motion** (animation)
- **Lucide‑react** (icons)  
**Perf budget:** main bundle target < **200KB gz**; LCP < **2.5s** on mid‑tier mobile.  
**Browser support:** evergreen + iOS 14+.

---

## 6) Component Architecture
High‑level wrapper: **`<FiveFoldNote />`** (the folding canvas)
- Receives `phase`, `onGuess`, and optional `wrongGuessShake` boolean.
- Renders 5 child **panels**, one per phase, each displaying a feature component.

**Panel mapping (swap with your actual components):**
- P1: `CategoryPicker`
- P2: `SentenceCard` (cryptic clue)
- P3: `HintStack`
- P4: `Phase4Nudge` (AI nudge)
- P5: `Phase5Visual` (AI analysis)
- Global footer: `GuessBar` (always visible)

> The uploaded prototype includes a working `FiveFoldNote` pattern with Framer Motion unfold logic and placeholder imports you can wire up. It also includes guidance on responsiveness, reduced‑motion, and phase indicators. Place it in `src/components/FiveFoldNote.tsx` and mount from your game page (`PlayChallenge.tsx`).

**Suggested file structure**
```
src/
  components/
    FiveFoldNote.tsx
    paper/
      PaperSurface.tsx
      FoldedCornerCard.tsx
    game/
      CategoryPicker.tsx
      SentenceCard.tsx
      HintStack.tsx
      Phase4Nudge.tsx
      Phase5Visual.tsx
      GuessBar.tsx
  pages/
    PlayChallenge.tsx
  styles/
    theme.css  // CSS variables and bg utilities (desk, paper)
```

---

## 7) State Machine (Front‑end)
```
states:
  idle -> phase1 -> phase2 -> phase3 -> phase4 -> phase5 -> done
events:
  GUESS_SUBMITTED
  PHASE_ADVANCE
  HINT_REVEALED
  SESSION_WON | SESSION_FAILED

guards & actions:
  on GUESS_SUBMITTED:
    - evaluate (client or server)
    - if correct: SESSION_WON
    - else: maybe wrongGuessShake = true (reset after 400ms)
  on PHASE_ADVANCE: phase = min(phase + 1, 5)
  on SESSION_WON/FAILED: open ShareCard or Summary
```

---

## 8) Data & Contracts (Sketch)
> Adjust to your actual backend; this is a minimal shape for integration.

**GET `/api/today`** → `{ id, category, crypticClue, hints[5], rules, seed }`  
**POST `/api/guess`** `{ id, guess, history[] }` →  
```
{
  correct: boolean,
  feedback: string,         // short nudge
  banned?: string[],        // ruled-out terms
  stats?: { attempts, phase },
  nextPhase?: number        // optional server-driven phase advance
}
```
**POST `/api/analysis`** `{ id, history[] }` → `{ summary, likelyCandidates[] }`

**Client models**
```ts
type Phase = 0|1|2|3|4|5;
type Session = {
  id: string;
  phase: Phase;
  guesses: string[];
  category: string;
  crypticClue: string;
  hints: string[]; // up to 5
  nudge?: string;
  analysis?: string;
};
```

---

## 9) Accessibility Checklist
- Respect `prefers-reduced-motion`.  
- All interactive elements keyboard navigable (Tab order follows unfold).  
- Focus sent to newly revealed panel’s primary control.  
- Color contrast AA (check gold/green combos on paper texture).  
- Provide aria‑live region for “Correct!”/“Try again” feedback.

---

## 10) Animation System
- **Panel unfold:** `rotateY` with `originX` left/right to simulate hinge. Spring `{stiffness: 100, damping: 18}`.
- **Wrong guess shake:** `x: [0, 10, -10, 5, -5, 0]` for ~400ms.
- **Win:** scale up + brighten + confetti (container overlay).  
- **Lose:** subtle “crumple”—scale 0.98 + rotateZ 1–2deg + shadow warp.

Fallback: when reduced motion, **opacity/translate** only.

---

## 11) Performance
- Lazy‑load heavy panels (P4–P5) with `React.lazy` if needed.
- Prefer CSS textures/SVG over large PNGs; keep `paper-texture` under ~30KB.
- Audit bundle (Vite analyze). Avoid extra deps; consider tree‑shaking Lucide icons.

---

## 12) Implementation Steps
1. **Create** `FiveFoldNote.tsx` and mount in `PlayChallenge.tsx`.
2. **Wire** phase state + guessing into your store/hooks.
3. **Plug** existing components into panels; add handlers.
4. **Style** theme: desk bg, paper texture, crease indicators.
5. **Add** reduced motion logic + ARIA labels.
6. **QA** mobile & desktop; verify perf, focus, and contrast.
7. **Polish** micro‑interactions (shake, confetti, crumple).

---

## 13) Prompts for Another AI (Copy/Paste)
### A) Front‑end Implementer
“You are a senior React engineer. Using Vite + React + TypeScript + Tailwind + Framer Motion, implement a single‑canvas game UI called ‘Five Fold’ where a paper‑like surface unfolds across 5 phases. Use the included `FiveFoldNote.tsx` wrapper and map panels as follows: P1 CategoryPicker, P2 SentenceCard, P3 HintStack, P4 Phase4Nudge, P5 Phase5Visual, plus a persistent GuessBar footer. Add 3D `rotateY` unfolds per panel with spring animation and a wrong‑guess shake. Honor `prefers-reduced-motion`. Ensure WCAG AA contrast and keyboard navigation. Target main bundle <200KB gz. Provide responsive styles (horizontal unfolds on desktop, vertical stack on mobile). Expose `phase`, `onGuess`, and `wrongGuessShake` props. Finish with a QA checklist and instructions to run with Vite.”

### B) Backend / Game Logic
“You are a backend/game‑logic engineer. Expose `/api/today`, `/api/guess`, `/api/analysis` for the Five Fold daily puzzle. Persist a session keyed by day/seed. Evaluate guesses (string similarity, canonical forms), update stats, and optionally drive server‑side `nextPhase`. Provide robust feedback (`feedback`, `banned`, and `analysis`). Rate‑limit abusive calls. Return compact payloads tailored to the front‑end contracts in section 8. Include tests and example payloads.”

---

## 14) QA Checklist
- [ ] Unfolds progress only forward (no regress unless designed).  
- [ ] Focus moves into the newly opened panel.  
- [ ] Reduced‑motion mode swaps to fades/slides.  
- [ ] Guess errors are announced via aria‑live.  
- [ ] Mobile: no horizontal overflow, tap targets 44px+.  
- [ ] Build size under budget; LCP under target on a mid device.

---

## 15) How to Run (Vite)
```bash
npm create vite@latest five-fold -- --template react-ts
cd five-fold
npm i framer-motion lucide-react
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# configure tailwind in postcss and src/index.css
npm run dev
```

---

## 16) Notes & Attributions
- This handoff packages and extends the previously provided prototype and notes. See the source snippet for `FiveFoldNote` and panel wiring guidance in the attached material.
- Visual inspiration: origami folds, brochure‑style transitions, and paper‑note metaphors.

---

## 17) Acceptance Criteria
- The experience **feels** like unfolding a secret note.
- All five phases render within a single canvas, progressively revealing content.
- Accessibility and performance goals are met.
- The front‑end exposes clear integration seams for current/future backends.

---

*End of handoff.*
