# AIWO Healthcation Platform

## Overview
AIWO Healthcation is an enterprise-grade longevity and wellness tourism platform combining AI-powered health optimization, 400+ biomarker analysis, personalized wellness protocols, and luxury retreat bookings across multiple destinations (Chennai, Dubai, Goa, Kerala).

**Target**: ₹100 crore revenue with 75,000+ users by Year 3

## Tech Stack
- **Frontend**: React 18, TypeScript, TailwindCSS, Shadcn/ui, Wouter routing, TanStack Query v5
- **Backend**: Express.js, TypeScript, PostgreSQL (Drizzle ORM)
- **AI**: OpenAI GPT-5 via Replit AI Integrations (no API key needed)
- **Auth**: Replit Auth (Google/GitHub/Apple/email login via OIDC)
- **Real-time**: Socket.IO WebSocket server
- **Enterprise**: Pino logging, Helmet security, Rate limiting, HIPAA audit trails
- **Styling**: Emerald/teal color scheme, Inter + Crimson Pro fonts

## Project Architecture

### Directory Structure
```
client/
├── src/
│   ├── components/
│   │   ├── dashboard/        # Health score, metrics, charts
│   │   ├── layout/           # AppSidebar navigation
│   │   ├── NotificationCenter.tsx  # Real-time notifications
│   │   └── ui/               # Shadcn components
│   ├── hooks/
│   │   └── useAuth.ts        # Authentication hook
│   ├── pages/
│   │   ├── Landing.tsx       # Marketing landing page
│   │   ├── Dashboard.tsx     # Health overview dashboard
│   │   ├── Biomarkers.tsx    # 400+ biomarker analysis
│   │   ├── Protocols.tsx     # AI-generated health protocols
│   │   ├── Booking.tsx       # Multi-step retreat booking wizard
│   │   ├── Telemedicine.tsx  # Virtual consultations
│   │   ├── WearableAnalytics.tsx # Wearable data analysis
│   │   ├── Community.tsx     # Community platform (forums, groups, badges)
│   │   ├── Chat.tsx          # Ask Siva - AI Longevity Mentor chatbot
│   │   ├── Profile.tsx       # User settings & wearables
│   │   ├── PhysicianDashboard.tsx # Physician portal
│   │   └── AdminDashboard.tsx    # Admin portal with enterprise monitoring
│   └── lib/
│       └── queryClient.ts    # API request handling
server/
├── db.ts                     # Neon PostgreSQL connection
├── storage.ts                # Database storage operations
├── routes.ts                 # API endpoints
├── replitAuth.ts             # OIDC authentication
├── openai.ts                 # GPT-5 AI integration
├── stripe.ts                 # Payment processing
├── middleware/
│   └── security.ts           # Rate limiting, Helmet, CORS, Compression
└── services/
    ├── notifications.ts      # Email/SMS/Push notification service
    ├── audit.ts              # HIPAA-compliant audit logging
    ├── search.ts             # Full-text search indexing
    ├── analytics.ts          # Event tracking and analytics
    ├── monitoring.ts         # Health checks and metrics
    ├── websocket.ts          # Real-time WebSocket service
    ├── wearables.ts          # Wearable device sync
    ├── crm.ts                # HubSpot/Salesforce CRM sync
    ├── lab-integration.ts    # HL7/FHIR lab data import
    └── video-rooms.ts        # WebRTC video consultation rooms
shared/
└── schema.ts                 # Drizzle schema & TypeScript types
```

### Database Schema (37+ tables)
**Core:**
- **users**: Auth profile (id, email, firstName, lastName, profileImageUrl, role)
- **sessions**: OIDC session storage
- **profiles**: Extended health info (height, weight, allergies, medications)

**Health:**
- **biomarkerTests**: Test results with 400+ markers, calculated metrics
- **protocols**: AI-generated health protocols (supplements, nutrition, exercise, sleep)
- **complianceLogs**: Protocol adherence tracking
- **wearableConnections**: Oura, WHOOP, Apple Health, Fitbit, Garmin integrations
- **wearableData**: Time-series wearable metrics (heart rate, HRV, sleep, steps)

**Booking & Payments:**
- **bookings**: Retreat reservations with multi-step wizard data
- **payments**: Payment tracking for bookings

**Telemedicine:**
- **appointments**: Video consultation scheduling
- **clinicalNotes**: Physician notes on patient interactions
- **prescriptions**: Digital prescriptions with e-signature
- **consultationRooms**: WebRTC room management
- **videoConsultationRooms**: Enterprise video room management

**Community Platform:**
- **forumCategories**: Discussion categories (10 default: Wellness, Nutrition, Fitness, etc.)
- **forumPosts**: User posts with view/like/comment counts
- **postComments**: Threaded comments on posts
- **postLikes**: Track user likes on posts/comments
- **supportGroups**: Peer support groups (goal-based, condition-specific, alumni)
- **groupMemberships**: User group memberships
- **successStories**: User transformation stories
- **achievementBadges**: Gamification badges (common, rare, epic, legendary)
- **userAchievements**: User-earned badges
- **userCommunityStats**: Points, level, streak tracking for leaderboard

**Enterprise:**
- **notifications**: In-app notification storage
- **notificationPreferences**: User notification settings
- **auditLogs**: HIPAA-compliant activity tracking
- **userConsents**: GDPR consent management
- **searchIndex**: Full-text search index
- **analyticsEvents**: Event tracking
- **systemMetrics**: Performance monitoring
- **rateLimitLog**: Rate limit violations
- **crmSyncHistory**: CRM sync audit trail
- **labImports**: Lab data import history
- **mediaAssets**: File uploads and CDN management
- **contentItems**: CMS content management

**Other:**
- **chatMessages**: Ask Siva conversation history (AI Longevity Mentor)

### API Endpoints

**Auth & Profile:**
- `GET /api/auth/user` - Current authenticated user
- `GET/PATCH /api/profile` - User health profile

**Health:**
- `GET/POST /api/biomarkers` - Biomarker tests
- `GET /api/biomarkers/latest` - Latest test results
- `POST /api/biomarkers/:id/analyze` - AI biomarker analysis
- `GET/POST /api/protocols` - Health protocols
- `GET /api/protocols/active` - Current active protocol
- `POST /api/protocols/generate` - Generate AI protocol
- `GET/POST /api/wearables/connections` - Wearable devices
- `GET/POST /api/compliance` - Protocol compliance

**Booking:**
- `GET/POST/PATCH /api/bookings` - Retreat bookings

**Telemedicine:**
- `GET/POST /api/appointments` - Schedule consultations
- `GET/POST /api/clinical-notes` - Physician notes
- `GET/POST /api/prescriptions` - Digital prescriptions

**Community Platform:**
- `GET/POST /api/community/categories` - Forum categories
- `GET/POST /api/community/posts` - Forum posts
- `POST /api/community/posts/:id/like` - Toggle post like
- `GET/POST /api/community/posts/:postId/comments` - Post comments
- `GET/POST /api/community/groups` - Support groups
- `POST /api/community/groups/:id/join` - Join group
- `GET/POST /api/community/stories` - Success stories
- `GET /api/community/badges` - Achievement badges
- `GET /api/community/my-achievements` - User's badges
- `GET /api/community/my-stats` - User community stats
- `GET /api/community/leaderboard` - Top contributors

**AI:**
- `GET/POST /api/chat` - Ask Siva (AI Longevity Mentor)

**Enterprise Endpoints:**

*Notifications:*
- `GET /api/notifications` - User notifications
- `GET /api/notifications/unread-count` - Unread count
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `GET/PATCH /api/notification-preferences` - Notification settings

*Search:*
- `GET /api/search?q=query&types=...` - Full-text search
- `POST /api/search/reindex` - Rebuild search index (admin)

*Audit & Compliance:*
- `GET /api/audit-logs` - Activity audit trail (admin)
- `GET /api/audit-logs/phi` - PHI access logs (admin)
- `GET /api/audit-logs/summary` - Audit summary (admin)
- `GET/POST /api/consents` - User consent management
- `DELETE /api/consents/:type` - Revoke consent

*Analytics:*
- `GET /api/analytics/dashboard` - Analytics overview (admin)
- `GET /api/analytics/page-stats` - Page view stats (admin)
- `GET /api/analytics/funnel` - Conversion funnel (admin)
- `POST /api/analytics/track` - Track events

*Monitoring:*
- `GET /api/health` - System health status
- `GET /api/metrics` - Performance metrics (admin)
- `GET /api/websocket/status` - WebSocket status

*Wearables Enhanced:*
- `POST /api/wearables/sync/:connectionId` - Sync device
- `GET /api/wearables/timeseries` - Time-series data
- `GET /api/wearables/latest` - Latest metrics
- `POST /api/wearables/anomaly-check` - Anomaly detection

*CRM Integration (HubSpot + Zoho):*
- `GET /api/crm/status?provider=hubspot|zoho` - CRM sync status (admin)
- `GET /api/crm/providers` - List configured CRM providers (admin)
- `POST /api/crm/sync/user/:userId` - Sync user to CRM (body: {provider}) (admin)
- `POST /api/crm/sync/booking/:bookingId` - Sync booking to CRM (body: {provider}) (admin)
- `GET /api/crm/history?provider=hubspot|zoho` - CRM sync history (admin)

*Lab Integration:*
- `POST /api/lab/import` - Import lab data (HL7/FHIR/JSON)
- `GET /api/lab/imports` - Import history
- `GET /api/lab/imports/:id` - Import details

*Video Consultations:*
- `POST /api/video-rooms` - Create video room
- `POST /api/video-rooms/:roomId/join` - Join room
- `POST /api/video-rooms/:roomId/end` - End room
- `GET /api/video-rooms/appointment/:appointmentId` - Room by appointment
- `GET /api/video-rooms/stats` - Video stats (admin)

## Enterprise Services

### Notifications Service
Multi-channel notification delivery:
- **Email**: Nodemailer integration with HTML templates
- **SMS**: Twilio integration ready
- **Push**: Web push notifications ready
- **In-App**: Real-time via WebSocket

### Audit Service
HIPAA-compliant audit logging:
- All data access logged with user, resource, action
- PHI access tracking
- Consent management for GDPR compliance
- Audit trail retention policies

### Monitoring Service
System observability:
- Structured logging with Pino
- Health check endpoints
- Performance metrics collection
- Request latency tracking

### WebSocket Service
Real-time features:
- User presence detection
- Room-based subscriptions
- Broadcast notifications
- Connection management

### Security Middleware
Enterprise security:
- Rate limiting (tiered by endpoint type)
- Helmet security headers
- CORS configuration
- Request compression

## Design System
- **Primary Color**: Emerald/teal (HSL 168, 76%, 36%)
- **Typography**: Inter for UI, Crimson Pro for luxury headlines
- **Components**: Shadcn/ui with hover-elevate interactions
- **Dark Mode**: Full dark/light theme support

## Key Features
1. **Health Score Dashboard**: Biological age, health score gauge, biomarker trends
2. **400+ Biomarkers**: Comprehensive test visualization with status filtering
3. **AI Protocols**: GPT-5 generated supplements, nutrition, exercise, sleep plans
4. **Booking Wizard**: 6-step luxury retreat reservation flow
5. **Ask Siva AI Mentor**: Personalized AI longevity mentor combining Ayurveda + modern science
6. **Wearable Integration**: Oura, WHOOP, Apple Health, Fitbit, Garmin, CGM
7. **Telemedicine**: Virtual consultations with clinical notes and prescriptions
8. **Wearable Analytics**: Heart rate, HRV, steps, glucose, sleep analysis with anomaly detection
9. **Community Platform**: Forums, support groups, success stories, achievement badges, leaderboard
10. **Admin Dashboard**: System health monitoring, analytics, audit logs
11. **Real-time Notifications**: Multi-channel notification system
12. **Enterprise Security**: Rate limiting, HIPAA audit trails, GDPR compliance

## Running the Project
```bash
npm run dev           # Start development server (port 5000)
npm run db:push       # Push schema changes to database
```

## Environment Variables
Required secrets (set in Replit Secrets):
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `SESSION_SECRET` - Session encryption key
- `STRIPE_SECRET_KEY` - Stripe payments (optional)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhooks (optional)
- `SENDGRID_API_KEY` - Email delivery (optional)
- `TWILIO_ACCOUNT_SID` - SMS delivery (optional)
- `HUBSPOT_API_KEY` - HubSpot CRM integration (optional)
- `ZOHO_ACCESS_TOKEN` - Zoho CRM access token (optional)
- `ZOHO_REFRESH_TOKEN` - Zoho CRM refresh token (optional)
- `ZOHO_CLIENT_ID` - Zoho CRM OAuth client ID (optional)
- `ZOHO_CLIENT_SECRET` - Zoho CRM OAuth client secret (optional)

## Recent Changes
- November 2024: Initial platform build with full frontend and backend
- Phase 1: Core platform with health dashboard, biomarkers, protocols, booking wizard
- Phase 2 Telemedicine: Video consultations, clinical notes, digital prescriptions
- Phase 2 Wearable Analytics: Multi-device data visualization with anomaly detection
- Phase 2 Community Platform: Forums with categories, support groups, success stories, gamification badges, leaderboard
- Phase 3 Enterprise: Complete enterprise infrastructure sprint
  - Real-time WebSocket server (Socket.IO)
  - Notification service (email/SMS/push templates)
  - HIPAA-compliant audit logging
  - Full-text search indexing
  - Analytics and event tracking
  - System health monitoring (Pino)
  - Rate limiting middleware
  - CRM integration (HubSpot + Zoho)
  - Lab integration (HL7/FHIR)
  - Video consultation rooms (WebRTC)
  - Admin dashboard with enterprise monitoring
