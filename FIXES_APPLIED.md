# Fixes Applied to Address Design Issues

## ✅ COMPLETED FIXES

### 1. Homepage - Made Compact (No Scrolling Required)
**File:** `src/pages/Home.tsx`
- Reduced all spacing (mb-12 → mb-6, space-y-4 → space-y-2)
- Made titles smaller (text-5xl → text-4xl)
- Removed extra descriptive text
- Compressed phase indicators
- Removed fold creases and extra decoration
- Result: Everything fits on one screen

### 2. Logo - Proper Sizing & Centering
**File:** `src/components/GameHeader.tsx`
- Changed from flexbox to CSS Grid (grid-cols-3)
- Logo is now `size="md"` instead of `size="sm"`
- Center column with `justify-self-center`
- Back button and Lives properly aligned left/right
- Result: Logo is larger and perfectly centered

### 3. Corner Dots/Pinholes - Removed
**File:** `src/components/paper/FoldedCornerCard.tsx`
- Removed the decorative corner dots (lines that created "pinhole" effect)
- Kept only the fold indicator for "new" hints
- Result: Cleaner, less cluttered design

## ⚠️ REMAINING ISSUES TO FIX

### 4. Contrast Issues (Critical)
**Problem:** Yellow text ("THE MYSTERY IS A") and white text ("Place") on grey background are unreadable

**Location:** `src/pages/PlayChallenge.tsx` lines 448-460

**Current code:**
```tsx
<div className="inline-block px-10 py-5 bg-gradient-to-br from-forest-600 via-forest-500 to-forest-600...">
  <p className="text-xs font-semibold text-gold-200...">The mystery is a</p>
  <p className="text-4xl font-serif font-bold text-gold-50...">
    {challengeType}
  </p>
</div>
```

**Fix needed:**
- Change `text-gold-200` to `text-gold-50` or `text-white` for better contrast
- Change background to lighter color OR keep dark background with pure white text
- Remove corner dots (lines 449-452)

### 5. More Corner Dots to Remove
**Files need updating:**
- `src/components/CategoryPicker.tsx` (lines 55-56, 92-95)
- `src/components/SentenceCard.tsx` (lines 26-29)

### 6. Phase 5 Visual - Broken (Blank White Page)
**File:** `src/components/Phase5Visual.tsx`
**Problem:** Component isn't rendering properly
**Need to:** Read the file and fix the rendering logic

### 7. Game Layout - Scrolling Required
**Problem:** As hints are revealed, user must scroll down to see them
**Solution needed:** Create side-by-side layout:
- Left side: Input, mystery card, recent guesses
- Right side: Hint stack (always visible)
- Both columns scroll independently if needed
- Mobile: Stack vertically but optimize spacing

## 📋 ACTION PLAN

1. Fix contrast in mystery card
2. Remove all remaining corner dots
3. Fix Phase5Visual component
4. Create side-by-side layout for gameplay
5. Test and build
6. Verify all issues resolved

## 🎯 SUCCESS CRITERIA

- ✅ Homepage fits without scrolling
- ✅ Logo centered and proper size
- ⚠️ No corner dots anywhere (mostly done, few remaining)
- ⚠️ All text readable with proper contrast
- ❌ No scrolling needed during gameplay (hints always visible)
- ❌ Phase 5 visual working correctly

**Status:** 3/6 complete, working on remaining items now
