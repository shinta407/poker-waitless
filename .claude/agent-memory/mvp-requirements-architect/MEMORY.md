# MVP Requirements Architect - Memory

## Project Context: Poker-Waitless (TPDS)
- B2B iPad app for poker room staff in Taipei
- Critical constraint: Staff operations must complete in <3 seconds
- Target users: 25-45 year old staff, varying tech comfort, working in noisy environments

## Key Pain Point Identification Patterns

### Physical Context Matters
- iPad used in bright/dark poker rooms (high contrast essential)
- Staff have thick fingers (80px+ buttons minimum, not just 44pt)
- Standing/moving between tables (no complex multi-step flows)
- Noisy environment (visual feedback > audio)

### The "3-Second Rule" Framework
When analyzing operations:
1. Does this action solve an immediate problem? (Call player, update seats)
2. Can it be completed in <3 seconds? (QR scan YES, manual search NO)
3. Does it eliminate manual process? (Digital list vs whiteboard)

If any answer is NO, defer to post-MVP.

## Common Feature Bloat to Challenge

### Premature Features for Waitlist Apps
- Player search/filtering - Staff see <20 players at once, scrolling is faster
- Historical analytics - Doesn't solve operational pain points
- Manual table assignment - Staff do this verbally already
- Undo/edit history - Re-adding player is simpler than complex state management
- Multi-language toggle - Icons + numbers reduce dependency, add when expanding regions

### The "Whiteboard Test"
Ask: "Is this faster than writing on whiteboard?"
- QR scan: YES (3 sec vs 15 sec writing name)
- Manual search: NO (scrolling whiteboard = instant)
- Analytics dashboard: NO (whiteboard doesn't have this)

## Technical Requirement Patterns

### Real-Time Sync is Critical for Multi-Sided Platforms
- Staff iPad updates must reflect on user app within 2 seconds
- Websocket disconnection = major UX failure (auto-reconnect essential)
- Database timestamp accuracy drives timeout alerts (10-min blinking)

### Security Through Backend Centralization
- Never store API keys (LINE tokens) in frontend/iPad
- Use database webhooks + Edge Functions for sensitive operations
- "Frontend is dumb, backend is smart" = easier to maintain at scale

## Successful MVP Scoping Techniques

### Used in TPDS Admin:
1. List all pain points, rank by frequency + severity
2. Map features to pain points (must be 1:1, no "nice to have")
3. Apply 3-second operation filter
4. Explicitly document deferred features with rationale (prevents revisiting)

### Decision Framework
Feature passes MVP test if ALL true:
- Solves ranked pain point #1-3
- Completable in <3 seconds (or <10 sec if rarely used)
- Cannot deliver core value without it
- Feasible in 6-week timeline

## User Journey Best Practices

### Structure
- Start with triggering scenario (player walks in)
- Step-by-step with timings (<3 sec, <5 sec)
- Include alternate paths (QR fails → manual entry)
- End with success criteria (measurable metrics)

### Red Flags
- Journey requires >5 taps = too complex
- Journey depends on training = needs simplification
- Journey has "wait for..." steps = async issue

## Acceptance Criteria Patterns

### The 3-Layer Model
1. Functional: Feature works as specified (QR scan adds player)
2. Performance: Feature meets speed requirement (<3 sec)
3. Operational: Staff prefer it over old method (measured via feedback)

### Testing Scenarios
Always include:
- Peak load scenario (30 players, rapid operations)
- Network failure scenario (WiFi disconnect)
- Physical environment scenario (sunlight glare test)
- Edge case scenario (multilingual names, emoji)

## Domain-Specific Insights: Poker Rooms

### Operational Constraints
- Cannot predict when player leaves (poker game duration = random)
- No-shows are common (10-min timeout alerts critical)
- Multiple rate games run simultaneously (tab filtering essential)
- Staff turnover is high (UI must be self-explanatory)

### Business Model Dependencies
- Store adoption depends on staff, not management (must be "10x easier")
- Revenue comes from user app, but data quality depends on staff diligence
- Single failure (wrong seat count) = user map untrustworthy = platform fails

## Anti-Patterns Observed

### From Initial Spec Review
- Original spec included "priority pass purchase" (monetization) - Deferred (not core waitlist problem)
- Original spec suggested "AI concierge" - Deferred (nice-to-have, not MVP)
- Offline mode consideration - Rejected (adds complexity, stores have WiFi)

### General Red Flags
- Features described as "would be cool if..." = defer
- Features requiring configuration screens = defer
- Features solving hypothetical problems = defer
- Features needed "just in case" = defer

## File Naming Convention
Use descriptive, scoped names: `TPDS_ADMIN_MVP_REQUIREMENTS.md`
Not: `requirements.md` (too generic)

## Next Session Prep
- Review MEMORY.md first to recall project context
- Check for updated specification documents
- Ask about changed constraints before diving into solutions
