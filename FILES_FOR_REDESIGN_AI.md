# Files to Share with Redesign AI

## Quick Reference
Copy this entire file list to share with another AI for the redesign task.

---

## 📋 MUST READ FIRST

### Primary Handoff Document
**`DESIGN_REDESIGN_HANDOFF.md`** - START HERE! Complete context, goals, and requirements

---

## 🎨 DESIGN RESEARCH & DOCUMENTATION

These files contain the original design research and decisions:

```
RESEARCH_SYNTHESIS.md                 # Paper UI research (8 sources, design principles)
PAPER_DESIGN_IMPLEMENTATION.md        # Current paper system documentation
README.md                             # Project overview
IMPLEMENTATION_STATUS.md              # What's been built
```

---

## 🎮 GAME LOGIC & PAGES

Core game files to understand the flow:

```
src/pages/PlayChallenge.tsx           # ⭐ CRITICAL: Main gameplay page (530 lines)
src/pages/Home.tsx                    # Landing page with Daily/Custom cards
src/pages/DailyChallenge.tsx          # Daily challenge entry
src/pages/CreateChallenge.tsx         # Create custom challenge flow
```

---

## 🧩 UI COMPONENTS (Current)

Components that need redesigning:

### Game Components
```
src/components/PhaseChips.tsx         # Phase indicators (5 chips)
src/components/HintStack.tsx          # Displays hints in Phase 3
src/components/SentenceCard.tsx       # Cryptic sentence (Phase 2)
src/components/CategoryPicker.tsx     # Category selection (Phase 1)
src/components/GuessBar.tsx           # Guess input field
src/components/ShareCard.tsx          # Win/lose results screen
src/components/Phase4Nudge.tsx        # AI nudge display
src/components/Phase5Visual.tsx       # Final analysis viz
src/components/Leaderboard.tsx        # Score leaderboard
```

### Layout Components
```
src/components/Logo.tsx               # Five Fold logo
src/components/GameHeader.tsx         # Top navigation
src/components/ErrorBoundary.tsx      # Error handling
```

### Paper Design Components (Underutilized)
```
src/components/paper/PaperSurface.tsx      # Base paper container
src/components/paper/FoldedCornerCard.tsx  # Folded corner card
src/components/paper/EnvelopePanel.tsx     # Envelope reveal
src/components/paper/StickyNote.tsx        # Sticky note chip
```

---

## 🎨 DESIGN SYSTEM

Design tokens and styling:

```
src/design/tokens.ts                  # Design tokens (colors, spacing, shadows)
src/design/theme.css                  # CSS custom properties & theme
src/index.css                         # Global styles + Tailwind
tailwind.config.js                    # Tailwind configuration
```

---

## 🌍 INTERNATIONALIZATION

Translation files (optional, but good context):

```
src/i18n/en.json                      # English translations
src/i18n/pt-BR.json                   # Portuguese translations
```

---

## 🖼️ ASSETS

Logo and images:

```
public/Adobe Express - file.png       # Five Fold logo (green/gold)
public/Adobe Express - file.svg       # Logo SVG version
```

---

## 📦 CONFIGURATION

Build and dependency files:

```
package.json                          # Dependencies & scripts
tsconfig.json                         # TypeScript config
vite.config.ts                        # Vite build config
```

---

## 📊 FILE PRIORITY

### Tier 1: MUST READ (Start Here)
1. `DESIGN_REDESIGN_HANDOFF.md` - Complete brief
2. `RESEARCH_SYNTHESIS.md` - Design research
3. `src/pages/PlayChallenge.tsx` - Game logic
4. `src/components/PhaseChips.tsx` - Phase indicators

### Tier 2: IMPORTANT (Read Next)
5. `src/pages/Home.tsx` - Landing page
6. `src/components/HintStack.tsx` - Hint display
7. `src/components/CategoryPicker.tsx` - Category UI
8. `src/components/ShareCard.tsx` - Win/lose screen
9. `src/design/tokens.ts` - Design tokens
10. `src/design/theme.css` - Theme system

### Tier 3: SUPPORTING (Reference as needed)
11. `PAPER_DESIGN_IMPLEMENTATION.md` - Current paper docs
12. `src/components/paper/*.tsx` - Paper components
13. `src/components/SentenceCard.tsx` - Sentence display
14. `src/components/GuessBar.tsx` - Input field
15. `tailwind.config.js` - Tailwind setup

### Tier 4: OPTIONAL (Context only)
16. Other component files
17. i18n files
18. Configuration files

---

## 🚀 QUICK START FOR AI

**Prompt Template:**

```
I need you to redesign the visual layout of Five Fold, a word guessing game.

The core problem: The game is called "Five Fold" and should feel like
unfolding a secret note 5 times, but the current design doesn't
communicate this metaphor strongly enough.

I'm providing you with:
1. DESIGN_REDESIGN_HANDOFF.md - Complete design brief
2. RESEARCH_SYNTHESIS.md - Original design research
3. All current component files
4. Design system files

Please read DESIGN_REDESIGN_HANDOFF.md first, then propose a bold
redesign that makes the "five fold" paper metaphor central to the
entire experience.

Focus on:
- Making phase progression feel like unfolding a note
- Using the fold metaphor as the core visual organizing principle
- Creating cohesive visual language across all screens
- Maintaining performance and accessibility

[Attach all files listed above]
```

---

## 📎 FILE EXPORT COMMANDS

If you need to export these files:

```bash
# Export all design docs
cp DESIGN_REDESIGN_HANDOFF.md RESEARCH_SYNTHESIS.md PAPER_DESIGN_IMPLEMENTATION.md /path/to/export/

# Export all components
cp -r src/components /path/to/export/

# Export design system
cp -r src/design /path/to/export/

# Export pages
cp -r src/pages /path/to/export/

# Export config
cp package.json tailwind.config.js tsconfig.json vite.config.ts /path/to/export/
```

---

## 💡 KEY INSIGHT

**The entire game should feel like a single piece of paper with 5 folds.**

When closed: Mystery sealed
Fold 1: Category hint peeks out
Fold 2: Sentence visible
Fold 3: All 5 hints revealed
Fold 4: AI nudge appears
Fold 5: Full analysis exposed

**Make this visual and obvious.**

---

## ✅ CHECKLIST FOR REDESIGN AI

Before starting, confirm you have:
- [ ] Read `DESIGN_REDESIGN_HANDOFF.md` completely
- [ ] Reviewed `RESEARCH_SYNTHESIS.md` for design principles
- [ ] Understood the 5-phase game flow from `PlayChallenge.tsx`
- [ ] Examined current design tokens in `tokens.ts` and `theme.css`
- [ ] Looked at existing paper components in `components/paper/`
- [ ] Identified the disconnect between "Five Fold" name and current design
- [ ] Ready to propose a bold, cohesive redesign

---

**Total Essential Files: ~25**
**Total Optional Files: ~15**
**Estimated Reading Time: 45-60 minutes**

Good luck! 🎨📝✨
