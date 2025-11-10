# Research Synthesis Report: Paper/Note UI Patterns

## Research Sources & Key Findings

### 1. **Nicolas Gallagher's Pure CSS Folded Corner**
**URL:** https://nicolasgallagher.com/pure-css-folded-corner-effect/

**What to Borrow:**
- Single-element approach using CSS pseudo-elements
- Subtle shadow effects for depth without heaviness
- Performance-friendly (no images, pure CSS)
- Works in all modern browsers

**What to Avoid:**
- Complex implementations for simple backgrounds
- Overly prominent shadows that distract from content

**Key Technique:** Uses `::before` and `::after` with border triangles and positioning

---

### 2. **Design Shack Folded Corner Tutorial**
**URL:** https://designshack.net/articles/css/code-a-simple-folded-corner-effect-with-css/

**What to Borrow:**
- Box-shadow layering for realistic paper lift
- Border triangle technique for corner fold
- Responsive sizing considerations

**What to Avoid:**
- Fixed pixel dimensions (use relative units)
- Too many shadow layers (performance cost)

**Key Technique:** `border-bottom: 70px solid #eee; border-left: 70px solid transparent;`

---

### 3. **Sticky Note App Concepts (Dribbble/Behance)**
**URL:** https://www.designmonks.co/products/sticky-note-app-concept

**What to Borrow:**
- Minimalist aesthetic with clean layouts
- Intuitive interactions mimicking physical sticky notes
- Strategic CTA placement
- Color-coding for categories
- Drag-and-drop affordances

**What to Avoid:**
- Skeuomorphic overload (too realistic = dated)
- Cluttered layouts with too many notes visible
- Auto-animations that distract

**Key Insight:** Modern sticky note apps prioritize **accessibility and cross-device compatibility** over heavy visual effects

---

### 4. **Paper Texture Best Practices**
**URL:** https://www.vandelaydesign.com/paper-textures/

**What to Borrow:**
- Subtle, low-opacity textures (5-15% opacity)
- Radial or noise-based patterns for grain
- Layer textures only on containers, not text
- Use multiply or overlay blend modes

**What to Avoid:**
- High-contrast textures behind body text
- Heavy image-based textures (bad for performance)
- Textures that reduce contrast below WCAG AA (4.5:1)

**Key Principle:** Texture must **enhance, not impair** readability

---

### 5. **Typography on Textured Surfaces**
**URL:** https://www.numberanalytics.com/blog/ultimate-guide-to-texture-in-typography-and-readability

**What to Borrow:**
- Bold sans-serif fonts for textured backgrounds
- Minimum 16px body text (18px preferred)
- Increased line-height (1.6-1.8) for breathing room
- High contrast text colors

**What to Avoid:**
- Delicate serifs on heavy textures
- Light font weights (<400) on textured backgrounds
- Text directly on busy patterns

---

### 6. **Material Design Text Color Guidelines**
**URL:** https://webupon.com/blog/material-design-text-color/

**What to Borrow:**
- WCAG contrast ratios (4.5:1 minimum, 7:1 ideal)
- Focus ring visibility standards
- Color-blind friendly palettes
- Reduced motion media queries

**What to Avoid:**
- Low-contrast "designer gray" text
- Relying on color alone for information
- Animations without fallbacks

---

### 7. **Folded Paper Envelope Interactions**
**URL:** https://codepen.io/search/pens?q=envelope+animation

**What to Borrow:**
- Staged reveal animations (flap opens → content slides up)
- Transform-origin manipulation for realistic folds
- Subtle rotation (2-4 degrees) for personality
- Easing functions that feel "paper-like" (ease-out, cubic-bezier)

**What to Avoid:**
- Overly long animations (>500ms)
- Complex 3D transforms on mobile (performance)
- Autoplay without user trigger

---

### 8. **Accessibility-First Paper UI**
**URL:** https://blog.tubikstudio.com/ux-design-readable-user-interface/

**What to Borrow:**
- Focus indicators on all interactive elements
- Keyboard navigation support
- Screen reader announcements for state changes
- Reduced motion alternatives
- Touch target sizes (44x44px minimum)

**What to Avoid:**
- Pure visual differentiation (add labels/aria)
- Assuming mouse/hover interactions
- Complex gestures without alternatives

---

## Visual Mood Board (described)

**Color Palette:**
- Off-white paper (#FAF7F2, #F5F3E8)
- Charcoal ink (#1C1C1C, #2B2B2B)
- Forest green accent (#2D8B5F, #1E7049)
- Warm gold accent (#F59E0B, #D97706)

**Texture Style:**
- Subtle noise grain (2-3% opacity)
- Radial gradient warmth spots
- Soft edge shadows (0 6px 20px rgba(0,0,0,0.15))

**Fold/Crease Style:**
- 1px lines with green tint
- Linear gradients for depth
- Small corner triangles (rotated 45deg)
- Soft shadows for lift effect

---

## Design Principles (Final 6)

### 1. **Tactile, Not Kitsch**
Textures are subtle (≤10% opacity), never impair readability. Paper grain is felt, not seen. Use CSS/SVG for edges and folds—no heavy image assets.

### 2. **Motion with Meaning**
Folds indicate new information revealing. Envelopes signal state transitions (win/lose). Animations are 200-350ms with `ease-out` timing. Honor `prefers-reduced-motion`.

### 3. **Read First**
Body text minimum 16px (18px preferred), line-height 1.6-1.8. WCAG AA contrast (4.5:1). Generous spacing (16/24/32px rhythm). No texture behind text.

### 4. **Mobile-First Baseline**
Single-column layouts scale up. Touch targets ≥44px. Hover effects have touch alternatives. Test on 375px viewport first.

### 5. **Lightweight & Fast**
CSS gradients for folds, not images. Lazy-load non-critical textures. Target LCP <2s, CLS <0.05. Bundle split for code components.

### 6. **Respect Attention**
No autoplay distractions. User-triggered animations only. Subtle ambient motion (gentle float). Clear focus states for keyboard users.

---

## Component Strategy

**Core Building Blocks:**
1. `PaperSurface` - Base container with texture, rounded corners, shadows
2. `FoldedCornerCard` - Reveals with corner fold animation
3. `EnvelopePanel` - Opens like mail for results/modals
4. `StickyNote` - Small accent chips for tags/hints
5. `PaperInput` - Text input with paper texture border

**Animation Library:** Framer Motion (tree-shakeable, performant)

**Texture Approach:** CSS background patterns + optional SVG noise overlay

---

## Performance Budget

- **LCP:** <2.0s (desktop), <2.5s (mobile)
- **FID:** <100ms
- **CLS:** <0.05
- **Bundle Size:** <200KB (gzipped)
- **Lighthouse:** Performance ≥90, Accessibility ≥95

---

## Accessibility Checklist

- [x] WCAG AA contrast ratios
- [x] Keyboard navigation (Tab, Enter, Esc)
- [x] Focus indicators visible
- [x] `prefers-reduced-motion` respected
- [x] ARIA labels for dynamic content
- [x] Screen reader announcements
- [x] Touch targets ≥44x44px
- [x] No color-only information

---

**Summary:** Modern paper UIs succeed by being **subtle, fast, and accessible**. The aesthetic comes from careful layering of shadows, thoughtful animation timing, and respect for content hierarchy—not from heavy textures or skeuomorphic excess.
