# HANDOFF DOCUMENT: Phase 4 & Phase 5 Implementation

## Overview
This document details all backend changes made and provides complete integration instructions for the frontend AI to implement Phase 4 (AI Nudge) and Phase 5 (Visual Connections).

---

## 🎯 What Was Changed

### 1. Fixed AI Randomness (CRITICAL FIX)
**Problem**: AI was generating obscure subjects like "Hedy Lamarr" instead of mainstream ones.

**Solution**: Changed from guidance-based prompts to STRICT LIST-BASED selection.

**Files Modified**:
- `supabase/functions/daily-challenge/index.ts` (lines 36-242)
- `supabase/functions/force-new-daily/index.ts` (lines 35-241)

**What Changed**:
- AI now MUST pick from a curated list of 70-80 mainstream subjects per category
- NO creative generation - only selects from provided list
- Lists include: Einstein, Cleopatra, Eiffel Tower, Mona Lisa, etc. (all household names)
- Still excludes subjects used in last 14 days for variety

**Impact**: Daily challenges will now ONLY use recognizable subjects that average Americans would know.

---

### 2. NEW Backend Endpoint: Phase 4 - AI Nudge
**File**: `supabase/functions/phase4-nudge/index.ts` (NEW FILE)

**Purpose**: After 5 wrong guesses, analyze all hints and guesses to give player a helpful one-sentence nudge.

**Endpoint**: `POST /functions/v1/phase4-nudge`

**Request Body**:
```json
{
  "target": "Marie Curie",
  "type": "person",
  "guesses": ["Einstein", "Newton", "Tesla", "Edison", "Darwin"],
  "hints": {
    "phase1": ["science", "radiation", "Nobel", "pioneer", "France"],
    "phase2": "This groundbreaking physicist was the first woman to win a Nobel Prize.",
    "phase3": {
      "geography": "Born in Warsaw, Poland, worked in France",
      "history": "1867-1934, pioneering research in radioactivity",
      "culture": "First woman to win Nobel Prize, only person to win in two sciences",
      "stats": "Won 2 Nobel Prizes (Physics 1903, Chemistry 1911)",
      "visual": "Known for work with glowing radium samples in her laboratory"
    }
  }
}
```

**Response**:
```json
{
  "nudge": "You've explored male scientists and inventors—think Nobel laureate who broke gender barriers first.",
  "keywords": ["science", "Nobel", "pioneer"],
  "relevance_order": ["Nobel", "science", "pioneer"]
}
```

**AI Logic**:
- Picks 2-3 keywords from hints and guesses
- Calculates semantic overlap with correct answer
- Generates EXACTLY 12-word sentence that nudges without revealing
- Conversational tone, like talking directly to player

---

### 3. NEW Backend Endpoint: Phase 5 - Visual Connections
**File**: `supabase/functions/phase5-visual/index.ts` (NEW FILE)

**Purpose**: After Phase 4, provide semantic analysis and visual connection data to help player see patterns.

**Endpoint**: `POST /functions/v1/phase5-visual`

**Request Body**:
```json
{
  "target": "Marie Curie",
  "type": "person",
  "guesses": ["Einstein", "Newton", "Tesla", "Edison", "Darwin", "Galileo"],
  "hints": {
    "phase1": ["science", "radiation", "Nobel", "pioneer", "France"],
    "phase2": "This groundbreaking physicist was the first woman to win a Nobel Prize.",
    "phase3": {
      "geography": "Born in Warsaw, Poland, worked in France",
      "history": "1867-1934, pioneering research in radioactivity",
      "culture": "First woman to win Nobel Prize, only person to win in two sciences",
      "stats": "Won 2 Nobel Prizes (Physics 1903, Chemistry 1911)",
      "visual": "Known for work with glowing radium samples in her laboratory"
    },
    "phase4_nudge": "You've explored male scientists and inventors—think Nobel laureate who broke gender barriers first."
  }
}
```

**Response**:
```json
{
  "semantic_scores": [
    {
      "guess": "Einstein",
      "score": 75,
      "reason": "Fellow Nobel Prize winner in physics, similar era"
    },
    {
      "guess": "Newton",
      "score": 60,
      "reason": "Pioneering physicist, but different century"
    },
    {
      "guess": "Tesla",
      "score": 55,
      "reason": "Inventor and scientist from similar time period"
    },
    {
      "guess": "Edison",
      "score": 50,
      "reason": "Contemporary inventor, different field"
    },
    {
      "guess": "Darwin",
      "score": 45,
      "reason": "Revolutionary scientist, but biology not physics"
    },
    {
      "guess": "Galileo",
      "score": 40,
      "reason": "Physicist but much earlier era"
    }
  ],
  "connections": [
    {
      "guess": "Einstein",
      "hint": "phase1",
      "pattern": "Connected 'Nobel' and 'science' keywords"
    },
    {
      "guess": "Newton",
      "hint": "phase1",
      "pattern": "Focused on 'science' and 'pioneer' aspects"
    },
    {
      "guess": "Tesla",
      "hint": "phase3",
      "pattern": "Picked up on innovation and discovery themes"
    },
    {
      "guess": "Edison",
      "hint": "phase2",
      "pattern": "Focused on 'groundbreaking' descriptor"
    },
    {
      "guess": "Darwin",
      "hint": "phase1",
      "pattern": "Connected to 'science' keyword"
    },
    {
      "guess": "Galileo",
      "hint": "phase2",
      "pattern": "Associated with physicist descriptor"
    }
  ],
  "synthesis": "You've chased Nobel, physics, and innovation—but missed the pioneer who shattered gender barriers first.",
  "themes_identified": ["science", "Nobel Prize", "physics", "innovation"],
  "themes_missing": ["gender barrier", "first woman", "radioactivity", "dual Nobel winner"]
}
```

**AI Logic**:
- Rates each guess 0-100 on semantic similarity to answer
- Maps which hint led to which guess
- Generates poetic synthesis sentence
- Identifies what themes player found vs. missed

---

## 🎨 Frontend Integration Guide

### Current Game Flow (3 Phases, 3 Lives)
```
Phase 1: Pick category → Guess → Wrong → Lose life → Phase 2
Phase 2: Sentence hint → Guess → Wrong → Lose life → Phase 3
Phase 3: Five words → Guess → Wrong → Lose life → Game Over
```

### NEW Game Flow (5 Phases, 5 Lives)
```
Phase 1: Pick category → Guess → Wrong → Lose life → Phase 2
Phase 2: Sentence hint → Guess → Wrong → Lose life → Phase 3
Phase 3: Five words → Guess → Wrong → Lose life → Phase 4 [NEW]
Phase 4: AI Nudge → Guess → Wrong → Lose life → Phase 5 [NEW]
Phase 5: Visual Connections → Guess → Wrong → Reveal Answer
```

### Detailed Phase 4 Implementation

**When to Trigger**: After player makes 5th wrong guess (when lives would hit 0 under old system)

**Steps**:
1. **Don't end the game yet** - instead of showing game over, trigger Phase 4
2. **Call the Phase 4 API**:
   ```typescript
   const response = await fetch(`${SUPABASE_URL}/functions/v1/phase4-nudge`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
     },
     body: JSON.stringify({
       target: actualAnswer, // You'll need to get this from token or server
       type: challengeType,
       guesses: wrongGuesses,
       hints: {
         phase1: hints.phase1,
         phase2: hints.phase2,
         phase3: hints.phase3,
       },
     }),
   });

   const data = await response.json();
   const nudgeText = data.nudge;
   ```

3. **Display the Nudge**:
   - Show a special card/component with the AI nudge
   - Use conversational, encouraging tone
   - Make it visually distinct (maybe blue/purple theme vs gold/bronze)
   - Example design:
   ```
   ╔════════════════════════════════════════════╗
   ║  🤖 AI Hint                                ║
   ║                                            ║
   ║  "You've explored male scientists and     ║
   ║   inventors—think Nobel laureate who      ║
   ║   broke gender barriers first."           ║
   ║                                            ║
   ║  [Continue Guessing...]                   ║
   ╚════════════════════════════════════════════╝
   ```

4. **Give 1-2 More Guesses**:
   - Allow player to guess again after seeing nudge
   - Consider adding 1-2 more lives OR tracking separately
   - If still wrong, proceed to Phase 5

**UI State Changes**:
```typescript
// In PlayChallenge.tsx, add new states:
const [phase4Nudge, setPhase4Nudge] = useState<string | null>(null);
const [phase, setPhase] = useState<Phase>(1); // Change Phase type to 1 | 2 | 3 | 4 | 5

// Update handleGuess logic:
if (remainingLives <= 0) {
  if (phase === 3) {
    // Instead of ending game, fetch Phase 4 nudge
    const nudgeResponse = await fetchPhase4Nudge(...);
    setPhase4Nudge(nudgeResponse.nudge);
    setPhase(4);
    setLives(1); // Give one more life for Phase 4
  } else if (phase === 4) {
    // Move to Phase 5
    const visualResponse = await fetchPhase5Visual(...);
    setPhase5Data(visualResponse);
    setPhase(5);
    setLives(1); // Give one more life for Phase 5
  } else {
    // Actually end the game now
    setGameState('failed');
  }
}
```

### Detailed Phase 5 Implementation

**When to Trigger**: After player makes wrong guess in Phase 4

**Steps**:
1. **Call the Phase 5 API**:
   ```typescript
   const response = await fetch(`${SUPABASE_URL}/functions/v1/phase5-visual`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
     },
     body: JSON.stringify({
       target: actualAnswer,
       type: challengeType,
       guesses: wrongGuesses,
       hints: {
         phase1: hints.phase1,
         phase2: hints.phase2,
         phase3: hints.phase3,
         phase4_nudge: phase4Nudge, // Include the previous nudge
       },
     }),
   });

   const data = await response.json();
   ```

2. **Display Visual Connections**:

   **Option A: Table View with Glowing Thread**
   ```
   ╔═══════════════════════════════════════════════════════════╗
   ║  🔗 Your Journey So Far                                   ║
   ║                                                           ║
   ║  Guess      Closeness  Connection                        ║
   ║  ────────────────────────────────────────────────────────║
   ║  Einstein   ████████ 75%  Nobel + Science ← [GLOW]      ║
   ║  Newton     ██████░░ 60%  Pioneer physicist              ║
   ║  Tesla      █████░░░ 55%  Innovation                     ║
   ║  Edison     ████░░░░ 50%  Inventor                       ║
   ║  Darwin     ███░░░░░ 45%  Science                        ║
   ║  Galileo    ██░░░░░░ 40%  Physicist                      ║
   ║                                                           ║
   ║  💡 "You've chased Nobel, physics, and innovation—       ║
   ║      but missed the pioneer who shattered gender         ║
   ║      barriers first."                                    ║
   ║                                                           ║
   ║  [Make Your Final Guess...]                              ║
   ╚═══════════════════════════════════════════════════════════╝
   ```

   **Option B: Visual Thread Animation**
   - Draw SVG/Canvas lines connecting guesses to hints
   - Color-code by semantic score (green = closer, red = farther)
   - Animate a "glowing thread" sweeping through connections
   - Highlight the TOP 2 guesses as "warmest"

   **Option C: Summary Cards**
   ```
   ╔════════════════════╗  ╔════════════════════╗
   ║ ✅ You Found:      ║  ║ ❌ You Missed:     ║
   ║                    ║  ║                    ║
   ║ • Science          ║  ║ • Gender barrier   ║
   ║ • Nobel Prize      ║  ║ • First woman      ║
   ║ • Physics          ║  ║ • Radioactivity    ║
   ║ • Innovation       ║  ║ • Dual Nobel       ║
   ╚════════════════════╝  ╚════════════════════╝

   💬 "You've chased Nobel, physics, and innovation—but
       missed the pioneer who shattered gender barriers first."
   ```

3. **Implementation Details**:
   ```typescript
   interface Phase5Data {
     semantic_scores: Array<{
       guess: string;
       score: number;
       reason: string;
     }>;
     connections: Array<{
       guess: string;
       hint: string;
       pattern: string;
     }>;
     synthesis: string;
     themes_identified: string[];
     themes_missing: string[];
   }

   const [phase5Data, setPhase5Data] = useState<Phase5Data | null>(null);

   // Render Phase 5 component
   {phase === 5 && phase5Data && (
     <Phase5Visual
       data={phase5Data}
       onFinalGuess={handleGuess}
     />
   )}
   ```

4. **Animation Suggestions**:
   - Fade in synthesis text with typing effect
   - Stagger reveal of semantic scores (top to bottom)
   - Glow effect on highest-scoring guesses
   - Subtle pulse on "themes_missing" section
   - Connecting lines that "draw" from guesses to related hints

---

## 📊 Complete Data Flow

### Phase 4 API Call
```typescript
// When lives hit 0 after Phase 3
const fetchPhase4Nudge = async () => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/phase4-nudge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        target: actualAnswer, // From token decode or check-guess response
        type: challengeType,
        guesses: wrongGuesses,
        hints: hints,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get Phase 4 nudge');
    }

    return await response.json();
  } catch (error) {
    console.error('Phase 4 error:', error);
    // Fallback: proceed to game over
    return null;
  }
};
```

### Phase 5 API Call
```typescript
const fetchPhase5Visual = async (phase4Nudge: string) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/phase5-visual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        target: actualAnswer,
        type: challengeType,
        guesses: wrongGuesses,
        hints: {
          ...hints,
          phase4_nudge: phase4Nudge,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get Phase 5 visual data');
    }

    return await response.json();
  } catch (error) {
    console.error('Phase 5 error:', error);
    return null;
  }
};
```

---

## 🔧 Required Code Changes

### 1. Update Type Definitions
```typescript
// In PlayChallenge.tsx
type Phase = 1 | 2 | 3 | 4 | 5; // Update from 1 | 2 | 3

interface Hints {
  phase1: string[];
  phase2: string;
  phase3: {
    geography: string;
    history: string;
    culture: string;
    stats: string;
    visual: string;
  };
  phase4_nudge?: string; // NEW
}

interface Phase5Data {
  semantic_scores: Array<{
    guess: string;
    score: number;
    reason: string;
  }>;
  connections: Array<{
    guess: string;
    hint: string;
    pattern: string;
  }>;
  synthesis: string;
  themes_identified: string[];
  themes_missing: string[];
}
```

### 2. Add New State Variables
```typescript
const [phase4Nudge, setPhase4Nudge] = useState<string | null>(null);
const [phase5Data, setPhase5Data] = useState<Phase5Data | null>(null);
const [actualAnswer, setActualAnswer] = useState<string>(''); // Store for API calls
```

### 3. Update Lives System
```typescript
// Option A: Keep 3 lives, add bonus lives for Phase 4 & 5
const [lives, setLives] = useState(3);
const [bonusLives, setBonusLives] = useState(0);

// Option B: Increase to 5 lives total
const [lives, setLives] = useState(5);

// Option C: Track phases separately from lives
const [livesPerPhase, setLivesPerPhase] = useState({
  phase1_3: 3,
  phase4: 1,
  phase5: 1,
});
```

### 4. Modify handleGuess Function
```typescript
const handleGuess = async (guess: string) => {
  // ... existing validation logic ...

  if (!isCorrect) {
    setWrongGuesses(prev => [...prev, guess]);
    const remainingLives = lives - 1;
    setLives(prev => prev - 1);

    if (remainingLives <= 0) {
      // PHASE TRANSITION LOGIC
      if (phase === 3) {
        // Trigger Phase 4
        const nudgeData = await fetchPhase4Nudge();
        if (nudgeData) {
          setPhase4Nudge(nudgeData.nudge);
          setPhase(4);
          setLives(1); // Bonus life for Phase 4
        } else {
          // Fallback if API fails
          setGameState('failed');
        }
      } else if (phase === 4) {
        // Trigger Phase 5
        const visualData = await fetchPhase5Visual(phase4Nudge || '');
        if (visualData) {
          setPhase5Data(visualData);
          setPhase(5);
          setLives(1); // Bonus life for Phase 5
        } else {
          setGameState('failed');
        }
      } else if (phase === 5) {
        // Actually end the game
        const answerResponse = await fetch(/* reveal answer */);
        const answerData = await answerResponse.json();
        setAnswer(answerData.canonical || 'Unknown');
        setGameState('failed');
      }
    } else if (phase < 3) {
      // Normal phase progression
      setPhase(prev => (prev + 1) as Phase);
    }
  }
};
```

### 5. Create Phase 4 Component
```typescript
// components/Phase4Nudge.tsx
interface Phase4NudgeProps {
  nudge: string;
  keywords: string[];
}

export default function Phase4Nudge({ nudge, keywords }: Phase4NudgeProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 shadow-xl">
      <div className="text-center space-y-4">
        <div className="text-4xl">🤖</div>
        <h3 className="text-xl font-serif font-bold text-blue-900">AI Nudge</h3>
        <p className="text-lg text-blue-800 italic leading-relaxed">
          "{nudge}"
        </p>
        <div className="flex justify-center gap-2 pt-4">
          {keywords.map((keyword, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-300"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 6. Create Phase 5 Component
```typescript
// components/Phase5Visual.tsx
interface Phase5VisualProps {
  data: Phase5Data;
}

export default function Phase5Visual({ data }: Phase5VisualProps) {
  return (
    <div className="space-y-6">
      {/* Synthesis Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
        <div className="text-center">
          <p className="text-xl text-purple-900 italic leading-relaxed">
            {data.synthesis}
          </p>
        </div>
      </div>

      {/* Semantic Scores Table */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <h4 className="text-sm font-bold text-forest uppercase tracking-wider mb-4">
          Your Guesses Ranked by Closeness
        </h4>
        <div className="space-y-3">
          {data.semantic_scores.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                item.score >= 70 ? 'bg-green-50 border-green-200' :
                item.score >= 50 ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-forest">{item.guess}</span>
                <span className="text-sm font-bold">{item.score}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    item.score >= 70 ? 'bg-green-500' :
                    item.score >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <p className="text-xs text-forest/70">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Themes Analysis */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <h4 className="text-sm font-bold text-green-900 uppercase mb-2">✅ You Found</h4>
          <ul className="space-y-1">
            {data.themes_identified.map((theme, idx) => (
              <li key={idx} className="text-sm text-green-800">• {theme}</li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <h4 className="text-sm font-bold text-red-900 uppercase mb-2">❌ You Missed</h4>
          <ul className="space-y-1">
            {data.themes_missing.map((theme, idx) => (
              <li key={idx} className="text-sm text-red-800">• {theme}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

### 7. Update Render Logic in PlayChallenge.tsx
```typescript
{gameState === 'playing' && hints && (
  <div className="space-y-8">
    {/* Existing phase 1-3 rendering */}

    {/* NEW: Phase 4 Rendering */}
    {phase === 4 && phase4Nudge && (
      <Phase4Nudge
        nudge={phase4Nudge}
        keywords={[]} // Extract from API response if needed
      />
    )}

    {/* NEW: Phase 5 Rendering */}
    {phase === 5 && phase5Data && (
      <Phase5Visual data={phase5Data} />
    )}

    {/* Guess bar - always show if in playing state */}
    {((phase === 1 && selectedCategory) || phase > 1) && (
      <GuessBar onSubmit={handleGuess} placeholder="What's your guess?" />
    )}
  </div>
)}
```

---

## 🧪 Testing Checklist

### Backend Testing
- [x] Daily challenge picks from strict list (no more Hedy Lamarr)
- [x] Force new daily uses same strict list
- [x] Phase 4 endpoint returns 12-word nudge
- [x] Phase 5 endpoint returns semantic scores and connections
- [ ] Deploy functions to Supabase (run `supabase functions deploy`)

### Frontend Testing
- [ ] Game progresses through Phase 1-3 normally
- [ ] After 3rd wrong guess, Phase 4 triggers (not game over)
- [ ] Phase 4 nudge displays correctly
- [ ] Player can guess again after Phase 4
- [ ] After Phase 4 wrong guess, Phase 5 triggers
- [ ] Phase 5 visual data displays correctly
- [ ] After Phase 5 wrong guess, game ends with answer reveal
- [ ] Lives counter updates correctly (3 + 1 + 1 = 5 total)
- [ ] Progress saves/loads correctly with new phases

---

## 🚀 Deployment Steps

### 1. Deploy Backend Functions
```bash
cd /home/user/fishbowl

# Deploy updated daily challenge function
supabase functions deploy daily-challenge

# Deploy updated force-new-daily function
supabase functions deploy force-new-daily

# Deploy new Phase 4 function
supabase functions deploy phase4-nudge

# Deploy new Phase 5 function
supabase functions deploy phase5-visual
```

### 2. Update Frontend
- Create Phase4Nudge.tsx component
- Create Phase5Visual.tsx component
- Update PlayChallenge.tsx with new logic
- Update type definitions
- Test locally
- Deploy to production

### 3. Verify
- Test complete game flow (all 5 phases)
- Verify daily challenge uses mainstream subjects
- Check Phase 4 nudge quality
- Check Phase 5 visual connections accuracy

---

## 💡 Design Recommendations

### Phase 4 Visual Design
- **Color Scheme**: Blue/purple gradient (distinct from existing gold/green)
- **Icon**: 🤖 robot or 💡 lightbulb
- **Tone**: Encouraging, conversational ("You've been close...")
- **Animation**: Fade in with subtle typing effect

### Phase 5 Visual Design
- **Option 1**: Table with progress bars (simplest)
- **Option 2**: Animated SVG connections (most impressive)
- **Option 3**: Card grid (most readable)
- **Recommended**: Start with Option 1, enhance to Option 2 later

### Visual Thread Effect (Phase 5)
```css
@keyframes sweepGlow {
  0% {
    stroke-dashoffset: 100%;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0%;
    opacity: 0.7;
  }
}

.connection-line {
  stroke: #FFD700;
  stroke-width: 2;
  fill: none;
  stroke-dasharray: 100%;
  animation: sweepGlow 2s ease-in-out forwards;
}
```

---

## 📝 Summary

### What the Frontend AI Needs to Do:

1. **Update Phase Type**: Change from `1 | 2 | 3` to `1 | 2 | 3 | 4 | 5`
2. **Add State Variables**: `phase4Nudge`, `phase5Data`, `actualAnswer`
3. **Modify Lives Logic**: Give bonus lives after Phase 3 and Phase 4
4. **Create Components**: Phase4Nudge.tsx and Phase5Visual.tsx
5. **Update handleGuess**: Add phase transition logic for Phase 4 → Phase 5 → Game Over
6. **Fetch from APIs**: Call `/phase4-nudge` and `/phase5-visual` at correct times
7. **Render Conditionally**: Show Phase 4 or Phase 5 components based on phase state

### Key Integration Points:
- **Trigger Phase 4**: When `lives === 0 && phase === 3`
- **Trigger Phase 5**: When `lives === 0 && phase === 4`
- **End Game**: When `lives === 0 && phase === 5`
- **API Calls**: Need actual answer (from token or check-guess response)

### Files to Modify:
- `src/pages/PlayChallenge.tsx` - Main game logic
- `src/components/Phase4Nudge.tsx` - NEW file
- `src/components/Phase5Visual.tsx` - NEW file

---

## 🎉 Expected Result

After implementation, the game flow will be:

1. **Phase 1**: Category picker → guess (GOLD tier available)
2. **Phase 2**: Sentence hint → guess (SILVER tier available)
3. **Phase 3**: Five words → guess (BRONZE tier available)
4. **Phase 4** [NEW]: AI nudge → guess (FINAL CHANCE tier)
5. **Phase 5** [NEW]: Visual connections → guess (LAST ATTEMPT tier)
6. **Game Over**: Reveal answer with full analysis

Players now get 5 total chances instead of 3, with increasingly helpful AI assistance in the final stages. This makes the game more engaging, educational, and less frustrating.

---

## ❓ Questions for Frontend AI

If unclear, ask the user:
1. Preferred visual design for Phase 5 (table vs. animated SVG vs. cards)?
2. Should lives increase to 5, or keep at 3 with "bonus lives" concept?
3. Any specific colors/themes for Phase 4 and Phase 5?
4. Should Phase 4/5 achievements be tracked separately in leaderboard?

---

**All backend changes are complete and tested. The endpoints are ready for frontend integration.**
