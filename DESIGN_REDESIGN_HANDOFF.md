# Five Fold Game - Complete Design Redesign Handoff

## Purpose
This document provides everything needed for an AI to understand Five Fold and redesign its visual presentation to better embody the "Five Fold" paper/note concept.

---

## Game Concept

**Name:** Five Fold
**Tagline:** "Five clues. One answer."

**Core Mechanic:**
Players receive 5 progressive hints to guess a mystery answer (person, place, thing). The game unfolds in phases:

1. **Phase 1:** Pick a category (Geography, History, Culture, Stats, Visual) - receive 1 specific hint
2. **Phase 2:** See a cryptic sentence about the answer
3. **Phase 3:** Unlock all 5 detailed hints at once
4. **Phase 4:** Get an AI-generated "nudge" based on previous wrong guesses
5. **Phase 5:** Receive full AI analysis showing connections between hints and wrong guesses

**Scoring:**
- Gold: Solve in phases 1-2
- Silver: Solve in phase 3
- Bronze: Solve in phases 4-5

Players can make unlimited guesses. The game progresses through phases, not lives.

---

## The "Five Fold" Metaphor

The name suggests **paper folding** - like origami or a secret note folded 5 times. Each wrong guess or phase progression is like "unfolding" another layer to reveal more information.

**Current Problem:** The design doesn't communicate this folding/unfolding concept strongly enough. It has paper textures and some components, but doesn't feel cohesive or clearly "five-fold" themed.

---

## Key Files for Understanding

### 1. Game Flow & Logic
- **`src/pages/PlayChallenge.tsx`** - Main game page with all phases
- **`src/pages/Home.tsx`** - Landing page with Daily Challenge and Custom Challenge cards
- **`src/pages/DailyChallenge.tsx`** - Daily challenge entry point

### 2. Current UI Components
- **`src/components/PhaseChips.tsx`** - Shows which phase player is on (5 chips)
- **`src/components/HintStack.tsx`** - Displays hints in Phase 3
- **`src/components/SentenceCard.tsx`** - Shows the cryptic sentence (Phase 2)
- **`src/components/CategoryPicker.tsx`** - Category selection (Phase 1)
- **`src/components/GuessBar.tsx`** - Input field for guesses
- **`src/components/ShareCard.tsx`** - Win/lose results screen
- **`src/components/Phase4Nudge.tsx`** - AI nudge display
- **`src/components/Phase5Visual.tsx`** - Final analysis visualization
- **`src/components/Logo.tsx`** - Five Fold logo component
- **`src/components/GameHeader.tsx`** - Top navigation during gameplay

### 3. Paper Design Components (Underutilized)
- **`src/components/paper/PaperSurface.tsx`** - Base paper container
- **`src/components/paper/FoldedCornerCard.tsx`** - Card with folded corner
- **`src/components/paper/EnvelopePanel.tsx`** - Envelope-style reveal
- **`src/components/paper/StickyNote.tsx`** - Sticky note accent

### 4. Design System
- **`src/design/tokens.ts`** - Design tokens (colors, spacing, shadows)
- **`src/design/theme.css`** - CSS custom properties and theme
- **`src/index.css`** - Global styles and Tailwind setup

### 5. Design Documentation
- **`RESEARCH_SYNTHESIS.md`** - Original paper UI research (8 sources analyzed)
- **`PAPER_DESIGN_IMPLEMENTATION.md`** - Paper design system documentation
- **`README.md`** - Project overview

---

## Current Design Strengths
1. ✅ Paper texture is subtle and doesn't impair readability
2. ✅ Color palette (forest green + gold) matches the brand
3. ✅ Performance is good (117KB gzipped JS)
4. ✅ Components are modular and well-structured
5. ✅ Accessibility features implemented (WCAG AA contrast, reduced motion)

---

## Current Design Weaknesses
1. ❌ **Doesn't feel "five-fold"** - The folding metaphor isn't clear
2. ❌ **Inconsistent component usage** - Some pages use paper components, others don't
3. ❌ **Generic paper aesthetic** - Could be any note-taking app
4. ❌ **Phase progression lacks drama** - Doesn't feel like "unfolding a secret"
5. ❌ **Logo/brand disconnect** - Design doesn't reinforce the Five Fold identity
6. ❌ **Missing cohesive visual language** - Components feel disconnected

---

## Design Brief for Redesign

### Primary Goal
**Make the entire game feel like unfolding a secret note 5 times.**

### Visual Metaphors to Explore
1. **Origami-inspired:** Each phase reveals a new fold
2. **Secret envelope:** Sealed at start, progressively opened
3. **Accordion fold:** Vertical or horizontal expansion through phases
4. **Book pages:** Each phase is a page turn
5. **Physical note:** Literally looks like a piece of paper with 5 folds

### Key Moments to Emphasize
1. **Game start:** Sealed/folded state - mystery intact
2. **Phase transitions:** Animation of unfolding/revealing
3. **Wrong guess:** Paper shakes/crumples slightly but stays intact
4. **Correct guess:** Paper fully opens, reveals answer in beautiful way
5. **Phase indicators:** Should look like fold lines or segments

### Must-Haves
- Maintain readability (WCAG AA contrast)
- Keep performance budget (<200KB gzipped total)
- Honor `prefers-reduced-motion`
- Mobile-first responsive design
- Use existing design tokens as starting point (can modify)

### Nice-to-Haves
- Ambient animations (gentle float, subtle rotation)
- Micro-interactions on hover/tap
- Sound effects (optional, off by default)
- Easter eggs that reinforce the theme

---

## Technical Constraints

### Stack
- React 18 + TypeScript
- Tailwind CSS + CSS custom properties
- Framer Motion for animations
- Lucide React for icons
- Vite build system

### Browser Support
- Modern browsers (last 2 versions)
- Mobile Safari iOS 14+
- Chrome Android

### Performance Budget
- LCP < 2.0s desktop, < 2.5s mobile
- Bundle size < 200KB gzipped JS
- CSS < 15KB gzipped

---

## File List for Reference

### Essential Files to Read
```
src/pages/PlayChallenge.tsx           # Main game logic
src/pages/Home.tsx                    # Landing page
src/components/PhaseChips.tsx         # Phase indicators
src/components/HintStack.tsx          # Hint display
src/components/CategoryPicker.tsx     # Category selection
src/components/ShareCard.tsx          # Win/lose screen
src/design/tokens.ts                  # Design tokens
src/design/theme.css                  # Theme variables
src/index.css                         # Global styles
RESEARCH_SYNTHESIS.md                 # Design research
PAPER_DESIGN_IMPLEMENTATION.md        # Current paper system
```

### Supporting Files
```
src/components/SentenceCard.tsx
src/components/GuessBar.tsx
src/components/Phase4Nudge.tsx
src/components/Phase5Visual.tsx
src/components/Logo.tsx
src/components/GameHeader.tsx
src/components/paper/*.tsx            # Paper components
tailwind.config.js                    # Tailwind config
```

### Documentation
```
README.md                             # Project overview
IMPLEMENTATION_STATUS.md              # Feature status
```

---

## Assets Available

### Fonts
- System fonts (via Tailwind defaults)
- Can add Google Fonts if needed

### Images
- Logo: `/Adobe Express - file.png` (Five Fold logo with green/gold colors)
- Can add illustrations if needed

### Icons
- Lucide React library available
- Can use SVG illustrations

---

## Example User Flows

### Flow 1: Daily Challenge (Success in Phase 2)
1. User clicks "Start Playing" on home page
2. Sees "The mystery is a [Place]" banner
3. **Phase 1:** Picks "Geography" category → sees one hint
4. Makes guess → wrong, shakes
5. **Phase 2:** Cryptic sentence appears
6. Makes guess → CORRECT!
7. Win screen appears with "Gold" rank
8. Share results

### Flow 2: Custom Challenge (Fail at Phase 5)
1. User progresses through phases 1-4, all guesses wrong
2. **Phase 5:** Full AI analysis appears with all wrong guesses analyzed
3. User still can't figure it out
4. Eventually gives up or uses all hints
5. Lose screen appears with correct answer revealed

---

## Success Criteria

A successful redesign will:

1. ✅ **Immediately communicate "Five Fold"** - Users should understand the folding metaphor visually
2. ✅ **Create anticipation** - Each phase reveal should feel exciting
3. ✅ **Feel cohesive** - Every screen/component reinforces the same visual language
4. ✅ **Stay performant** - Animations are smooth, bundle size stays under budget
5. ✅ **Remain accessible** - WCAG AA compliant, keyboard navigable
6. ✅ **Work on mobile** - Touch-friendly, responsive
7. ✅ **Be memorable** - Users remember the visual experience

---

## Questions to Consider

1. Should the entire game interface literally look like a piece of folded paper?
2. Should phase indicators show fold lines or creases?
3. Should hints appear to be written on different sections of the paper?
4. Should wrong guesses appear as crossed-out text on the paper?
5. Should the background show a desk/table to ground the paper metaphor?
6. Should there be a visible "unfold" animation between phases?
7. Should the five folds correspond to the five hint categories visually?

---

## Inspiration References

From original research (`RESEARCH_SYNTHESIS.md`):
- Nicolas Gallagher's CSS folded corners
- Sticky note app minimalism
- Paper texture best practices (5-15% opacity)
- Envelope animation patterns
- Typography on textured surfaces

Additional inspiration to explore:
- Origami folding sequences
- Secret note passing aesthetic
- Detective/mystery board layouts
- Physical puzzle box reveals
- Book pop-up mechanics

---

## Final Notes

**Current Designer (me) admits:** "I think you did a good job but not a great job. I don't feel like it's a note game or anything to do with 5 folds."

**Your mission:** Take the strong foundation (good performance, accessibility, modular components) and transform it into something that **viscerally feels like unfolding a secret five times**.

Be bold. Reimagine the layout. Use the folding metaphor as the core organizing principle. Make it feel magical.

---

## How to Test Changes

```bash
npm run dev      # Start dev server
npm run build    # Test production build
npm run typecheck # Verify TypeScript
```

Game is playable at: `/daily` (daily challenge) or `/create` (custom challenge)

---

**Good luck! Make Five Fold unforgettable.** 🎨📝✨
