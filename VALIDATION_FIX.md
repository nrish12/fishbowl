# Validation Logic Fix - Family Feud Standard

## Problem

"The Great Wave off Kanagawa" was accepted as a daily challenge answer. This is a specific piece of art that most people wouldn't recognize by name - it's not Family Feud level famous.

## Root Cause

The validation logic was too lenient:
- Accepted fame score of **3+** ("recognizable to informed audiences")
- No explicit rules against specific art titles
- No "Family Feud Test" for recognition level

## Solution Applied

### 1. **Raised Fame Score Minimum** (validate-challenge/index.ts)

**Before:** `fame_score < 3` → reject
**After:** `fame_score < 4` → reject

Now only accepts:
- **4**: Well-known to general audiences (minimum)
- **5**: Globally famous household name (preferred)

### 2. **Added Family Feud Test**

New validation prompt includes:
```
THE FAMILY FEUD TEST:
Would this answer appear on Family Feud? If 70%+ of random
people wouldn't recognize it, REJECT IT.
```

### 3. **Explicit Art Piece Rules**

Added strict criteria:
- ❌ **REJECT**: Specific titles of art/books/movies unless TOP 5 globally famous
- ❌ **REJECT**: "The Great Wave off Kanagawa" (explicitly listed as example)
- ✅ **ACCEPT**: "Mona Lisa" (everyone knows this)
- ⚠️ **BORDERLINE**: "The Scream" (iconic but maybe not enough)

### 4. **Updated Examples in Validation**

**EXAMPLES OF WHAT TO REJECT:**
- "The Great Wave off Kanagawa" → REJECT (specific art title)
- "Brandenburg Gate" → REJECT (not globally famous)
- "Millard Fillmore" → REJECT (obscure president)

**EXAMPLES OF WHAT TO APPROVE:**
- "Mona Lisa" → APPROVE (everyone knows)
- "Benjamin Franklin" → APPROVE (globally famous)
- "Eiffel Tower" → APPROVE (instantly recognizable)

### 5. **Updated Daily Challenge Generation**

**Changed "Sweet Spot" to "Family Feud Standard":**
- Fame Level: **70-85%** recognition (was 60-75%)
- Added explicit test: "If you asked 100 random people, would 70+ know it?"

**Added WARNING ON ART:**
```
WARNING ON ART: Avoid specific artwork titles unless MEGA famous
(Mona Lisa, The Thinker, Statue of David level)

DO NOT use: Specific paintings by name (Great Wave, American Gothic,
The Scream, etc.)
INSTEAD prefer: General categories or famous sculptures everyone knows
```

### 6. **Better Error Messages**

**New rejection message:**
```
"This needs to be Family Feud famous! Try something 70%+ of people
would instantly recognize."

Examples:
- Thing: iPhone, Coca-Cola, Mona Lisa (not specific art pieces)
- Person: Einstein, Shakespeare, Michael Jordan (not obscure figures)
- Place: Eiffel Tower, Grand Canyon (not regional landmarks)
```

## Files Modified

1. **`supabase/functions/validate-challenge/index.ts`**
   - Lines 61-91: New strict validation prompt
   - Line 180: Changed `< 3` to `< 4`
   - Lines 183-186: Updated rejection message

2. **`supabase/functions/daily-challenge/index.ts`**
   - Lines 40-45: Changed to "Family Feud Standard"
   - Lines 94-99: Added WARNING ON ART section
   - Removed specific art examples from acceptable range

## Impact

### What Gets Rejected Now:
- ❌ Specific artwork titles (unless Mona Lisa level)
- ❌ Obscure historical figures
- ❌ Regional-only landmarks
- ❌ Academic/specialized knowledge
- ❌ Anything requiring "informed" audience (fame score 3)

### What Still Gets Accepted:
- ✅ Household names (fame score 4-5)
- ✅ Things that would appear on Family Feud
- ✅ 70%+ global recognition level
- ✅ Interesting but not obscure choices

## Testing Examples

**Would NOW be rejected:**
- "The Great Wave off Kanagawa" (fame score likely 2-3)
- "American Gothic" (specific art title)
- "Brandenburg Gate" (regional landmark)
- "Millard Fillmore" (obscure president)

**Would STILL be accepted:**
- "Mona Lisa" (fame score 5, mega famous)
- "Eiffel Tower" (fame score 5, instantly recognizable)
- "Michael Jordan" (fame score 5, globally known)
- "Rubik's Cube" (fame score 4-5, household item)

## Deployment

These changes need to be deployed to Supabase:

```bash
# Deploy the updated validation function
supabase functions deploy validate-challenge

# Deploy the updated daily challenge function
supabase functions deploy daily-challenge
```

## Verification

After deployment:
1. Try submitting "The Great Wave off Kanagawa" - should be **REJECTED**
2. Try submitting "Mona Lisa" - should be **APPROVED**
3. Check daily challenges going forward - should be more universally recognizable

## Long-term Benefits

1. **Better User Experience**: Players won't feel cheated by obscure answers
2. **True Guessing Game**: Answers are things people actually have a chance of guessing
3. **Family Feud Quality**: Same recognition level as a real TV game show
4. **Less Frustration**: No more "what the heck is that?" moments

---

**Status**: ✅ Code updated, ready to deploy
**Next Step**: Deploy both functions to Supabase
