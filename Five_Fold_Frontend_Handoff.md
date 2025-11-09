# 🎨 Five Fold – Front-End Design & Animation Handoff

## Overview
**Goal:** Create a clean, elegant, interactive website that feels like unfolding a secret paper note or fortune teller.  
Each phase of gameplay is a “fold” that visually opens to reveal the next clue or AI reflection.  
The design should feel playful, intelligent, and intimate — like passing a note to a friend who knows your mind.

---

## 🧭 Core Creative Direction

**Visual Motif:** folded paper, origami, handwritten note, minimalist stationery aesthetic  
**Interaction Metaphor:** each guess or phase *unfolds another flap* of the paper  
**Emotion:** curiosity → understanding → satisfaction  
**Pacing:** soft animations, one fold at a time; each fold adds depth or color subtly  
**Sound cues:** light rustle / paper crinkle when folds open  
**Typography:** clean sans-serif for system text + subtle handwritten script accent for AI responses  
**Palette:** warm whites, graphite gray, soft indigo or navy accents, gentle shadows — evokes a desk with a note under lamplight  

---

## 🧩 Flow & Transitions

### Phase 0 – Start
- Background: neutral desk / warm gradient backdrop.
- Center: a folded-paper envelope or origami note.
- Hover → subtle crease animation, suggesting interactivity.
- Click **“Play Today”** → envelope unfolds into Phase 1.

---

### Phase 1 – Category Fold
- **Motion:** top-left flap opens.
- **Content:** category title (Science, History, Culture, Geography) + first factual sentence clue.
- Input box beneath: *“Type your first guess…”* → **Submit** button.
- After first guess: small glowing **Echo Word Orb** appears below clue (AI-generated “bridge word”).
  - Example: mystery = *cell phone*, guess = *shovel* → echo = *hand*.
  - If the guess improves, orb drifts upward slightly; if worse, drifts down.
- **Sound:** quiet rustle / pencil scribble.

**Feeling:** “Even my wrong guess gave me something to think about.”

---

### Phase 2 – Second Fold
- **Motion:** paper unfolds further downward.
- **Content:** second factual sentence clue appears.
- Echo orb persists, floating closer/farther relative to guess quality.
- No extra text — player focuses on improved intuition.
- **Transition:** origami-paper motion; camera angle shifts slightly for depth.

**Feeling:** “It’s alive — it’s responding to how I’m thinking.”

---

### Phase 3 – Anchor Fold (Five Adaptive Words)
- **Motion:** center flap opens.
- **Content:** five word “bubbles” animate in:
  `[ Portable ] [ Voice ] [ Screen ] [ Modern ] [ Connection ]`
- Each word’s brightness or motion subtly adjusts according to how related it is to the last guess.
  - Closer concepts pulse gently or glow.
  - Distant concepts fade or move slower.
- Player can hover or tap bubbles for a slight ripple (no tooltip).

**Feeling:** “I can sense which direction is right without being told.”

---

### Phase 4 – Reflection Fold (AI Summary Line + Pulse Trail)
- **Motion:** bottom flap unfolds.
- **Top element:** a horizontal **pulse line** appears with 3 dots (representing the 3 previous guesses) spaced according to closeness.
  - ●───●────●──────────→
- Beneath it, the AI writes a single sentence synthesizing the player’s reasoning pattern.

  Examples:
  > “You’ve chased inventions that broadcast outward; mine brings voices back to one another.”
  > “You’ve been guessing movement — this one never moves, yet it reaches farther.”

- **Typography:** handwritten script; fades in smoothly.
- **Feeling:** the AI “sees” you, not just your answers.

---

### Phase 5 – Summary Fold (Digest View & Final Guess)
- **Motion:** final flap opens flat, completing the unfolded paper.
- **Layout:** three vertical columns aligned side by side.

```
CLUES            |  YOUR GUESSES   |  AI NUDGES
------------------------------------------------
“It changed...”  |  Radio           | connects…
“It fits…”       |  Telephone       | smaller…
“Five Words:”    |  Pager           | closer…
```

- A thin **connector thread** animates down the card, linking related terms.
  - Thread glows brighter where reasoning improved.
- Beneath the table, AI types one synthesis sentence:

  > “Across your guesses you’ve chased **sound**, **size**, and **signal** — all that’s left is what fits in your **hand**.”

- **Final input field:** *“Your Final Guess…”* → **Submit**
- On submit:
  - **Correct:** thread flashes gold, morphs into the revealed answer.
  - **Incorrect:** thread fades to gray; caption appears:
    > “Today’s Answer: Cell Phone — built for connection.”

**Feeling:** “That wrapped up everything I learned today.”

---

## 💡 Design & Animation Notes

| Element | Color | Motion | Function |
|----------|-------|--------|-----------|
| Fold cards | Off-white paper w/ subtle shadow | Origami unfold (Framer Motion) | Marks new phase |
| Echo orb | Brand accent (soft glow) | Slow float & drift | Conceptual bridge |
| Word bubbles | Light grey → accent glow | Gentle “breathing” pulse | Hint proximity |
| Pulse line | Thin neutral | Dots animate left→right | Visual progress arc |
| Connector thread | Brand neon | Draw path (0.4s) | Final synthesis |
| AI line | Script font | Fade-in typing | Emotional closure |

---

## 🧠 Implementation Tips

**Frameworks:**  
- Use **React + Framer Motion** or **GSAP** for fold & line animations.  
- Each fold is a React component:  
  `FoldOne`, `FoldTwo`, `FoldThree`, `ReflectionFold`, `SummaryFold`.

**State:**  
- Store user guesses, AI responses, and semantic similarity scores in context.  
- Echo orb and word bubble motions are bound to similarity values (0–1 scale).

**Performance:**  
- Keep transitions under 600ms for snappy feedback.  
- All visuals should be vector-based for crisp scaling.

**Responsiveness:**  
- Desktop-first: folds open horizontally / diagonally.  
- Mobile: folds stack vertically with slide-down animations.

---

## 🖋️ Tone Guide for the AI
> “Design this site as if you’re animating a secret message being passed between two curious minds.  
> Every click should feel like opening another flap of an origami note — each fold hides insight.  
> The tone is clever, soft, and quietly emotional — a daily ritual of curiosity.”

---

## 🎬 Animation Reference Moodboard (for the AI)
- *Monument Valley* — serene, geometric unfolding.  
- *Apple Notes closing animation* — realistic paper fold.  
- *Notion* — minimalist calm.  
- *Ghibli*’s letter-writing scenes — warm intimacy.  
- *Origami fortune teller* — tactile curiosity.

---

## ✅ Deliverables for the AI
1. Full responsive web layout using the above flow.  
2. Paper-unfolding transitions between folds.  
3. Interactive echo orb & five-word bubble feedback.  
4. Pulse line & connector thread animations.  
5. One-screen summary fold with AI synthesis line.  

All text and logic placeholders should be dynamically populated via backend API.

---

*End of Handoff Document*
