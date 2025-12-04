# AIWO Healthcation Platform - Design Guidelines

## Design Approach: Premium Clinical Wellness

**References**: Function Health (clinical precision) + Equinox (luxury wellness) + Linear (modern data UI) + Four Seasons (hospitality excellence)

**Core Philosophy**: Medical-grade clarity meets luxury hospitality. Every interaction should inspire confidence in clinical rigor while feeling effortless and premium.

---

## Typography System

**Font Families**:
- Primary: `Inter` - UI, body text, data displays
- Accent: `Crimson Pro` - Marketing headlines, luxury program names

**Hierarchy**:
- Hero Headlines: 64px/72px, Crimson Pro, font-weight 400
- Section Headers: 36px/44px, Inter, font-weight 600
- Card Titles: 20px/28px, Inter, font-weight 600
- Body Text: 16px/24px, Inter, font-weight 400
- Data Labels: 14px/20px, Inter, font-weight 500
- Captions: 12px/16px, Inter, font-weight 400

---

## Layout & Spacing

**Spacing Scale**: Use Tailwind units 2, 4, 6, 8, 12, 16, 24

**Container Widths**:
- Marketing pages: max-w-7xl (1280px)
- Dashboard content: max-w-6xl (1152px)
- Data tables/forms: max-w-5xl (1024px)
- Reading content: max-w-prose (65ch)

**Grid Patterns**:
- Dashboard cards: 3-column grid on desktop (grid-cols-3), 2-col tablet, 1-col mobile
- Biomarker data: 4-column grid for metric cards
- Program selection: 2-column comparison layout
- Physician portal: Sidebar (280px) + main content area

---

## Component Library

### Navigation
**Main Dashboard Nav**: Fixed left sidebar (280px wide)
- Logo at top (p-6)
- Navigation items with icons (py-3, px-4)
- User profile at bottom with avatar, name, health score badge
- Active state: subtle background with border-l-4 accent

**Mobile**: Bottom tab bar with 5 primary actions

### Cards & Containers
**Health Metric Cards**: 
- Elevated cards with subtle shadow (shadow-sm)
- Rounded corners (rounded-xl)
- Padding: p-6
- Structure: Icon + Label + Large Value + Trend indicator + Mini sparkline

**Biomarker Test Card**:
- Horizontal layout: Date/Type (left) | Key metrics (center) | Status badge + CTA (right)
- Expandable to show full 400+ marker breakdown
- Traffic light status indicators (green/yellow/orange/red dots)

**Protocol Section Cards**:
- Collapsible accordion style
- Header: Category icon + Title + Compliance percentage
- Body: Grid of items with checkboxes for daily tracking

### Data Visualization
**Health Score Gauge**: 
- Semi-circle gauge (0-100 scale)
- Color gradient based on score ranges
- Large central number with biological age comparison underneath

**Biomarker Trend Charts**:
- Line charts with 6-month view default
- Reference range bands (optimal, normal, concerning zones)
- Hover tooltips with exact values and dates
- Use Recharts library with custom styling

**Progress Timeline**:
- Vertical timeline with photo uploads, test dates, milestone markers
- Before/after photo comparison slider

### Forms & Inputs
**Booking Wizard**:
- Multi-step with progress indicator (dots or numbers 1-6)
- Step navigation: Back button (text) + Next/Continue button (primary)
- Each step uses max 60% viewport height, scrollable content
- Summary sidebar on right showing selections (desktop only)

**Input Fields**:
- Floating labels
- Helper text below field
- Error states with red border + error message
- Success states with green checkmark icon

### Buttons
**Hierarchy**:
- Primary CTA: Filled with white text, bold weight (px-6 py-3)
- Secondary: Outlined with border (px-6 py-3)
- Tertiary: Text only with subtle hover (px-4 py-2)

**Contexts**:
- Hero CTA: Large primary button (px-8 py-4, text-lg)
- Form submit: Primary button, full width on mobile
- Card actions: Small secondary buttons
- Danger actions: Red color scheme for cancellations/deletions

### Modals & Overlays
**AI Health Coach Chat**:
- Floating bottom-right bubble trigger (60px circle)
- Expands to overlay panel (400px wide, 600px tall)
- Message bubbles: User (right-aligned) vs AI (left-aligned)
- Typing indicator, suggested questions chips

**Physician Review Modal**:
- Full-screen overlay with dark backdrop
- White card centered (max-w-4xl)
- Split view: Patient data (left) | Review form (right)

### Tables
**Biomarker Data Table**:
- Sticky header row
- Alternating row backgrounds (subtle)
- Status badges in colored pills
- Sortable columns with arrow indicators
- Row click expands inline detail view

---

## Marketing/Landing Pages

**Hero Section** (min-h-[85vh]):
- Full-width background: Serene wellness retreat image (sunrise yoga, luxury spa setting)
- Overlay gradient for text readability
- Centered content: Headline + Subheadline + CTA button + Trust indicators
- No floating elements - hero is anchored with background image

**Section Structure** (6-8 sections):
1. Hero with CTA
2. Social Proof: 3-column stats (bookings completed, avg health improvement, client satisfaction)
3. Program Cards: 4 program types in 2x2 grid
4. How It Works: 4-step horizontal timeline with icons
5. Biomarker Science: 2-column split (infographic left, explanation right)
6. Location Showcase: Image gallery with location cards (Chennai, Dubai, Goa, Kerala)
7. Testimonials: 3-column cards with photos, before/after metrics
8. Final CTA: Full-width with background image + booking CTA

**Multi-Column Usage**:
- Programs: 2x2 grid (4 cards) on desktop
- Stats: 3 columns for key metrics
- Features: 3 columns for service highlights
- Locations: 2 columns for destination cards

---

## Images Strategy

**Hero Images**: 
- Marketing landing: Luxury wellness retreat setting (yoga, meditation, spa)
- Dashboard: Abstract health/vitality imagery or data visualization backgrounds

**Throughout Platform**:
- Program cards: High-quality location photos
- Testimonials: Client photos (with permission)
- Physician profiles: Professional headshots
- Protocol sections: Subtle icons (not photos)
- Biomarker results: Charts/graphs only, no decorative images

**No Images Needed**:
- Dashboard data cards (use icons + charts)
- Forms and input areas
- Tables and data displays
- Admin portal operational views

---

## Physician Portal Specifics

**Layout**: Sidebar navigation + main content area
**Color Treatment**: Slightly more clinical (cooler tones)
**Key Views**:
- Patient list: Table with search, filters, status badges
- Patient detail: Tabs for biomarkers, protocols, history, notes
- Calendar: Weekly view for telemedicine appointments
- Review queue: Cards with priority indicators

---

## Admin Dashboard Specifics

**Layout**: Top nav bar + sidebar + main grid
**Focus**: Operational efficiency over aesthetics
**Key Components**:
- KPI cards: 4-column grid (bookings, revenue, capacity, satisfaction)
- Booking calendar: Month view with color-coded status
- Revenue charts: Bar/line charts with date range selector
- User management: Sortable table with bulk actions

---

## Accessibility & Interaction

- All interactive elements: min 44px touch target
- Form validation: Real-time with clear error messages
- Loading states: Skeleton screens for cards, spinner for actions
- Empty states: Helpful illustration + CTA to take action
- Toast notifications: Top-right corner, auto-dismiss in 5 seconds
- Keyboard navigation: Full support with visible focus rings

---

## Responsive Breakpoints

- Mobile: < 768px (single column, stacked layouts)
- Tablet: 768px - 1024px (2-column grids, simplified nav)
- Desktop: > 1024px (full multi-column layouts, sidebar nav)