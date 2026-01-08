# Detective Board Prototype - Complete Handoff Document

**Purpose**: This document contains everything needed to build a standalone prototype of the "Detective Board" puzzle game. Copy this entire document into a fresh Claude/Bolt session and say "Build this prototype."

---

## THE CONCEPT

Detective Board is a deductive puzzle game where players piece together clues on an interactive "evidence board" to identify a mystery subject (person, place, or thing).

### Core Metaphor
Think of a classic movie detective's corkboard - red string connecting photos, newspaper clippings, sticky notes, and scribbled observations. The player IS the detective, connecting the dots.

### How It Works
1. Player starts with a nearly empty board with just a few cryptic clues
2. Each wrong guess reveals a NEW piece of evidence that gets "pinned" to the board
3. The AI analyzes their guesses and generates contextual hints that help without giving away the answer
4. Clues can be dragged, connected with string, and annotated
5. The visual board fills up as they investigate, creating a satisfying "aha!" moment when solved

### Key Differentiators from Linear Hint Games
- **Spatial reasoning**: Clues can be physically arranged to find patterns
- **Connections visible**: Red string between related clues shows relationships
- **Non-linear revelation**: Multiple clue "threads" can be pursued
- **Detective fantasy**: Player feels like they're solving a case, not just guessing

---

## VISUAL DESIGN LANGUAGE

### Color Palette (Forest/Gold/Cream - warm, sophisticated)

```javascript
const colors = {
  paper: {
    50: '#FDFDF8',   // Lightest paper
    100: '#FAF9F2',  // Light paper
    200: '#F5F3E8',  // Medium paper
    300: '#EBE8D6',  // Dark paper
    cream: '#FFF8E7', // Warm cream
  },
  ink: {
    100: '#8B8570',  // Light ink
    200: '#6B6656',  // Medium ink
    300: '#4A483C',  // Dark ink
    400: '#2E2D24',  // Darker ink
    500: '#1C1B16',  // Darkest ink
    charcoal: '#2A2922',
  },
  forest: {
    50: '#F5FAF7',
    100: '#E6F4ED',
    200: '#C8E6D7',
    300: '#9DD4BA',
    400: '#6BB896',
    500: '#3E6B48',  // Primary forest
    600: '#2F5438',
    700: '#234029',
    800: '#1A2F1F',
  },
  gold: {
    50: '#FFFEF5',
    100: '#FFFBEA',
    200: '#FFF6D1',
    300: '#FFECAA',
    400: '#FFD966',
    500: '#F4C430',  // Primary gold
    600: '#D4A92C',
    700: '#B88F24',
    800: '#8C6B1A',
  },
  // Board-specific colors
  cork: '#C4A574',    // Cork board background
  redString: '#C0392B', // Connection string
  pushPin: {
    red: '#E74C3C',
    blue: '#3498DB',
    green: '#27AE60',
    yellow: '#F1C40F',
  }
};
```

### Typography
```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],      // UI elements
  serif: ['Playfair Display', 'Georgia', 'serif'], // Headlines, clue titles
  script: ['Caveat', 'cursive'],                   // Handwritten notes
}
```

### Shadow System (Paper/Tactile Feel)
```css
--shadow-paper: 0 2px 4px rgba(45, 139, 95, 0.08),
               0 6px 16px rgba(45, 139, 95, 0.06),
               inset 0 1px 0 rgba(255, 255, 255, 0.95);

--shadow-lifted: 0 4px 8px rgba(45, 139, 95, 0.12),
                0 8px 24px rgba(45, 139, 95, 0.08);

--shadow-pinned: 0 8px 16px rgba(0, 0, 0, 0.2),
                0 2px 4px rgba(0, 0, 0, 0.1);
```

---

## ANIMATION PATTERNS

### Essential CSS Animations (Copy These Exactly)

```css
@keyframes paperUnfold {
  0% {
    opacity: 0;
    transform: perspective(1200px) rotateX(-90deg) translateY(-30px) scale(0.94);
    filter: blur(3px) brightness(0.9);
    transform-origin: top center;
  }
  40% {
    opacity: 0.6;
    transform: perspective(1200px) rotateX(-15deg) translateY(-5px) scale(0.98);
    filter: blur(1px) brightness(0.95);
  }
  70% {
    opacity: 0.9;
    transform: perspective(1200px) rotateX(3deg) translateY(2px) scale(1.01);
    filter: blur(0px) brightness(1);
  }
  100% {
    opacity: 1;
    transform: perspective(1200px) rotateX(0deg) translateY(0) scale(1);
    filter: blur(0px) brightness(1);
  }
}

@keyframes pinDrop {
  0% {
    transform: translateY(-100px) scale(0.5);
    opacity: 0;
  }
  60% {
    transform: translateY(10px) scale(1.1);
    opacity: 1;
  }
  80% {
    transform: translateY(-5px) scale(0.95);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

@keyframes stringDraw {
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes successGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(45, 139, 95, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(45, 139, 95, 0.6);
  }
}

/* Utility classes */
.animate-paper-unfold {
  animation: paperUnfold 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  transform-style: preserve-3d;
}

.animate-pin-drop {
  animation: pinDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-string-draw {
  stroke-dasharray: 1000;
  animation: stringDraw 1.5s ease-out forwards;
}

.animate-wrong-shake {
  animation: wrongShake 0.4s ease-in-out;
}

/* Paper texture overlay */
.paper-texture {
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(45, 139, 95, 0.02) 2px,
      rgba(45, 139, 95, 0.02) 3px
    ),
    radial-gradient(circle at 30% 40%, rgba(245, 158, 11, 0.03) 0%, transparent 60%);
}

/* Cork board texture */
.cork-texture {
  background:
    radial-gradient(ellipse at 20% 30%, rgba(196, 165, 116, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(180, 150, 100, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #C4A574 0%, #B8956A 50%, #C4A574 100%);
}
```

### Framer Motion Patterns

```tsx
// For new evidence appearing
const evidenceAppear = {
  initial: { scale: 0, rotate: -180, opacity: 0 },
  animate: { scale: 1, rotate: 0, opacity: 1 },
  transition: { type: 'spring', stiffness: 260, damping: 20 }
};

// For draggable items
const draggableConfig = {
  drag: true,
  dragMomentum: false,
  dragElastic: 0.1,
  whileDrag: { scale: 1.05, zIndex: 100 }
};

// For string connections (SVG)
const stringVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1, ease: "easeOut" }
  }
};
```

### GSAP Integration Pattern

```tsx
import { gsap } from 'gsap';

// Wrong guess shake
const shakeElement = (ref: React.RefObject<HTMLElement>) => {
  if (ref.current) {
    gsap.to(ref.current, {
      x: [-8, 8, -6, 6, -4, 4, 0],
      rotation: [-0.5, 0.5, -0.3, 0.3, 0],
      duration: 0.5,
      ease: 'power2.out',
    });
  }
};

// New clue reveal
const revealClue = (ref: React.RefObject<HTMLElement>) => {
  if (ref.current) {
    gsap.fromTo(ref.current,
      {
        rotateX: 90,
        opacity: 0,
        y: 100,
        transformOrigin: 'bottom center',
      },
      {
        rotateX: 0,
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        clearProps: 'transform',
      }
    );
  }
};
```

---

## COMPONENT ARCHITECTURE

### 1. DetectiveBoard (Main Container)
```tsx
interface DetectiveBoardProps {
  caseId: string;
  initialClues: Clue[];
  mysteryType: 'person' | 'place' | 'thing';
}

// The main cork board canvas where evidence is pinned
// Handles drag-drop, zoom/pan, connection drawing
```

### 2. EvidenceCard (Draggable Clue)
```tsx
interface EvidenceCardProps {
  id: string;
  type: 'photo' | 'document' | 'note' | 'newspaper' | 'object';
  content: string;
  position: { x: number; y: number };
  rotation?: number; // Slight random tilt for realism
  pinColor?: 'red' | 'blue' | 'green' | 'yellow';
  isNew?: boolean; // Triggers pin-drop animation
  onDrag: (id: string, pos: { x: number; y: number }) => void;
  onConnect: (fromId: string, toId: string) => void;
}
```

### 3. StringConnection (Red String SVG)
```tsx
interface StringConnectionProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isDrawing?: boolean; // Animated reveal
  color?: string;
}

// Renders curved SVG path between two points
// Uses quadratic bezier for natural droop
```

### 4. ClueRevealer (AI-Generated Hint Display)
```tsx
interface ClueRevealerProps {
  aiResponse: {
    newClue: string;
    clueType: 'photo' | 'document' | 'note' | 'newspaper' | 'object';
    connection?: string; // What it relates to
    crypticHint: string; // The actual hint text
  };
  onRevealComplete: () => void;
}

// Dramatic reveal animation when new evidence appears
// Typewriter effect for AI-generated text
```

### 5. GuessInput (Styled Input Bar)
```tsx
interface GuessInputProps {
  onSubmit: (guess: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isThinking?: boolean; // Shows loading state
}
```

### 6. CaseBriefing (Initial Case Introduction)
```tsx
interface CaseBriefingProps {
  mysteryType: 'person' | 'place' | 'thing';
  initialContext: string; // Opening scenario
  firstClues: Clue[];
  onStart: () => void;
}

// Envelope opening animation revealing the case file
```

### 7. CaseSolved (Victory Screen)
```tsx
interface CaseSolvedProps {
  answer: string;
  guessCount: number;
  cluesRevealed: number;
  connections: number;
  timeElapsed: number;
  onShare: () => void;
  onNewCase: () => void;
}
```

---

## AI INTEGRATION

### Edge Function: `generate-detective-clue`

This is the key AI component that makes the game adaptive and engaging.

```typescript
// supabase/functions/generate-detective-clue/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateClueRequest {
  token: string;              // JWT with answer encoded
  wrongGuesses: string[];     // All wrong guesses so far
  existingClues: string[];    // Clues already on the board
  guessCount: number;         // How many guesses made
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { token, wrongGuesses, existingClues, guessCount } = await req.json();

    // Decode JWT to get the answer (same pattern as Mystle)
    const secret = Deno.env.get("CHALLENGE_SIGNING_SECRET");
    // ... JWT verification logic ...
    const { target, type } = payload; // The answer and type

    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    // Determine clue type based on progress
    const clueTypes = ['document', 'photo', 'note', 'newspaper', 'object'];
    const clueType = clueTypes[guessCount % clueTypes.length];

    const prompt = `You are creating evidence for a detective board puzzle game.

ANSWER: ${target} (${type})

WRONG GUESSES SO FAR:
${wrongGuesses.map((g, i) => `${i + 1}. ${g}`).join('\n')}

CLUES ALREADY REVEALED:
${existingClues.join('\n')}

Generate a NEW piece of evidence that:
1. Provides a fresh angle on the answer
2. Connects to at least one wrong guess (show why they're on the right track)
3. Does NOT reveal the answer directly
4. Fits the evidence type: ${clueType}

For clue type "${clueType}":
- document: Official text, certificate, letter excerpt
- photo: Description of what the photo shows
- note: Handwritten observation or witness statement
- newspaper: Headline or article snippet
- object: Physical item description

RESPOND IN JSON:
{
  "clueType": "${clueType}",
  "clueTitle": "Brief title (3-5 words)",
  "clueContent": "The actual clue text (1-3 sentences)",
  "connectionTo": "Which wrong guess this relates to, or null",
  "connectionReason": "Why this connects (1 sentence)",
  "difficulty": "easy|medium|hard"
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.8,
        max_tokens: 200,
        messages: [
          { role: "system", content: "Generate detective evidence. Be cryptic but fair. Never reveal the answer." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
```

### Edge Function: `analyze-detective-guess`

Provides intelligent feedback on guesses.

```typescript
// supabase/functions/analyze-detective-guess/index.ts

const prompt = `ANSWER: ${target}
GUESS: ${guess}

Rate this guess:
1. Semantic similarity (0-100): How conceptually close?
2. Category match: Same domain/field?
3. Missing angle: What aspect did they overlook?

RESPOND IN JSON:
{
  "score": 0-100,
  "isCorrect": boolean,
  "feedback": "One sentence hint without revealing answer",
  "relatedClues": ["Which existing clues support a better guess"],
  "suggestedConnection": "What they should connect on the board"
}`;
```

---

## DATABASE SCHEMA

```sql
/*
  # Detective Board Schema

  1. Tables
    - cases: The mystery to solve
    - case_evidence: Individual clues/evidence pieces
    - case_connections: Red string connections between evidence
    - case_attempts: Player guesses
    - case_sessions: Player progress

  2. Security
    - RLS enabled on all tables
    - Public read for case stats
    - Insert-only for tracking
*/

-- Cases (the mysteries)
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mystery_type text NOT NULL CHECK (mystery_type IN ('person', 'place', 'thing')),
  target text NOT NULL,
  target_aliases text[] DEFAULT '{}',
  initial_context text NOT NULL,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_daily boolean DEFAULT false,
  daily_date date,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX idx_cases_daily ON cases(is_daily, daily_date);

-- Evidence pieces (clues on the board)
CREATE TABLE IF NOT EXISTS case_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id),
  evidence_type text NOT NULL CHECK (evidence_type IN ('photo', 'document', 'note', 'newspaper', 'object', 'initial')),
  title text NOT NULL,
  content text NOT NULL,
  reveal_order int NOT NULL DEFAULT 0,
  is_initial boolean DEFAULT false,
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_case_evidence_case ON case_evidence(case_id);

-- Player sessions
CREATE TABLE IF NOT EXISTS case_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id),
  session_id text NOT NULL,
  board_state jsonb DEFAULT '{}',
  guesses_made int DEFAULT 0,
  evidence_revealed int DEFAULT 0,
  connections_made int DEFAULT 0,
  is_solved boolean DEFAULT false,
  solve_time_seconds int,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(case_id, session_id)
);

-- Guess attempts
CREATE TABLE IF NOT EXISTS case_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id),
  session_id text NOT NULL,
  guess_text text NOT NULL,
  similarity_score int,
  is_correct boolean DEFAULT false,
  ai_feedback text,
  attempted_at timestamptz DEFAULT now()
);

CREATE INDEX idx_case_attempts_case ON case_attempts(case_id);

-- String connections made by player
CREATE TABLE IF NOT EXISTS case_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  from_evidence_id uuid REFERENCES case_evidence(id),
  to_evidence_id uuid REFERENCES case_evidence(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_connections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can read cases" ON cases FOR SELECT USING (true);
CREATE POLICY "Public can read evidence" ON case_evidence FOR SELECT USING (true);
CREATE POLICY "Anyone can create sessions" ON case_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own session" ON case_sessions FOR UPDATE USING (true);
CREATE POLICY "Anyone can log attempts" ON case_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create connections" ON case_connections FOR INSERT WITH CHECK (true);
```

---

## TRACKING UTILITIES

### Session Management
```typescript
// src/utils/tracking.ts

const SESSION_KEY = 'detective_session_id';

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export async function trackEvent(
  eventType: 'visit' | 'guess' | 'reveal' | 'connect' | 'solve',
  caseId: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/track-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        event_type: eventType,
        case_id: caseId,
        session_id: getSessionId(),
        data,
      }),
    });
  } catch (error) {
    // Fail silently
  }
}
```

### Fetch with Timeout
```typescript
// src/utils/fetchWithTimeout.ts

interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
}

export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## GAME FLOW STATE MACHINE

```typescript
type GameState =
  | 'briefing'      // Initial case presentation
  | 'investigating' // Active gameplay
  | 'thinking'      // Waiting for AI response
  | 'revealing'     // New evidence animation
  | 'solved'        // Victory!
  | 'stumped';      // Optional: gave up or ran out of guesses

interface GameContext {
  caseId: string;
  mysteryType: 'person' | 'place' | 'thing';
  answer: string;
  guesses: string[];
  evidence: Evidence[];
  connections: Connection[];
  currentState: GameState;
  guessCount: number;
  startTime: number;
}
```

---

## EXAMPLE CASE DATA

```typescript
const exampleCase = {
  mysteryType: 'person',
  target: 'Marie Curie',
  targetAliases: ['Maria Sklodowska', 'Madame Curie'],
  initialContext: `A case file lands on your desk. The subject changed the world,
    but their story began far from where they made history.
    Two glowing discoveries. One tragic end. Who is this pioneer?`,
  initialEvidence: [
    {
      type: 'document',
      title: 'University Records',
      content: 'First woman to earn a PhD in Physics at this institution. Paris, 1903.',
    },
    {
      type: 'newspaper',
      title: 'Nobel Committee Archives',
      content: 'HISTORIC: Same individual receives second Nobel Prize, different field.',
    },
    {
      type: 'photo',
      title: 'Laboratory Portrait',
      content: 'Subject photographed with husband, surrounded by glowing vials. The glow is not from the lighting.',
    }
  ],
};
```

---

## TAILWIND CONFIG

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FDFDF8',
          100: '#FAF9F2',
          200: '#F5F3E8',
          300: '#EBE8D6',
          cream: '#FFF8E7',
        },
        ink: {
          100: '#8B8570',
          200: '#6B6656',
          300: '#4A483C',
          400: '#2E2D24',
          500: '#1C1B16',
          charcoal: '#2A2922',
        },
        forest: {
          50: '#F5FAF7',
          100: '#E6F4ED',
          200: '#C8E6D7',
          300: '#9DD4BA',
          400: '#6BB896',
          500: '#3E6B48',
          600: '#2F5438',
          700: '#234029',
          800: '#1A2F1F',
        },
        gold: {
          50: '#FFFEF5',
          100: '#FFFBEA',
          200: '#FFF6D1',
          300: '#FFECAA',
          400: '#FFD966',
          500: '#F4C430',
          600: '#D4A92C',
          700: '#B88F24',
          800: '#8C6B1A',
        },
        cork: '#C4A574',
        string: '#C0392B',
      },
      fontFamily: {
        script: ['Caveat', 'cursive'],
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'pin-drop': 'pinDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'paper-unfold': 'paperUnfold 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'string-draw': 'stringDraw 1.5s ease-out forwards',
        'wrong-shake': 'wrongShake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
};
```

---

## DEPENDENCIES

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "framer-motion": "^12.23.24",
    "gsap": "^3.13.0",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.9.5"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.2"
  }
}
```

---

## BUILD INSTRUCTIONS FOR NEW SESSION

1. **Create a new Vite + React + TypeScript project**
2. **Install dependencies** from the list above
3. **Set up Supabase** with the schema provided
4. **Deploy edge functions** for AI generation
5. **Build components** in this order:
   - PaperSurface (base styling)
   - EvidenceCard (draggable clue)
   - StringConnection (SVG path)
   - DetectiveBoard (main canvas)
   - GuessInput
   - ClueRevealer (AI response display)
   - CaseBriefing (intro)
   - CaseSolved (victory)

6. **Wire up the game loop**:
   - Load case data
   - Display initial evidence
   - Accept guesses
   - Call AI for new clues on wrong guesses
   - Check for correct answer
   - Celebrate on solve

---

## KEY UX PRINCIPLES

1. **Every wrong guess feels productive** - New evidence appears, making the board richer
2. **Spatial memory matters** - Players arrange clues to their thinking style
3. **Connections are satisfying** - Drawing red string between related clues is tactile and fun
4. **AI hints are contextual** - They respond to what the player has tried, not generic
5. **The board tells a story** - By the end, it's a visual record of the investigation

---

## NOTES FROM MYSTLE DEVELOPMENT

- Use `fetchWithTimeout` for all API calls (prevents hanging)
- Always handle CORS in edge functions with the exact headers shown
- Paper texture CSS creates the warm, tactile feel
- GSAP for shake animations, Framer Motion for entrance/exit
- Store progress in localStorage to survive refreshes
- Track everything - it helps understand player behavior

---

**End of Handoff Document**

Copy everything above into a fresh session and request: "Build the Detective Board prototype based on this specification."
