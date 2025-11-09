# Frontend Integration Guide: AI-Powered Fishbowl Game

## 🎯 Overview

This document details all backend changes for the AI-powered Fishbowl guessing game with Phase 4 (AI Nudge) and Phase 5 (Visual Connections).

---

## ✨ What Changed

### 1. AI-Powered Subject Generation (THE SWEET SPOT)

**Philosophy**: This is an **AI-POWERED game**. The AI freely picks subjects based on its judgment each day.

**The Sweet Spot Approach**:
- **Target**: 60-75% recognition among general public
- **NOT** the most obvious (Einstein, Eiffel Tower, Mona Lisa)
- **NOT** too obscure (Hedy Lamarr, Yayoi Kusama)
- **JUST RIGHT**: Interesting, recognizable, makes players think

**How It Works**:
- AI considers variety: different eras, regions, fields
- AI gets examples as inspiration (not restrictions)
- AI has creative freedom to pick what feels right for TODAY
- AI excludes subjects used in last 14 days
- Temperature: 1.1 (high creativity)

**Examples of Sweet Spot Subjects**:
- **People**: Frida Kahlo, Nikola Tesla, Bruce Lee, Dr. Seuss, Jimi Hendrix
- **Places**: Petra, Aurora Borealis, Alcatraz, Abbey Road, Route 66
- **Things**: The Scream, Rubik's Cube, Peace Sign, Hope Diamond, Hashtag

**Files Modified**:
- `supabase/functions/daily-challenge/index.ts` (lines 36-128)
- `supabase/functions/force-new-daily/index.ts` (lines 35-127)

---

### 2. NEW Phase 4: AI Nudge

**Purpose**: After wrong guesses, AI analyzes everything and gives a helpful one-sentence nudge.

**Endpoint**: `POST /functions/v1/phase4-nudge`

**Request**:
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
- Orders by semantic relevance
- Generates EXACTLY 12-word sentence
- Conversational tone, nudges without revealing

**File Created**: `supabase/functions/phase4-nudge/index.ts`

---

### 3. NEW Phase 5: Visual Connections

**Purpose**: Semantic analysis with visual connection data to help player see patterns.

**Endpoint**: `POST /functions/v1/phase5-visual`

**Request**:
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
    }
  ],
  "synthesis": "You've chased Nobel, physics, and innovation—but missed the pioneer who shattered gender barriers first.",
  "themes_identified": ["science", "Nobel Prize", "physics", "innovation"],
  "themes_missing": ["gender barrier", "first woman", "radioactivity", "dual Nobel winner"]
}
```

**AI Logic**:
- Rates each guess 0-100 on semantic similarity
- Maps which hint led to which guess
- Generates poetic synthesis sentence
- Identifies themes player found vs. missed

**File Created**: `supabase/functions/phase5-visual/index.ts`

---

## 🎮 New Game Flow

### Current (3 Phases, 3 Lives)
```
Phase 1: Category → Guess → Wrong → Phase 2
Phase 2: Sentence → Guess → Wrong → Phase 3
Phase 3: Five words → Guess → Wrong → Game Over
```

### NEW (5 Phases, 5 Lives)
```
Phase 1: Category → Guess → Wrong → Phase 2
Phase 2: Sentence → Guess → Wrong → Phase 3
Phase 3: Five words → Guess → Wrong → Phase 4 [NEW]
Phase 4: AI Nudge → Guess → Wrong → Phase 5 [NEW]
Phase 5: Visual Connections → Guess → Wrong → Reveal Answer
```

**Players now get 5 total chances with increasing AI help!**

---

## 💻 Frontend Integration

### Step 1: Update Type Definitions

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

### Step 2: Add State Variables

```typescript
const [phase4Nudge, setPhase4Nudge] = useState<string | null>(null);
const [phase5Data, setPhase5Data] = useState<Phase5Data | null>(null);
const [lives, setLives] = useState(5); // Update from 3 to 5
```

### Step 3: Create API Fetch Functions

```typescript
const fetchPhase4Nudge = async () => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/phase4-nudge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        target: answer, // You'll need to get this - see note below
        type: challengeType,
        guesses: wrongGuesses,
        hints: hints,
      }),
    });

    if (!response.ok) throw new Error('Phase 4 fetch failed');
    return await response.json();
  } catch (error) {
    console.error('Phase 4 error:', error);
    return null;
  }
};

const fetchPhase5Visual = async () => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/phase5-visual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        target: answer,
        type: challengeType,
        guesses: wrongGuesses,
        hints: {
          ...hints,
          phase4_nudge: phase4Nudge,
        },
      }),
    });

    if (!response.ok) throw new Error('Phase 5 fetch failed');
    return await response.json();
  } catch (error) {
    console.error('Phase 5 error:', error);
    return null;
  }
};
```

**IMPORTANT NOTE**: You need the actual answer to call these APIs. You can:
- Decode it from the JWT token
- Store it in state when game ends
- Or add a backend endpoint that returns it when phase transitions

### Step 4: Update handleGuess Logic

```typescript
const handleGuess = async (guess: string) => {
  // ... existing validation code ...

  if (!isCorrect) {
    setWrongGuesses(prev => [...prev, guess]);
    const remainingLives = lives - 1;
    setLives(prev => prev - 1);

    if (remainingLives <= 0) {
      // PHASE TRANSITION LOGIC
      if (phase === 3) {
        // Transition to Phase 4
        const nudgeData = await fetchPhase4Nudge();
        if (nudgeData) {
          setPhase4Nudge(nudgeData.nudge);
          setPhase(4);
          setLives(1); // Give 1 more life
        } else {
          setGameState('failed'); // Fallback if API fails
        }
      } else if (phase === 4) {
        // Transition to Phase 5
        const visualData = await fetchPhase5Visual();
        if (visualData) {
          setPhase5Data(visualData);
          setPhase(5);
          setLives(1); // Give 1 more life
        } else {
          setGameState('failed');
        }
      } else if (phase === 5) {
        // Actually end the game
        const answerResponse = await fetch(/* reveal answer endpoint */);
        const answerData = await answerResponse.json();
        setAnswer(answerData.canonical || 'Unknown');
        setGameState('failed');
      }
    } else if (phase < 3) {
      // Normal phase progression for phases 1-2
      setPhase(prev => (prev + 1) as Phase);
    }
  }
};
```

### Step 5: Create Phase 4 Component

Create `src/components/Phase4Nudge.tsx`:

```typescript
interface Phase4NudgeProps {
  nudge: string;
  keywords: string[];
}

export default function Phase4Nudge({ nudge, keywords }: Phase4NudgeProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-300 shadow-xl animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="text-5xl animate-bounce">🤖</div>
        <h3 className="text-2xl font-serif font-bold text-blue-900">AI Nudge</h3>
        <div className="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-lg text-blue-800 italic leading-relaxed font-medium">
            "{nudge}"
          </p>
        </div>
        {keywords.length > 0 && (
          <div className="flex justify-center gap-2 pt-2">
            {keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border-2 border-blue-300 shadow-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-blue-600 mt-4">
          Think carefully... you're getting close! 💭
        </p>
      </div>
    </div>
  );
}
```

### Step 6: Create Phase 5 Component

Create `src/components/Phase5Visual.tsx`:

```typescript
interface Phase5VisualProps {
  data: Phase5Data;
}

export default function Phase5Visual({ data }: Phase5VisualProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Synthesis Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-8 border-2 border-purple-300 shadow-xl">
        <div className="text-center">
          <div className="text-4xl mb-3">🔮</div>
          <p className="text-xl text-purple-900 italic leading-relaxed font-medium">
            {data.synthesis}
          </p>
        </div>
      </div>

      {/* Semantic Scores */}
      <div className="bg-white rounded-xl p-6 border-2 border-neutral-300 shadow-lg">
        <h4 className="text-sm font-bold text-forest uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>📊</span> Your Guesses Ranked by Closeness
        </h4>
        <div className="space-y-3">
          {data.semantic_scores.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 transition-all ${
                item.score >= 70
                  ? 'bg-green-50 border-green-300 shadow-green-100'
                  : item.score >= 50
                  ? 'bg-yellow-50 border-yellow-300 shadow-yellow-100'
                  : 'bg-red-50 border-red-300 shadow-red-100'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-forest text-lg">{item.guess}</span>
                <span className="text-sm font-bold px-3 py-1 rounded-full bg-white">
                  {item.score}%
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3 mb-2 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    item.score >= 70
                      ? 'bg-gradient-to-r from-green-400 to-green-600'
                      : item.score >= 50
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                      : 'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{
                    width: `${item.score}%`,
                    animation: `fillBar 1s ease-out ${idx * 0.1}s forwards`,
                  }}
                />
              </div>
              <p className="text-sm text-forest/70 italic">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Themes Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-300 shadow-lg">
          <h4 className="text-sm font-bold text-green-900 uppercase mb-3 flex items-center gap-2">
            <span className="text-2xl">✅</span> Themes You Found
          </h4>
          <ul className="space-y-2">
            {data.themes_identified.map((theme, idx) => (
              <li
                key={idx}
                className="text-sm text-green-800 bg-white/50 px-3 py-2 rounded-lg font-medium"
              >
                • {theme}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border-2 border-red-300 shadow-lg">
          <h4 className="text-sm font-bold text-red-900 uppercase mb-3 flex items-center gap-2">
            <span className="text-2xl">❌</span> Themes You Missed
          </h4>
          <ul className="space-y-2">
            {data.themes_missing.map((theme, idx) => (
              <li
                key={idx}
                className="text-sm text-red-800 bg-white/50 px-3 py-2 rounded-lg font-medium animate-pulse"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                • {theme}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center text-sm text-neutral-600 italic">
        This is your final chance... connect the dots! 🧩
      </div>
    </div>
  );
}
```

### Step 7: Update Render Logic

In `PlayChallenge.tsx`, update the render section:

```typescript
{gameState === 'playing' && hints && (
  <div className="space-y-8">
    {/* Existing Phase 1-3 rendering */}
    {phase >= 3 && <PhaseChips words={hints.phase1} revealed={true} />}
    {phase === 2 && <SentenceCard sentence={hints.phase2} revealed={true} />}
    {phase === 1 && selectedCategory && (
      <CategoryPicker
        categories={hints.phase3}
        revealed={true}
        selectedCategory={selectedCategory}
      />
    )}

    {/* NEW: Phase 4 Rendering */}
    {phase === 4 && phase4Nudge && (
      <Phase4Nudge nudge={phase4Nudge} keywords={[]} />
    )}

    {/* NEW: Phase 5 Rendering */}
    {phase === 5 && phase5Data && (
      <Phase5Visual data={phase5Data} />
    )}

    {/* Guess bar */}
    {((phase === 1 && selectedCategory) || phase > 1) && (
      <GuessBar onSubmit={handleGuess} placeholder="What's your guess?" />
    )}
  </div>
)}
```

---

## 🎨 CSS Animations

Add to your CSS file:

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fillBar {
  from {
    width: 0%;
  }
  to {
    width: var(--target-width);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
```

---

## 📊 Lives System Options

Choose one approach:

**Option A: Simple 5 Lives**
```typescript
const [lives, setLives] = useState(5);
// Lives: 3 for phases 1-3, then 1 for phase 4, then 1 for phase 5
```

**Option B: Bonus Lives**
```typescript
const [lives, setLives] = useState(3);
const [bonusLives, setBonusLives] = useState(0);
// Give +1 bonus at phase 4, +1 at phase 5
```

**Recommendation**: Use Option A (simple 5 lives) for easier implementation.

---

## 🚀 Deployment

### Backend Deployment

```bash
cd /home/user/fishbowl

# Deploy all functions
supabase functions deploy daily-challenge
supabase functions deploy force-new-daily
supabase functions deploy phase4-nudge
supabase functions deploy phase5-visual
```

### Frontend Deployment

1. Implement components (Phase4Nudge.tsx, Phase5Visual.tsx)
2. Update PlayChallenge.tsx logic
3. Test locally with DevTools "Force New Daily" button
4. Deploy to production

---

## ✅ Testing Checklist

### Backend
- [ ] Daily challenge generates subjects in "sweet spot" range
- [ ] No more Einstein/Machu Picchu defaults
- [ ] No more Hedy Lamarr/obscure picks
- [ ] Subjects excluded from last 14 days
- [ ] Phase 4 endpoint returns 12-word nudge
- [ ] Phase 5 endpoint returns semantic analysis

### Frontend
- [ ] Game progresses Phase 1 → 2 → 3 normally
- [ ] After 3 wrong guesses (lives = 0), Phase 4 triggers
- [ ] Phase 4 nudge displays correctly
- [ ] Player can guess after Phase 4
- [ ] After Phase 4 wrong guess, Phase 5 triggers
- [ ] Phase 5 visual data displays correctly
- [ ] After Phase 5 wrong guess, game ends
- [ ] Lives counter: 5 total (3 + 1 + 1)

---

## 🎯 Key Differences from Previous Approach

| Previous (WRONG) | Current (CORRECT) |
|-----------------|-------------------|
| AI restricted to fixed list | AI has creative freedom |
| 70-80 pre-coded subjects | Unlimited subjects in sweet spot |
| No variety between days | True AI-powered daily variety |
| List-based selection | Judgment-based selection |

**The Philosophy**: This is an AI game. Let the AI be creative within the sweet spot (60-75% recognition). Avoid both extremes (too obvious + too obscure).

---

## 🔗 GitHub Instructions

### View Your Changes
```
https://github.com/nrish12/fishbowl/tree/claude/debug-fishbowl-puzzle-generation-011CUs7Z9gdPY4UBSGJRjDQ7
```

### Merge Instructions

1. **View the Pull Request** (if created):
   - Go to: https://github.com/nrish12/fishbowl/pulls
   - Look for PR from `claude/debug-fishbowl-puzzle-generation-011CUs7Z9gdPY4UBSGJRjDQ7`

2. **Create PR Manually** (if not exists):
   ```bash
   # In your terminal
   gh pr create --title "AI-Powered Game: Sweet Spot Generation + Phase 4 & 5" \
     --body "Implements AI-powered subject generation in the sweet spot (60-75% recognition) and adds Phase 4 (AI Nudge) and Phase 5 (Visual Connections)" \
     --base main \
     --head claude/debug-fishbowl-puzzle-generation-011CUs7Z9gdPY4UBSGJRjDQ7
   ```

3. **Merge via GitHub UI**:
   - Review the changes
   - Click "Merge pull request"
   - Choose "Squash and merge" or "Create merge commit"
   - Confirm merge

4. **Or Merge via Command Line**:
   ```bash
   git checkout main
   git pull origin main
   git merge claude/debug-fishbowl-puzzle-generation-011CUs7Z9gdPY4UBSGJRjDQ7
   git push origin main
   ```

---

## 📞 Support

If you encounter issues:
1. Check that all backend functions are deployed
2. Verify environment variables (OPENAI_API_KEY, SUPABASE keys)
3. Test Phase 4/5 endpoints directly with curl/Postman
4. Check browser console for errors
5. Verify token contains answer (or add endpoint to reveal it)

---

## 🎉 Summary

**What You're Getting**:
- ✅ AI-powered subject generation (sweet spot: interesting but fair)
- ✅ Phase 4: AI nudge after wrong guesses
- ✅ Phase 5: Visual semantic analysis
- ✅ 5 total lives (up from 3)
- ✅ Complete React components ready to use
- ✅ Fully documented API endpoints

**Next Steps**:
1. Read this document thoroughly
2. Implement the frontend components
3. Test the complete flow
4. Deploy to production
5. Enjoy the AI-powered daily challenges!

**The game is now truly AI-powered - each day brings a fresh, interesting subject in the sweet spot!** 🎯
