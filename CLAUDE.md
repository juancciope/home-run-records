# Claude Code Documentation

## Project Overview
Home Run Records - Music production management platform with dashboards for tracking artist metrics and production workflows.

## Subdomain Routing
**IMPORTANT**: The app uses subdomain-based routing via Next.js middleware:
- `spotify.homeformusic.app` → `/spotify` (Spotify Playlist Scraper)
- `social.homeformusic.app` → `/social` (Artist AI Social Analytics)
- `audience.homeformusic.app` → `/audience` (Find Your Audience Quiz)
- `homerun.homeformusic.app` → Root `/` (Main Artist OS Platform)

**Implementation**: `/middleware.ts` using `NextResponse.rewrite` pattern. Must use `request.nextUrl.clone()` and modify `pathname` directly.

## MANDATORY RULES

### UI/UX Kit Consistency (CRITICAL)
**ALWAYS USE THE EXISTING UI/UX KIT FOR ALL COMPONENTS, SCREENS, AND FEATURES**

- **ALL new components MUST follow existing design patterns**
- **ALL cards MUST match the Overview dashboard style with:**
  - Same header structure (CardTitle, CardDescription)
  - Same action button patterns (ghost buttons, proper sizing)
  - Same color schemes and border styles
  - Same spacing and typography
- **ALL buttons MUST use shadcn/ui Button component with consistent sizing**
- **ALL layouts MUST follow grid patterns established in existing dashboards**
- **NEVER create custom styling that deviates from the established design system**

## Technology Stack
- Next.js 15.4.5 with App Router and TypeScript
- shadcn/ui component library (MANDATORY FOR ALL UI COMPONENTS)
- @dnd-kit for drag-and-drop functionality
- Supabase for database operations
- PostgreSQL with RLS policies

## Database Schema
- `production_records` table with `record_type` field ('unfinished', 'finished', 'released')
- `user_dashboard_metrics` table for overview dashboard data

## Critical Features

### Production Dashboard Drag and Drop (WORKING - DO NOT BREAK)
**Location**: `/src/app/dashboard/production/page.tsx`

**Key Implementation Details**:
1. **State Management**: Uses `originalStatus` to track pre-drag state
2. **Drag Start**: Stores original status before any UI changes
3. **Drag Over**: Updates UI optimistically but doesn't save to DB
4. **Drag End**: Compares `originalStatus` vs `targetStatus` (NOT current vs target)
5. **Button Functionality**: NEVER use `refreshKey` or forced re-renders - they break button event handlers

**Critical Code Sections**:
```typescript
const [originalStatus, setOriginalStatus] = useState<string | null>(null)

const handleDragStart = (event: DragStartEvent) => {
  setActiveId(event.active.id)
  const record = findRecordById(event.active.id as string)
  if (record) {
    setOriginalStatus(record.record_type) // Store ORIGINAL status
  }
}

const handleDragEnd = async (event: DragEndEvent) => {
  // Compare originalStatus vs targetStatus (not current vs target)
  if (originalStatus && originalStatus !== targetStatus) {
    // Database update logic
  }
  setOriginalStatus(null) // Clear after operation
}
```

**Why This Works**:
- `handleDragOver` updates UI immediately for smooth UX
- `handleDragEnd` uses stored `originalStatus` to detect actual changes
- Prevents false "no change" detections that caused persistence issues

**Sensor Configuration (CRITICAL)**:
```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  })
)
```
- `delay: 100` prevents drag interference with button clicks
- `tolerance: 5` allows small movements without triggering drag

**Database Mapping**:
- UI Column "In-progress" → `record_type: 'unfinished'`
- UI Column "Ready to Release" → `record_type: 'finished'`  
- UI Column "Live Catalog" → `record_type: 'released'`

**CRITICAL: Button Functionality & Radix UI Bug Fix**
- NEVER use `refreshKey` state or forced re-renders after operations
- React loses event handlers when components are forced to re-render with changing keys
- Only call `fetchRecords()` to refresh data - React will handle UI updates properly

**CRITICAL: Radix UI Pointer-Events Bug**
- DropdownMenu + Dialog/AlertDialog combo causes `body { pointer-events: none }` to remain after modal close
- This disables ALL clicks globally across the entire app
- Fixed with `modal={false}` on DropdownMenu and cleanup effect:

```typescript
// DropdownMenu fix
<DropdownMenu modal={false}>

// Cleanup effect in component
useEffect(() => {
  const cleanupPointerEvents = () => {
    if (document.body.style.pointerEvents === 'none') {
      document.body.style.pointerEvents = 'auto'
    }
  }
  const timeoutId = setTimeout(cleanupPointerEvents, 100)
  return () => {
    clearTimeout(timeoutId)
    cleanupPointerEvents()
  }
}, [records])

// In modal close handlers
setTimeout(() => {
  if (document.body.style.pointerEvents === 'none') {
    document.body.style.pointerEvents = 'auto'
  }
}, 50)
```

### Data Consistency
Both Overview and Production dashboards use `production_records` table directly for consistent counts.

## Build Commands
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run dev` - Development server

## API Endpoints
- `/api/dashboard/production` - GET/PATCH/DELETE for production records
- `/api/dashboard/unified` - GET/PUT for overview dashboard data

## Testing Notes
- Test drag and drop persistence by dragging items and refreshing page
- Verify dropdown menus remain clickable after delete operations
- Ensure data consistency between Overview and Production dashboards