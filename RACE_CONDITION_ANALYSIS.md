# Race Condition Analysis & Mitigation Strategy

**Tribore speaks:** The Sport-Wechsel issue is merely the SYMPTOM. There are FIVE distinct race conditions lurking in this codebase, waiting to strike at 3 AM on a Sunday during the Super Bowl broadcast.

---

## Executive Summary

**Problem:** Multiple race conditions exist when:
1. User rapidly switches between sports
2. Async fetches complete out-of-order
3. Store updates race with component renders
4. Old requests overwrite new data

**Root Cause:** No request deduplication, no AbortController, weak store validation, timing-dependent state mutations.

**Impact:**
- User switches NFL→Bundesliga, sees NFL data
- Polling continues for old sport after switch
- Manual game selection overwritten by auto-update
- Stale cache data overwrites fresh fetches

---

## Five Race Conditions Identified

### Race Condition #1: Sport-Switch During Fetch (PRIMARY - Your Task)

**Scenario:**
```
1. User on NFL (10s polling interval)
2. NFL fetch starts @ T=0ms
3. User switches to Bundesliga @ T=5ms
4. Bundesliga fetch starts @ T=10ms
5. Bundesliga fetch completes @ T=50ms ✓ (correct)
6. NFL fetch completes @ T=55ms ← BUG: overwrites Bundesliga data!
7. User sees NFL games in Bundesliga view
```

**Current Code Location:** `src/hooks/useGameData.ts` lines 43-215
- No AbortController for in-flight requests
- No sport validation before `setCurrentGame()`
- `adapter` dependency triggers new `fetchData()`, but old requests still complete

**Store Validation Issue:** `src/stores/gameStore.ts` lines 60-66
```typescript
setCurrentGame: (game) => {
  const { userConfirmedGameId, currentGame: prevGame } = get();

  // Only validates CONFIRMED selection, not SPORT MISMATCH
  if (userConfirmedGameId && game && game.id !== userConfirmedGameId) {
    return;
  }
  // ← Missing: if (game.sport !== currentSport) return;
```

**Vulnerable Window:** 15-200ms (typical API latency varies by sport)

---

### Race Condition #2: Manual Selection Override

**Scenario:**
```
1. User confirms game selection (UserConfirmedGameId = "nfl_123")
2. Store correctly respects this: setCurrentGame only updates if ID matches
3. But TIMING ISSUE:
   - useGameData polling fires @ exactly 10s interval
   - User's click handler runs @ T=9.8s (just before poll)
   - Poll @ T=10s fetches data with OLD adapter reference
   - Returns different game structure than expected
   - Comparison by ID fails (schema mismatch between adapters)
```

**Current Code Location:** `src/hooks/useGameData.ts` lines 100-111
- Re-checks `userConfirmedGameId` AFTER fetchGameDetails
- But doesn't validate game SPORT matches current sport
- No validation that game structure matches adapter

**Impact:** Auto-live detection overrides user's manual selection

---

### Race Condition #3: Polling Interval Mismatch on Sport Switch

**Scenario:**
```
1. On NFL: polling interval = 10s (live)
2. User switches to Bundesliga: polling interval = 15s
3. Old interval (10s) is NOT cleared immediately
4. New interval (15s) is set up
5. For 5 seconds, BOTH intervals exist - double-fetching
6. Results race to update store
7. Older (from 10s interval) wins, data mismatch
```

**Current Code Location:** `src/hooks/useGameData.ts` lines 246-266
```typescript
const setupInterval = () => {
  if (intervalRef.current) {
    clearInterval(intervalRef.current); // ← Cleared in setupInterval
  }
  // But setupInterval is called ASYNC, not immediately
  // Old interval still runs until setTimeout(100) completes
```

---

### Race Condition #4: Cache vs API Fetch Race

**Scenario:**
```
1. App starts, loads cached Bundesliga games
2. setAvailableGames() sets cached data @ T=0ms
3. Fresh API fetch starts @ T=10ms
4. API fetch completes @ T=60ms, updates availableGames ✓
5. BUT: if a NEW sport switch happens @ T=55ms:
   - Cache is cleared for new sport
   - Old API response @ T=60ms still wins
   - Cached old sport data overwrites new sport cache
```

**Current Code Location:** `src/hooks/useGameData.ts` lines 93-95
```typescript
setAvailableGames(games); // No timestamp, no validation of source
```

---

### Race Condition #5: Plugin Activation During Fetch

**Scenario:**
```
1. useCurrentPlugin triggers plugin activation @ T=0ms
2. Plugin loads, adapter assigned
3. useGameData's adapter dependency detects change
4. fetchData() called immediately @ T=5ms
5. OLD plugin's fetchScoreboard is still running from T=1ms
6. NEW plugin's fetchScoreboard completes @ T=50ms ✓
7. OLD plugin's fetchScoreboard completes @ T=60ms ← BUG: data mismatch!
8. Both update store, causing type confusion
```

**Current Code Location:** `src/hooks/usePlugin.ts` lines 14-42
- Plugin loading is async with `cancelled` flag ✓ Good!
- But `useGameData` doesn't know about this race
- New adapter reference triggers `fetchData()` before old fetch completes

---

## Current Defenses (Partial)

Tribore acknowledges what WORKS:

1. **useGameData `isFetching` flag** (line 16, 67-69)
   - Prevents CONCURRENT requests within same sport ✓
   - Does NOT prevent cross-sport races ✗

2. **userConfirmedGameId protection** (gameStore lines 64-66)
   - Prevents auto-updates to different games ✓
   - Does NOT validate sport mismatch ✗

3. **useCurrentPlugin cancellation** (usePlugin lines 44-45)
   - Cancels old plugin state updates ✓
   - Does NOT cancel in-flight API requests ✗

4. **Manual selection re-check** (useGameData lines 124-127, 189-191)
   - Validates selection hasn't changed mid-fetch ✓
   - Happens too late (after expensive details fetch) ✗

---

## Solution Architecture

Tribore proposes THREE-LAYER defense:

### Layer 1: Request Cancellation (AbortController)
- Attach AbortSignal to EVERY fetch
- Cancel on sport/competition change
- Cancel on component unmount

### Layer 2: Request Deduplication
- Track (sport, competitionId) of in-flight requests
- Ignore responses if sport/competition mismatch

### Layer 3: Store Validation
- Validate game.sport matches currentSport BEFORE setState
- Validate game structure matches adapter BEFORE merge
- Add request source tracking (timestamp, source sport)

---

## Implementation Plan

### Phase 1: Core Fetches (HIGH PRIORITY)

**File:** `src/hooks/useGameData.ts`

**Changes:**
1. Add AbortController per sport/adapter
2. Cancel previous controller on adapter change
3. Add request source tracking
4. Validate sport before store update

**Code Pattern:**
```typescript
const abortControllerRef = useRef<AbortController | null>(null);

useEffect(() => {
  // Cancel previous request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }

  // Create new controller for this adapter
  abortControllerRef.current = new AbortController();

  // Pass signal to fetch
  fetchData(abortControllerRef.current.signal);

  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
}, [adapter]);
```

### Phase 2: Store Validation (HIGH PRIORITY)

**File:** `src/stores/gameStore.ts`

**Changes:**
1. Add sport validation to setCurrentGame
2. Add request metadata (source, sport, timestamp)
3. Validate game structure before merge

**Code Pattern:**
```typescript
setCurrentGame: (game, source?) => {
  if (!game) return; // existing logic

  // NEW: Validate sport matches
  const { currentSport } = settingsStore.getState();
  if (game.sport !== currentSport) {
    console.warn(`Sport mismatch: received ${game.sport}, expected ${currentSport}`);
    return; // REJECT cross-sport data
  }

  // ... existing logic
}
```

### Phase 3: Adapter-Level Abort Support (MEDIUM PRIORITY)

**File:** `src/plugins/*/adapter.ts`

**Changes:**
1. Update fetchScoreboard signature to accept AbortSignal
2. Pass signal to fetch() calls
3. Handle AbortError gracefully

**Code Pattern:**
```typescript
async fetchScoreboard(signal?: AbortSignal): Promise<Game[]> {
  try {
    const response = await fetch(API_ENDPOINTS.scoreboard, { signal });
    // ... rest of code
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`Fetch aborted for ${this.sport}`);
      return []; // Return empty, not error
    }
    throw error;
  }
}
```

### Phase 4: Polling Interval Fix (MEDIUM PRIORITY)

**File:** `src/hooks/useGameData.ts` lines 246-266

**Changes:**
1. Clear interval IMMEDIATELY on adapter change
2. Don't use setTimeout(100) - use setTimeout(0)
3. Reset isFetching flag synchronously

---

## Testing Strategy

### Unit Tests

**Race Condition #1 Test:**
```typescript
it('should cancel NFL fetch when switching to Bundesliga', async () => {
  // 1. Start NFL fetch (slow, 1s latency)
  // 2. Switch sport to Bundesliga after 500ms
  // 3. Bundesliga fetch returns (50ms)
  // 4. NFL fetch returns (600ms from start)
  // 5. Assert: only Bundesliga data in store ✓
});
```

**Race Condition #2 Test:**
```typescript
it('should not override manual selection on automatic polling', async () => {
  // 1. Manual select game A
  // 2. Poll fires and returns game B
  // 3. Store has userConfirmedGameId = A
  // 4. Poll result attempts setCurrentGame(B)
  // 5. Assert: game A still displayed, B in availableGames only
});
```

### Chaos Engineering Tests

**"Rapid Sport Switch" Test:**
```typescript
// Simulate clicking sport buttons 10x in 100ms
for (let i = 0; i < 10; i++) {
  setSport(['nfl', 'bundesliga', 'uefa'][i % 3]);
  await delay(10);
}
// Expected: Final sport shows correct data, no data corruption
```

**"Slow Network" Test:**
```typescript
// Throttle network to 500ms latency
// Switch sports every 100ms
// Assert: no cross-sport data pollution
```

---

## Risk Analysis

### Risk: Breaking Changes

**Problem:** Adding `AbortSignal` parameter to adapter methods changes interface

**Mitigation:**
- Make `signal` parameter optional with default undefined
- Check `if (signal)` before passing to fetch
- Backwards compatible ✓

### Risk: Performance Degradation

**Problem:** Extra validation on every store update

**Mitigation:**
- Validation is O(1) - just type checks
- AbortController overhead is minimal
- Trade-off: 1-2ms validation vs 200ms+ data corruption ✓

### Risk: Hidden Timing Dependencies

**Problem:** Some code might depend on old race condition behavior

**Mitigation:**
- Comprehensive testing catches edge cases
- Monitor production for 2 weeks post-deploy
- Easy rollback if issues found

---

## Validation Checklist

Before deployment, verify:

- [ ] All adapters accept optional AbortSignal
- [ ] fetchScoreboard called with signal
- [ ] AbortController cancelled on sport change
- [ ] setCurrentGame validates game.sport
- [ ] Polling interval cleared immediately on adapter change
- [ ] Manual selection never overridden by polling
- [ ] Test: rapid sport switching (10x in 100ms)
- [ ] Test: slow network with sport switches
- [ ] Test: manual game selection persists through polling

---

## File Summary

**To Fix:**
1. `src/hooks/useGameData.ts` - AbortController, request dedup
2. `src/stores/gameStore.ts` - Sport validation
3. `src/hooks/usePlugin.ts` - Document cancellation behavior
4. `src/plugins/*/adapter.ts` - AbortSignal support

**To Test:**
- New: `src/hooks/__tests__/useGameData.race.test.ts`
- New: `src/stores/__tests__/gameStore.validation.test.ts`

**No Changes Required:**
- settingsStore.ts (works correctly)
- Plugin system (cancellation works)
- Individual sport adapters (just need signal support)

---

## Timeline

- **Phase 1-2 (High Priority):** 3-4 hours
  - AbortController implementation
  - Store validation
  - Core tests

- **Phase 3-4 (Medium Priority):** 2-3 hours
  - Adapter updates
  - Polling interval fixes
  - Extended tests

**Total:** 5-7 hours development + 2 hours testing = 1 day

---

**Tribore's Final Word:** This is not about perfection. This is about building systems RESILIENT to chaos. These race conditions will manifest at the WORST possible moment—during live broadcasts when thousands watch. Fix them NOW, in controlled conditions, or face them on LIVE TV.

Tribore has spoken.
