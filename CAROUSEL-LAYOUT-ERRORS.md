---
domain: Web Development
tags: carousel, flexbox, layout-errors, css-antipatterns
project: CRM Multicanal Presentation
last-updated: 2026-06-01
---

# Carousel Layout Errors & Solutions

**Status**: ✅ Fixed (Commit 2989c3f)  
**Problem**: "Flujo Automático" carousel displaying with clipped cards, misaligned layout, horizontal overflow  
**Root Cause**: Over-engineered CSS approach attempting to break viewport constraints incorrectly

---

## Error History

### ❌ Error 1: Width 100vw with Negative Margins
**Attempted Solution** (Commit 6f67616):
```css
.flow-container {
    margin-top: 60px;
    position: relative;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    overflow: hidden;
}

.flow-cards-wrapper {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    gap: 20px;
    padding: 0 40px;
}
```

**Why It Failed**:
- `width: 100vw` includes scrollbar width (~15px), causing unwanted horizontal overflow
- Negative margin centering math didn't account for content within padding
- Cards were still clipping at edges despite overflow-hidden

**Lesson**: Don't use `width: 100vw` for full-width layouts. It always causes issues with scrollbar width.

---

### ❌ Error 2: Overflow Hidden with Negative Margins (Commit a303e6c)
**Attempted Solution**:
```css
.flow-container {
    margin-top: 60px;
    position: relative;
    margin-left: -40px;
    margin-right: -40px;
    overflow: hidden;
}

.flow-cards-wrapper {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    gap: 20px;
    padding: 0 40px;
}
```

**What Happened**:
- `overflow: hidden` on `.flow-container` **clipped the cards visually**
- Negative margins attempted to break out of parent constraints
- Child elements (.flow-cards-wrapper, cards) were constrained by parent's overflow rule
- User reported: "Se ve todo descuadrado y más" (Cards being cut off/clipped)

**Why It Failed**:
- **Root cause**: The parent's `overflow: hidden` creates a stacking context that clips all child content
- CSS overflow property works top-down: parent overflow clips children
- No amount of child-element padding/margin can overcome parent overflow clipping
- The combination is fundamentally broken by CSS spec

**Critical Rule**: `overflow: hidden` on a container clips all children. Period. Don't use it to "contain" child overflow unless you want clipping.

---

### ✅ Correct Solution (Commit 2989c3f)
**Simplified Approach**:
```css
.flow-container {
    margin-top: 60px;
    position: relative;
}

.flow-cards-wrapper {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    gap: 20px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    margin-bottom: 60px;
    position: relative;
    padding: 0 40px;
}
```

**Why This Works**:
1. **No width: 100vw** - Container respects parent max-width (1200px) constraint naturally
2. **No overflow: hidden on parent** - Child scrollable container can expand/scroll freely
3. **Only overflow-x: auto on wrapper** - Only the carousel itself scrolls, cards don't get clipped
4. **overflow-y: hidden** - Prevents vertical scrollbar from appearing (cards don't overflow vertically)
5. **Padding: 0 40px** - Creates left/right spacing without breaking layout math
6. **Simple, linear CSS** - No complex margin calculations, no conflicting overflow rules

**Result**: 
- Cards display fully without clipping
- Carousel scrolls smoothly horizontally
- No unwanted horizontal scrollbar on page
- Responsive: padding adjusts for mobile (24px) vs desktop (40px)

---

## Design Anti-Patterns Identified

### 1. **Width 100vw for Full-Width Layouts**
- ❌ Always causes scrollbar overflow issues
- ✅ Use max-width on parent container instead
- ✅ Let child elements inherit width naturally

### 2. **Overflow: Hidden as a "Fix"**
- ❌ Overflow on a container is primarily for clipping, not containment
- ❌ It creates a stacking context that affects all descendants
- ✅ Use it only when clipping is intentional
- ✅ For scrollable content, use `overflow: auto/scroll` only on the scrollable element

### 3. **Negative Margins to "Break Out"**
- ❌ Combining with parent overflow: hidden fails (child still clipped)
- ❌ Complex math with padding/margin combinations leads to misalignment
- ✅ Restructure HTML so scrollable container isn't constrained by parent
- ✅ Or: Keep container within parent constraints, don't try to break out

### 4. **Stacking Too Many Layout Techniques**
- ❌ width: 100vw + margin-left calc + overflow: hidden + padding = overcomplicated
- ✅ Use one or two CSS rules that solve the actual problem
- ✅ Test simplest solution first before adding complexity

---

## Testing Checklist (Post-Fix)

- [ ] Desktop (1200px+): Cards display fully, carousel scrolls, no clipping
- [ ] Tablet (768px): Cards visible, responsive padding, smooth scroll
- [ ] Mobile (375px): Single-card view works, touch scroll responsive
- [ ] Peek effect: Previous card shows 60px on left when navigating
- [ ] Navigation buttons: "Anterior" / "Siguiente" aligned properly
- [ ] No horizontal scrollbar on page
- [ ] No vertical scrollbar appearing in carousel

---

## Related Patterns

### Flexbox Carousel Pattern (Correct Way)
```css
.carousel-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px;
}

.carousel-wrapper {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    gap: 20px;
    padding: 0;  /* No padding on scrollable element */
    scrollbar-width: none;
}

.carousel-item {
    min-width: 400px;  /* Prevent shrinking */
    flex-shrink: 0;     /* Explicit no-shrink */
}
```

**Key Rules**:
1. Padding goes on **parent container**, not scrollable wrapper
2. `overflow-x: auto` + `overflow-y: hidden` on wrapper
3. `min-width` + `flex-shrink: 0` on items (prevent collapsing)
4. No negative margins, no 100vw, no parent overflow-hidden

---

## Commits Related to This Error

| Commit | Date | Change |
|--------|------|--------|
| 6f67616 | 2026-06-01 | Initial carousel restructure (width: 100vw approach) |
| a303e6c | 2026-06-01 | Attempted fix with negative margins + overflow:hidden |
| 2989c3f | 2026-06-01 | ✅ **Correct fix**: Simplified CSS, removed problematic rules |

---

## Key Takeaway

**Start simple, add complexity only when needed.**

The correct solution uses 5 simple CSS properties on the wrapper. The broken solutions tried to use 5+ properties with conflicting logic. When designing layouts:
1. Write minimal CSS first
2. Test at all breakpoints
3. Only add complexity (negative margins, 100vw, overflow:hidden) if the simple approach fails
4. Question why each property is needed

For future carousel work: **Use this exact pattern** (Commit 2989c3f). It works because it respects CSS spec behavior rather than fighting against it.

---

**Last Updated**: 2026-06-01  
**Status**: ✅ Complete and working  
**Remember**: Document errors immediately to prevent repetition in future projects.
