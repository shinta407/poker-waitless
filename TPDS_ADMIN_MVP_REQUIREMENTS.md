# TPDS Admin (店舗管理用iPad アプリ) - MVP Requirements Document

**Version:** 1.0
**Last Updated:** 2026-02-11
**Target Device:** iPad (Landscape Orientation)
**Development Priority:** Phase 1 - Critical MVP

---

## 1. App Purpose - What Problem Does This Solve?

**Single Clear Statement:**
TPDS Admin transforms poker room staff operations from manual whiteboard management to a real-time digital waitlist system that synchronizes seat availability across all Taipei poker rooms, enabling instant customer notifications and transparent capacity visibility.

**Why It Matters:**
- Staff currently waste 5-10 minutes per hour managing whiteboard updates and calling customers
- Players arrive at closed tables due to information lag
- No system exists to coordinate capacity across 40+ Taipei poker venues
- Manual processes lead to errors, no-shows, and customer frustration

---

## 2. Target Users & Pain Points

### Primary User: Poker Room Staff (店員)

**Persona:**
- Age: 25-45
- Tech comfort: Basic to intermediate
- Work environment: Fast-paced, noisy poker room floor
- Language: Primarily Chinese (Traditional), some English
- Physical constraints: Standing, moving between tables, thick fingers on touchscreen

**Ranked Pain Points:**

| Priority | Pain Point | Current Impact | MVP Solution |
|----------|-----------|----------------|--------------|
| 1 | Manual whiteboard updates take too long and cause bottlenecks | 10-15 min/hour wasted | 1-tap buttons for all status changes |
| 2 | Customers arrive without knowing wait time, causing complaints | 30% customer dissatisfaction | Real-time sync shows accurate queue position |
| 3 | Called players don't respond, blocking seat turnover | 15% seat utilization loss | 10-minute blinking alert system |
| 4 | Staff forget to update seat counts when players leave | Data inaccuracy 20% of time | Large +/- buttons for immediate updates |
| 5 | Cannot quickly add walk-in customers during peak hours | 3-5 min registration time | QR scan adds player in <3 seconds |

---

## 3. MVP Scope Statement

### What WILL be in MVP:

**Core Waitlist Management:**
- Add player to waitlist (QR scan OR manual name entry)
- Display waitlist by rate (1/3, 2/5, 5/10+, Tournament)
- Call player (triggers LINE notification)
- Mark player as seated (removes from list)
- 10-minute alert for uncalled players after notification

**Table Status Management:**
- Display occupied/total seats per table by rate
- Quick +/- buttons to adjust seat counts
- Automatic seat increment when player marked "seated"

**Rate Filtering:**
- Tab navigation (1/3, 2/5, 5/10+, Tournament)
- Filtered view of waitlist and tables per rate

**Essential Data Fields:**
- Player name (or LINE nickname)
- Estimated arrival time (if from app check-in)
- Rate preference
- Call timestamp
- Status (Waiting, Called, Seated)

### What will NOT be in MVP:

**Explicitly Deferred (Post-MVP):**
- Player search/filtering by name
- Historical analytics or reports
- Manual table assignments (staff decides verbally)
- Multi-language UI toggle (Chinese only for MVP)
- Player notes or VIP tags
- Cancellation/no-show tracking with penalties
- Push notification settings configuration
- Offline backup mode (requires stable internet)
- Manual undo/edit of past actions
- Multi-device sync for same store (single iPad per store)

**Rationale:**
These features don't directly solve the 3-second operation constraint or core pain points of "fast waitlist updates" and "accurate seat counts." They add complexity that slows initial adoption.

---

## 4. Core User Journeys

### Journey 1: Walk-in Customer Arrives

**Scenario:** Player walks into poker room wanting to join 1/3 NTD table

**Steps:**
1. Staff taps [QR Scan] button (bottom-right, always visible)
2. iPad camera opens
3. Staff scans player's LINE QR code from TPDS Player app
4. Player automatically added to waitlist with LINE name, current rate (1/3), timestamp
5. Player appears at bottom of waitlist on left side (60% panel)
6. **Total time: <3 seconds**

**Alternate Path (No QR):**
1. Staff taps [+ Add Player] button
2. Simple modal: "Enter Name" text field
3. Staff types name, taps rate button (1/3, 2/5, etc.)
4. Player added to waitlist
5. **Total time: <10 seconds**

**Success Criteria:**
- 100% of QR scans complete in <3 seconds
- Manual entry <10 seconds for 95% of cases
- Zero crashes during camera access

---

### Journey 2: Seat Opens, Staff Calls Player

**Scenario:** Player leaves table, staff needs to call next person in queue

**Steps:**
1. Staff sees player leave Table 2 (1/3 rate)
2. Staff taps [-] button next to "Table 2" on right panel (40% area)
3. Seat count updates: "8/9" → "7/9"
4. Staff looks at left panel (waitlist for 1/3)
5. Staff taps [Call] button next to top waitlist player name
6. LINE notification sent instantly to player
7. Timestamp recorded, 10-minute timer starts
8. Player status changes to "Called" (visual indicator: yellow background)
9. **Total time: <5 seconds**

**Success Criteria:**
- LINE notification delivered within 2 seconds of button tap
- Seat count updates instantly on user-facing map (green/yellow/red signal)
- Visual feedback confirms notification sent (brief success message)

---

### Journey 3: Player Arrives and Sits

**Scenario:** Called player arrives at table

**Steps:**
1. Staff sees player approach
2. Staff taps [Seated] button next to player name on waitlist
3. Player removed from waitlist
4. Seat count on right panel auto-increments: "7/9" → "8/9"
5. User's app status updates to "Seated - Enjoy your game!"
6. **Total time: <2 seconds**

**Success Criteria:**
- Player removed from list instantly
- Seat count accuracy maintained 100%
- User app reflects seated status within 2 seconds

---

### Journey 4: 10-Minute Alert for Unresponsive Player

**Scenario:** Staff called player but player hasn't arrived after 10 minutes

**Steps:**
1. System detects 10 minutes passed since call timestamp
2. Player row on waitlist starts blinking red (high contrast)
3. Staff notices blinking alert
4. Staff verbally asks "Is [Player Name] here?"
5. If NO: Staff taps [Remove] button to clear from list
6. If YES: Staff taps [Seated] button to proceed
7. **Total time: <3 seconds for decision**

**Success Criteria:**
- 100% of 10-minute alerts trigger accurately
- Blinking animation visible even in bright sunlight
- Staff can override/remove without penalty

---

### Journey 5: Manual Table Seat Adjustment

**Scenario:** Staff needs to close a table or adjust max seats

**Steps:**
1. Staff taps [-] button multiple times to decrease occupied seats
2. Seat counter updates in real-time on both iPad and user map
3. If occupied seats reach 0, table status considered "closed" (no green signal)
4. **Total time: <5 seconds**

**Alternate: Adding New Table**
- Post-MVP feature: Staff would contact system admin to configure new tables
- MVP constraint: Tables pre-configured during store onboarding

**Success Criteria:**
- +/- buttons respond instantly (<100ms)
- Seat counts never go negative or exceed max capacity
- User map reflects changes within 2 seconds

---

## 5. MVP Screen Architecture

### Screen Layout: iPad Landscape (2360 x 1640 or 2732 x 2048)

```
┌─────────────────────────────────────────────────────────────────┐
│  [1/3]  [2/5]  [5/10+]  [Tournament]        Store: CTP Poker   │ ← Top Bar (10%)
├────────────────────────────────┬────────────────────────────────┤
│                                │                                │
│   LEFT: Waitlist Management    │   RIGHT: Table Status         │
│   (60% width)                  │   (40% width)                 │
│                                │                                │
│  Player Name    Est.Arrival    │   Table 1 (1/3)  [−] 8/9 [+]  │
│  ┌──────────────────────────┐  │   Table 2 (1/3)  [−] 7/9 [+]  │
│  │ John Chen    15:30       │  │   Table 3 (1/3)  [−] 9/9 [+]  │
│  │ [Call] [Seated]          │  │                                │
│  └──────────────────────────┘  │   Table 4 (2/5)  [−] 6/9 [+]  │
│                                │   Table 5 (2/5)  [−] 8/9 [+]  │
│  ┌──────────────────────────┐  │                                │
│  │ Sarah Lin    15:45       │  │   Total Occupied: 38/45       │
│  │ [Call] [Seated]          │  │   Available Seats: 7          │
│  └──────────────────────────┘  │                                │
│                                │                                │
│  ┌──────────────────────────┐  │                                │
│  │ Mike Wang    --:--       │  │                                │
│  │ [Call] [Seated]          │  │ ← Blinking Red if 10min alert │
│  └──────────────────────────┘  │                                │
│                                │                                │
│         [+ Add Player]         │                                │
│         [QR Scan]              │                                │
│                                │                                │
└────────────────────────────────┴────────────────────────────────┘
```

### Component Hierarchy & Specifications

#### 1. Top Bar (10% height)

**Purpose:** Rate filtering and store identification

**Components:**
- Rate Tabs: 4 large buttons (150px x 80px each)
  - Labels: "1/3", "2/5", "5/10+", "Tournament"
  - Active tab: Blue background (#007AFF), white text, bold
  - Inactive tabs: Light gray (#F2F2F7), dark gray text
  - Tap to switch rate view (filters both left and right panels)

- Store Name Display (right corner)
  - Shows current store name (e.g., "CTP Poker")
  - Read-only in MVP (set during login)

**Design Requirements:**
- Font size: 32pt (easily readable from 1 meter)
- High contrast ratio: 7:1 minimum (WCAG AAA)
- Tap target: Minimum 44x44pt (Apple HIG standard, generous buffer for thick fingers)

---

#### 2. Left Panel: Waitlist Management (60% width, 90% height)

**Purpose:** Display queue of waiting players with action buttons

**Player Card Design (each row):**

```
┌────────────────────────────────────────────────┐
│  👤 Player Name          🕐 Estimated Arrival  │
│  Status: Waiting / Called / (time remaining)   │
│                                                 │
│  [  📞 Call  ]        [  ✓ Seated  ]          │
│  (120px x 60px)       (120px x 60px)           │
└────────────────────────────────────────────────┘
```

**Data Fields (per player):**
- Player Name: 28pt font, bold, black text
- Estimated Arrival Time: 24pt font, gray text (if from app check-in, else "--:--")
- Status Indicator:
  - Waiting: White background
  - Called: Yellow background (#FFCC00), shows "Called 5 min ago"
  - 10-min alert: RED blinking background (#FF3B30), CSS animation 1Hz pulse

**Action Buttons:**
- [Call] Button:
  - Size: 120px x 60px
  - Color: Blue (#007AFF)
  - Icon: Phone emoji or phone icon
  - Tap action: Triggers LINE notification, changes status to "Called"

- [Seated] Button:
  - Size: 120px x 60px
  - Color: Green (#34C759)
  - Icon: Checkmark
  - Tap action: Removes player from list, increments seat count

**Bottom Fixed Buttons:**
- [+ Add Player] Button:
  - Size: 200px x 70px
  - Color: Dark gray (#8E8E93)
  - Position: Bottom-left corner
  - Tap action: Opens name entry modal

- [QR Scan] Button:
  - Size: 200px x 70px
  - Color: Orange (#FF9500)
  - Position: Bottom-right corner
  - Icon: QR code icon + camera
  - Tap action: Opens camera for QR scanning

**Scrolling Behavior:**
- Vertical scroll enabled when >8 players
- Maintains fixed header and bottom buttons
- Smooth scroll with momentum

**Empty State:**
- Display: "No players waiting for [Rate]. Tap QR Scan to add."
- Icon: Empty clipboard or smiley face
- Font size: 24pt, gray color

---

#### 3. Right Panel: Table Status Counter (40% width, 90% height)

**Purpose:** Real-time seat availability per table

**Table Row Design:**

```
┌──────────────────────────────────────────┐
│  Table 1 (1/3)    [−]  8 / 9  [+]       │
│  Table 2 (1/3)    [−]  7 / 9  [+]       │
│                                          │
│  Total Occupied: 15 / 18                 │
│  Available Seats: 3                      │
└──────────────────────────────────────────┘
```

**Data Fields (per table):**
- Table Name + Rate: 26pt font, bold (e.g., "Table 1 (1/3)")
- Occupied / Max Seats: 36pt font, ultra-bold, black text
  - Example: "8 / 9"
  - Color coding:
    - Full (9/9): Red text
    - Near full (7-8/9): Orange text
    - Available (<7/9): Black text

**Action Buttons:**
- [-] Button (Decrease seats):
  - Size: 80px x 80px (EXTRA LARGE)
  - Color: Red (#FF3B30)
  - Font: 48pt bold "-" symbol
  - Tap action: Decreases occupied count by 1 (min: 0)

- [+] Button (Increase seats):
  - Size: 80px x 80px (EXTRA LARGE)
  - Color: Green (#34C759)
  - Font: 48pt bold "+" symbol
  - Tap action: Increases occupied count by 1 (max: 9 or configured max)

**Summary Display (bottom):**
- Total Occupied / Total Max: 32pt font, bold
- Available Seats: 32pt font, green if >0, red if 0
- Visual separator: Horizontal line above summary

**Design Requirements:**
- Button spacing: Minimum 20px between +/- buttons
- Tap feedback: Button scales down 90% on tap (visual confirmation)
- Haptic feedback: Medium impact on tap (iOS native)

---

## 6. Technical Requirements

### 6.1 Real-Time Data Sync (Supabase Realtime)

**Database Tables:**

**`waitlist` Table:**
```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id),
  user_id TEXT, -- LINE user ID from QR scan
  user_name TEXT NOT NULL,
  rate_preference TEXT NOT NULL, -- '1/3', '2/5', '5/10+', 'tournament'
  status TEXT DEFAULT 'waiting', -- 'waiting', 'called', 'seated', 'cancelled'
  called_at TIMESTAMP,
  arrival_estimation_minutes INT, -- from app check-in
  created_at TIMESTAMP DEFAULT NOW()
);
```

**`tables` Table:**
```sql
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id),
  table_name TEXT NOT NULL, -- 'Table 1', 'Table 2'
  rate TEXT NOT NULL, -- '1/3', '2/5', etc.
  max_seats INT DEFAULT 9,
  current_players INT DEFAULT 0,
  status TEXT DEFAULT 'open' -- 'open', 'closed'
);
```

**Realtime Subscription Logic:**
```javascript
// iPad subscribes to changes in waitlist and tables for current store
const waitlistSubscription = supabase
  .channel('waitlist_changes')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'waitlist',
      filter: `store_id=eq.${currentStoreId}`
    },
    (payload) => {
      // Update waitlist UI instantly
      updateWaitlistUI(payload);
    }
  )
  .subscribe();

const tableSubscription = supabase
  .channel('table_changes')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'tables',
      filter: `store_id=eq.${currentStoreId}`
    },
    (payload) => {
      // Update table status UI instantly
      updateTableStatusUI(payload);
    }
  )
  .subscribe();
```

**Performance Requirements:**
- Update latency: <500ms from button tap to database write
- UI refresh: <100ms from database change to screen update
- Websocket connection: Auto-reconnect on network interruption within 5 seconds

---

### 6.2 LINE Notification Triggering

**Architecture: Supabase Edge Functions**

**Flow:**
1. iPad updates `waitlist.status` to 'called' and sets `called_at` timestamp
2. Supabase Database Webhook triggers Edge Function
3. Edge Function calls LINE Messaging API
4. LINE delivers notification to user

**Edge Function: `send-call-notification.ts`**
```typescript
// Triggered by database webhook on waitlist UPDATE
Deno.serve(async (req) => {
  const { record } = await req.json(); // new waitlist record

  if (record.status === 'called' && record.user_id) {
    const lineMessage = {
      to: record.user_id,
      messages: [{
        type: 'text',
        text: `🃏 Your seat is ready at ${storeName}! Please head to the table within 10 minutes. Rate: ${record.rate_preference}`
      }]
    };

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')}`
      },
      body: JSON.stringify(lineMessage)
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }
});
```

**Security Requirements:**
- LINE Channel Access Token stored in Supabase Secrets (never in frontend)
- Edge Function authenticated via Supabase JWT
- Rate limiting: Max 100 notifications per minute per store

**Error Handling:**
- Failed notification: Log error, show red "Failed" icon on iPad, allow manual retry
- User blocked LINE account: Skip notification, show warning icon
- Network timeout: Retry up to 3 times with exponential backoff

---

### 6.3 10-Minute Timeout Logic

**Implementation: Frontend JavaScript**

**Approach:** Client-side timer with visual alert (no backend polling needed for MVP)

```javascript
// Check every 30 seconds for expired calls
setInterval(() => {
  const waitlist = getWaitlistFromState(); // local state synced with Supabase

  waitlist.forEach(player => {
    if (player.status === 'called' && player.called_at) {
      const elapsedMinutes = (Date.now() - new Date(player.called_at)) / 60000;

      if (elapsedMinutes >= 10) {
        // Trigger blinking animation
        document.getElementById(`player-${player.id}`).classList.add('blink-red');
      }
    }
  });
}, 30000); // Check every 30 seconds
```

**CSS Animation:**
```css
@keyframes blink-red {
  0%, 100% { background-color: #FF3B30; }
  50% { background-color: #FFFFFF; }
}

.blink-red {
  animation: blink-red 1s infinite;
  border: 4px solid #FF3B30;
}
```

**Design Requirements:**
- Animation starts exactly at 10:00 elapsed time (±10 seconds acceptable)
- Animation persists until staff takes action (Seated or Remove)
- Multiple players can blink simultaneously without performance degradation
- Animation visible in all lighting conditions (100% brightness contrast)

---

### 6.4 Offline Capability

**MVP Decision: NOT included**

**Rationale:**
- Adds significant complexity (local database, conflict resolution, sync queue)
- Poker rooms have stable WiFi infrastructure (business requirement)
- 3-second operation constraint depends on real-time sync (defeats purpose if offline)
- Staff can fall back to whiteboard temporarily during internet outages

**Post-MVP Consideration:**
- Implement service worker for cached reads (show last known state)
- Queue write operations for sync when connection restored
- Warn staff with banner: "Offline Mode - Data may be outdated"

---

## 7. Acceptance Criteria - Definition of Success

### 7.1 Functional Acceptance Criteria

**Waitlist Management:**
- [ ] QR scan adds player to waitlist in <3 seconds (95th percentile)
- [ ] Manual player entry completes in <10 seconds (95th percentile)
- [ ] Call button sends LINE notification within 2 seconds
- [ ] Seated button removes player and updates seat count atomically
- [ ] 10-minute alert triggers within ±10 seconds of elapsed time
- [ ] Blinking animation visible in bright sunlight (verified by staff)

**Table Status Management:**
- [ ] +/- buttons respond in <100ms
- [ ] Seat counts never go negative or exceed max capacity
- [ ] Auto-increment on player seated works 100% of the time
- [ ] Total occupied/available summary updates instantly

**Rate Filtering:**
- [ ] Tab switch filters waitlist and tables in <200ms
- [ ] Active tab visually distinct from inactive tabs
- [ ] Filtered data accurate (no cross-rate contamination)

**Real-Time Sync:**
- [ ] iPad updates reflect on user map within 2 seconds
- [ ] Multiple iPads at same store show consistent data (if multi-device post-MVP)
- [ ] Websocket reconnects automatically within 5 seconds after network interruption

**UI/UX:**
- [ ] All buttons meet 44x44pt minimum tap target (iOS HIG)
- [ ] Font sizes readable from 1 meter distance (verified by staff aged 45+)
- [ ] High contrast ratio 7:1 for all text/background pairs (WCAG AAA)
- [ ] No accidental taps on adjacent buttons (tested with thick fingers)

---

### 7.2 Performance Requirements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| QR Scan Speed | <3 seconds (95th %ile) | Timed user testing with 20 scans |
| Button Tap Response | <100ms | Chrome DevTools performance profiler |
| LINE Notification Delivery | <2 seconds | Server log timestamps |
| Database Write Latency | <500ms | Supabase dashboard metrics |
| App Load Time (cold start) | <4 seconds | Lighthouse performance audit |
| Memory Usage | <300MB | iPad Settings > General > iPad Storage |
| Battery Consumption | <20% per 8-hour shift | Full-day staff usage test |

**Stress Testing:**
- Handle 50 concurrent players in waitlist without lag
- Support 10 tables with real-time updates
- Survive 100 rapid +/- button taps without crash

---

### 7.3 Testing Scenarios

**Scenario 1: Peak Hour Rush (Friday Night)**
- **Setup:** 30 players in waitlist, 8 tables at 90% capacity
- **Actions:** Staff adds 5 new players via QR, calls 3 players, seats 2 players, adjusts 4 table counts
- **Expected:** All operations complete in <3 seconds each, no UI freezes, user map reflects changes in real-time

**Scenario 2: 10-Minute Alert Handling**
- **Setup:** Call player at 15:00, player doesn't respond
- **Actions:** Wait until 15:10, verify blinking starts
- **Expected:** Red blinking animation starts at 15:10±10 seconds, staff removes player in 1 tap

**Scenario 3: Network Interruption Recovery**
- **Setup:** Disconnect WiFi during active session
- **Actions:** Perform 3 operations (call, seat, +/-), reconnect WiFi
- **Expected:** Show error banner, operations queue for retry, sync completes within 5 seconds of reconnection (POST-MVP)

**Scenario 4: Multilingual Player Names**
- **Setup:** Add players with Chinese, Japanese, English names
- **Actions:** Display in waitlist, send notifications
- **Expected:** All characters render correctly, no truncation, notifications deliver successfully

**Scenario 5: Sunlight Glare (Outdoor Test)**
- **Setup:** Use iPad in direct sunlight at max brightness
- **Actions:** Staff reads waitlist, identifies blinking alert, taps buttons
- **Expected:** All text/buttons visible, colors distinguishable, no accidental taps

---

## 8. Out-of-Scope (Common Pitfalls to Avoid)

### Features That Seem Useful But Hurt MVP:

**1. Player History / Analytics Dashboard**
- **Why Tempting:** "Let's show staff how many players came today!"
- **Why Deferred:** Doesn't solve 3-second operation constraint. Adds database complexity. Staff don't need this to manage waitlist.
- **When to Add:** After 3 months live data, if stores request it

**2. Manual Table Assignment**
- **Why Tempting:** "Staff should assign specific tables to players"
- **Why Deferred:** Staff already do this verbally. Adding UI slows down process. Introduces dependency on table configuration.
- **When to Add:** If stores report table-specific preferences (VIP tables, etc.)

**3. Push Notification Settings**
- **Why Tempting:** "Let users choose notification timing"
- **Why Deferred:** One-size-fits-all (call = immediate notify) works for MVP. Configuration adds cognitive load.
- **When to Add:** If users complain about notification timing (unlikely)

**4. Undo/Edit Past Actions**
- **Why Tempting:** "What if staff make a mistake?"
- **Why Deferred:** Staff can re-add player or adjust counts manually. Undo logic introduces state management complexity.
- **When to Add:** If mistake rate >5% (measure in beta)

**5. Multi-Language UI Toggle**
- **Why Tempting:** "Support English and Chinese!"
- **Why Deferred:** Target stores in Taipei use Traditional Chinese. Icons + numbers reduce language dependency. Translation adds QA burden.
- **When to Add:** When expanding to Japan/Korea (6+ months)

---

## 9. Success Metrics - How We Know MVP Wins

### Business Metrics (3-Month Targets)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Store Adoption Rate | 10 stores using daily | Validates product-market fit |
| Daily Active Usage | 8+ hours/day per store | Proves staff prefer it over whiteboard |
| Average Operation Time | <3 seconds per action | Core pain point solved |
| User Satisfaction (NPS) | >40 (store staff survey) | Staff will advocate to other stores |
| Data Accuracy | >95% seat count accuracy | User-facing map trustworthy |

### Technical Metrics (Ongoing Monitoring)

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| App Crash Rate | <0.1% sessions | >1% |
| LINE Notification Delivery Rate | >98% | <95% |
| Database Write Errors | <0.5% requests | >2% |
| Average Response Time | <100ms | >500ms |
| Websocket Uptime | >99.5% | <98% |

### User Behavior Indicators (Early Validation)

**Week 1 Goals:**
- Staff complete 100+ operations without asking for help
- Zero requests to revert to whiteboard
- At least 1 staff member says "This is faster!"

**Month 1 Goals:**
- 500+ players called via app (vs 0 manual calls)
- 50+ QR scans per day (proves adoption of check-in flow)
- Store manager recommends to 1+ other stores

**Failure Signals (Stop and Pivot If):**
- Staff revert to whiteboard after 1 week
- >5 complaints about "too complicated"
- QR scan success rate <80%
- Store asks for refund or cancellation

---

## 10. Development Roadmap - Build Order

### Phase 1: Core Waitlist (Week 1-2)

**Priority:** CRITICAL - Must work for MVP launch

**Deliverables:**
1. Login screen (store authentication via Supabase Auth)
2. Rate tab navigation (4 tabs: 1/3, 2/5, 5/10+, Tournament)
3. Waitlist display (left panel)
   - Display player name, arrival time, status
   - Scroll support for >8 players
4. Manual "Add Player" function (name + rate entry)
5. [Call] button → Updates database status to 'called'
6. [Seated] button → Removes from list
7. Supabase Realtime subscription for waitlist updates

**Acceptance Test:**
Engineer demonstrates adding 3 players manually, calling 1, seating 1, on localhost.

---

### Phase 2: Table Status + Auto-Increment (Week 3)

**Priority:** HIGH - Needed for user-facing map accuracy

**Deliverables:**
1. Table status display (right panel)
   - Show table name, rate, occupied/max seats
2. +/- buttons for manual seat adjustment
3. Auto-increment logic: When player seated, find matching rate table and +1 occupied count
4. Total occupied/available summary
5. Realtime subscription for table updates

**Acceptance Test:**
Engineer demonstrates seating player auto-increments table count, +/- buttons work, on localhost.

---

### Phase 3: QR Scan + LINE Notification (Week 4)

**Priority:** HIGH - Eliminates manual entry, enables user notifications

**Deliverables:**
1. QR Scan button → Opens camera
2. Parse LINE QR code → Extract user_id and name
3. Add player to waitlist with LINE data
4. Supabase Edge Function for LINE Messaging API
5. Database webhook trigger on `status='called'`
6. LINE notification delivery with store name + rate

**Acceptance Test:**
Engineer scans test LINE QR, player added to list, calls player, LINE notification received on test phone.

---

### Phase 4: 10-Minute Alert + Visual Polish (Week 5)

**Priority:** MEDIUM - Nice-to-have for MVP, critical for operations

**Deliverables:**
1. Timer logic in frontend (check every 30 seconds)
2. Blinking red animation for 10-minute alerts
3. Visual design pass:
   - Button sizing (80px x 80px for +/-)
   - Font sizes (28pt names, 36pt seat counts)
   - High contrast colors (test in sunlight)
4. Haptic feedback on button taps
5. Error handling (failed notifications, network errors)

**Acceptance Test:**
Engineer demonstrates 10-minute alert triggers (use 10-second timer for testing), blinking visible in bright room.

---

### Phase 5: Testing + Deployment (Week 6)

**Priority:** CRITICAL - Cannot launch without

**Deliverables:**
1. Stress testing (50 players, 10 tables, rapid taps)
2. Real device testing on iPad Pro (10.5", 11", 12.9")
3. Network interruption testing (disconnect WiFi)
4. Multilingual name testing (Chinese, Japanese, emoji)
5. Supabase production environment setup
6. App Store deployment (TestFlight for beta)
7. Staff training materials (1-page quick start guide)

**Acceptance Test:**
Beta store staff completes 50 operations without assistance, provides feedback, no critical bugs.

---

## 11. Open Questions & Risks

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| iPad camera QR scan reliability | HIGH - Core feature | Test 5+ iPad models, fallback to manual entry |
| LINE API rate limits | MEDIUM - Could block notifications | Monitor usage, implement queue + retry logic |
| Supabase free tier limits | LOW - May hit limits at scale | Upgrade to Pro plan ($25/mo) before launch |
| Websocket connection stability | HIGH - Real-time sync critical | Auto-reconnect, show connection status indicator |
| Multiple staff using same iPad | MEDIUM - Concurrent edits | Single iPad per store for MVP (no multi-user auth) |

### Business/Operational Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Staff resist new technology | HIGH - Adoption failure | In-person training, emphasize time savings, get champion staff |
| No-show players hurt store trust | HIGH - Store abandons app | Add GPS check-in restriction in Phase 2, blacklist repeat offenders |
| Language barrier (Chinese only UI) | MEDIUM - Limits expansion | Use icons heavily, add English in post-MVP if Japan expansion |
| Internet outage at store | LOW - Rare occurrence | Whiteboard backup process documented, auto-sync when online |

---

## 12. Appendix: Design Assets & References

### Required Design Deliverables

**Before Development:**
1. Figma mockup of full iPad screen (landscape, 2732x2048)
2. Button state designs (default, pressed, disabled)
3. Color palette specification (hex codes for all UI elements)
4. Icon set (QR code, phone, checkmark, +/-, alert)

**During Development:**
5. Logo/branding for top bar
6. Empty state illustrations
7. Error state messages (network error, failed notification)

### Color Palette (iOS Native)

- **Primary Blue:** #007AFF (Call button, active tab)
- **Success Green:** #34C759 (Seated button, + button)
- **Destructive Red:** #FF3B30 (- button, alert blinking)
- **Warning Orange:** #FF9500 (QR Scan button)
- **Warning Yellow:** #FFCC00 (Called status background)
- **Neutral Gray:** #8E8E93 (Add Player button, inactive elements)
- **Background:** #FFFFFF (white)
- **Text Primary:** #000000 (black)
- **Text Secondary:** #8E8E93 (gray)

### Typography

- **System Font:** SF Pro (iOS default)
- **Heading (Names):** 28pt, Bold
- **Body (Times):** 24pt, Regular
- **Large Numbers (Seat Counts):** 36pt, Heavy
- **Buttons:** 24pt, Semibold

---

## 13. Final Checklist - Ready to Develop?

**Product Clarity:**
- [ ] Core pain points clearly defined (3-second operation constraint)
- [ ] MVP scope locked (no feature creep during Phase 1-5)
- [ ] Post-MVP features documented with rationale for deferral

**Technical Feasibility:**
- [ ] Supabase account created, Realtime enabled
- [ ] LINE Messaging API credentials obtained
- [ ] iPad devices available for testing (at least 2 models)
- [ ] Engineer familiar with React/Next.js + Tailwind CSS

**Design Readiness:**
- [ ] Figma mockup reviewed and approved
- [ ] Button sizes verified for accessibility (44x44pt minimum)
- [ ] Color contrast tested (7:1 ratio for WCAG AAA)

**Operational Readiness:**
- [ ] Beta store identified and confirmed participation
- [ ] Store WiFi credentials obtained (for deployment testing)
- [ ] Staff training plan drafted (1-page quick start guide)
- [ ] Whiteboard fallback process documented

**Launch Criteria:**
- [ ] 50+ operations completed by beta store staff without bugs
- [ ] Average operation time <3 seconds (measured)
- [ ] LINE notifications delivering successfully (>95% rate)
- [ ] Staff verbal feedback: "This is faster than whiteboard"

---

## 14. Contact & Escalation

**Product Owner:** Nozato
**Technical Lead:** [Engineer Name TBD]
**Design Lead:** [Designer Name TBD]

**Decision Authority:**
- Scope changes: Product Owner approval required
- Technical architecture: Technical Lead decides, consults Product Owner on timeline impact
- UI/UX changes: Design Lead proposes, Product Owner approves

**Weekly Sync:** Every Monday 10:00 AM (Taipei Time)
**Critical Bug Escalation:** LINE group chat (response SLA: 2 hours)

---

**Document Version History:**
- v1.0 (2026-02-11): Initial MVP requirements based on specification analysis

**Next Review Date:** After Phase 1 completion (Week 2)

---

END OF REQUIREMENTS DOCUMENT

**Ready to build? Let's make Taipei poker rooms love this app.**
