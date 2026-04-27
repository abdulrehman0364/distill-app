# distill. — Product Specification

**Tagline:** Your reels, turned into knowledge.

**Version:** 1.0  
**Last Updated:** April 2026

---

## 1. Core Purpose

distill. is an AI-powered intelligence app that transforms short-form video content (Instagram Reels) into structured, searchable, actionable knowledge. Users save reels. The app extracts key information, categorizes content, pulls references, and organizes everything into a personal knowledge vault with zero limits.

**Problem it solves:**
- Reels are ephemeral and hard to organize
- You forget the exact title of a book mentioned in a fitness reel
- You can't search what you've watched — it's lost to the feed
- Similar apps (Simmr) restrict you with credits and focus on one category (cooking)

**Solution:**
- One-tap reel save via paste or share
- AI extracts structured knowledge in 10+ categories
- Full-text search, smart collections, and export
- Completely free, unlimited extractions

---

## 2. User Types & Personas

### 2.1 Primary Users
1. **Lifelong Learners** — Save finance, productivity, and mindset reels. Want to reference later.
2. **Content Creators** — Collect inspiration, trends, and reference material across fashion, fitness, music.
3. **Career Professionals** — Extract tech tips, business strategies, and industry insights quickly.
4. **Fitness & Health Enthusiasts** — Save workout routines, nutrition tips, and wellness advice.

### 2.2 Secondary Users
- Parents (educational content for kids)
- Students (learning reels: languages, coding, history)
- Hobbyists (DIY, music production, art)

---

## 3. Feature List

### Core Features (MVP)
1. **Reel Import & Processing**
   - Accept Instagram reel URL via paste or share-sheet
   - Fetch caption + transcript using Instagram API
   - Background processing with UI feedback
   - Notification when extraction complete

2. **AI Extraction & Categorization**
   - Auto-detect reel type (fitness, finance, food, travel, fashion, mindset, tech, music, film, general)
   - Apply category-specific extraction template
   - Return structured JSON: summary, key_points[], steps[], references[], creator_tip, category

3. **Reference Extraction**
   - Extract all mentioned books, films, products, apps, people, concepts
   - Attach labels and icons per reference type
   - Make each reference tappable → details view or external search

4. **Vault Storage & Search**
   - Save all extractions to personal vault
   - Full-text search across notes, summaries, creator names
   - Filter by category, date saved, creator

5. **Collections Management**
   - User-created folders
   - AI-suggested collections (e.g., "Fitness tips this week")
   - Drag-to-organize
   - Rename, merge, delete

6. **User Highlights & Annotations**
   - Highlight specific lines in extracted notes
   - Add personal notes/reactions
   - Tag highlights with custom labels

### Added Features (Differentiators)
7. **Creator Tracking**
   - See which creators user saves most
   - Browse all reels from one creator
   - Follow creators (notification when they're mentioned)

8. **References Hub**
   - Centralized view of all books, films, products across vault
   - Count how many reels mention each reference
   - Link to search/purchase

9. **Export & Sharing**
   - Export reel notes as PNG card, PDF doc, or plain text
   - Share collections via unique link (no login needed)
   - Shareable public profile (opt-in)

10. **Advanced Search & Insights**
    - Search by reference (find all reels mentioning "Atomic Habits")
    - Insights dashboard (most saved categories, top creators, read time stats)
    - Related reels suggestion (similar topics/creators)

11. **Offline Mode**
    - Saved reels available offline
    - Sync when connection returns

12. **API for Power Users**
    - Bulk import reels (CSV of URLs)
    - Export vault data (JSON)
    - Webhook notifications

---

## 4. User Flows

### 4.1 Primary Flow: Save a Reel
```
User scrolling Instagram 
  → Sees interesting reel 
  → Taps share → distill. 
  → App backgrounded 
  → "Processing..." notification 
  → 3-5 seconds (via Groq API) 
  → Notification "Ready to view" 
  → User taps → Extraction view 
  → Sees summary, key points, references, creator info
  → Can highlight, annotate, add to collection
```

### 4.2 Secondary Flow: Search Vault
```
User wants to find "that reel about sleep optimization"
  → Opens app 
  → Types in search bar 
  → Full-text search returns: reels mentioning "sleep", "optimize", "rest"
  → Filters by "Mindset" category 
  → Browses results 
  → Opens reel detail 
  → Reads notes, references, personal highlights
```

### 4.3 Tertiary Flow: Organize Collections
```
User has 47 fitness reels scattered
  → Opens Collections tab
  → AI suggests "Upper body workouts from Jan" 
  → User accepts and renames to "Chest day routines"
  → Adds 5 manual reels to it
  → Shares collection with friend via link
  → Friend can view, search, but not edit
```

---

## 5. Data Models

### 5.1 Entity Relationship Diagram

```
users
├── id (PK)
├── email (unique)
├── username (unique)
├── created_at
├── auth_provider (google, email_magic_link)
├── profile_pic_url
└── settings (JSON: dark_mode, email_notifications, etc)

reels
├── id (PK)
├── user_id (FK)
├── instagram_url (unique per user)
├── creator_id (FK to creators)
├── creator_username
├── caption (raw)
├── transcript (if available)
├── thumbnail_url
├── duration_seconds
├── likes_count
├── saved_at
└── metadata (JSON: video_id, original_posted_date)

extractions
├── id (PK)
├── reel_id (FK)
├── category (enum: fitness, finance, food, travel, fashion, mindset, tech, music, film, general)
├── summary (text)
├── key_points (JSON array)
├── steps (JSON array, if applicable)
├── creator_tip (text)
├── raw_ai_response (JSON)
├── extracted_at
├── model_used (groq-llama2 | ollama-neural-chat, etc)
└── processing_time_ms

references
├── id (PK)
├── extraction_id (FK)
├── ref_type (enum: book, film, product, app, person, concept, brand)
├── ref_name
├── ref_details (JSON: author, year, link, image_url, etc)
├── mention_context (text snippet where mentioned)
└── ref_link (external search URL)

collections
├── id (PK)
├── user_id (FK)
├── title
├── description
├── is_ai_suggested (boolean)
├── icon_emoji
├── created_at
├── updated_at
└── is_public (boolean)

collection_reels
├── id (PK)
├── collection_id (FK)
├── reel_id (FK)
├── added_at
└── position (for ordering)

highlights
├── id (PK)
├── extraction_id (FK)
├── user_id (FK)
├── text (highlighted snippet)
├── start_idx (character offset)
├── end_idx
├── user_note (text)
├── highlight_tags (JSON array: ["important", "actionable", "reread"])
└── created_at

creators
├── id (PK)
├── username (unique)
├── display_name
├── profile_pic_url
├── follower_count
├── bio
├── verified (boolean)
├── last_synced
└── save_count (aggregate)

saved_references
├── id (PK)
├── user_id (FK)
├── reference_id (FK)
├── added_at
├── user_note
└── is_purchased (if applicable)
```

---

## 6. API Endpoints

### Authentication
- `POST /auth/signup` — Email magic link or Google OAuth
- `POST /auth/login` — Magic link
- `POST /auth/logout`
- `GET /auth/me` — Current user profile

### Reels
- `POST /api/reels` — Submit new reel URL
- `GET /api/reels` — Get user's reels (paginated, filtered by category)
- `GET /api/reels/{id}` — Get single reel with extraction
- `DELETE /api/reels/{id}` — Delete saved reel
- `PUT /api/reels/{id}` — Update reel (e.g., move to collection)

### Extractions
- `GET /api/extractions/{reel_id}` — Get extraction for a reel
- `POST /api/extractions/reprocess` — Re-run AI extraction on a reel

### Collections
- `POST /api/collections` — Create new collection
- `GET /api/collections` — Get all user collections
- `PUT /api/collections/{id}` — Update collection
- `DELETE /api/collections/{id}` — Delete collection
- `POST /api/collections/{id}/reels` — Add reel to collection
- `DELETE /api/collections/{id}/reels/{reel_id}` — Remove reel from collection

### Search
- `GET /api/search?q=query&category=fitness` — Full-text search

### References
- `GET /api/references` — All extracted references (books, films, etc)
- `GET /api/references?type=book` — Filter by type

### Highlights
- `POST /api/highlights` — Create highlight on extraction
- `GET /api/highlights` — Get all user highlights
- `PUT /api/highlights/{id}` — Update highlight
- `DELETE /api/highlights/{id}`

### Export & Sharing
- `GET /api/export/reel/{id}` — Export reel as PNG/PDF/TXT
- `POST /api/share/collection/{id}` — Generate shareable link
- `GET /api/share/collection/{token}` — View shared collection

### Creators
- `GET /api/creators/{username}` — Get creator profile + all user's reels from them
- `GET /api/creators/trending` — Most-saved creators

### Insights
- `GET /api/insights` — User dashboard stats (categories, time trends, top creators)

---

## 7. AI Extraction Logic

### 7.1 System Prompt for Groq/Ollama
```
You are an AI that extracts structured knowledge from Instagram reel captions and transcripts.

Input: caption + transcript of an Instagram reel
Output: JSON with these fields (always):
{
  "category": "fitness|finance|food|travel|fashion|mindset|tech|music|film|general",
  "summary": "2-3 sentence overview of the reel's main idea",
  "key_points": ["point 1", "point 2", ...],  // 3-5 bullets
  "steps": [{"step": 1, "action": "..."}, ...],  // if instructional, else empty
  "creator_tip": "Any special wisdom, warning, or insight the creator emphasized",
  "references": [
    {"type": "book", "name": "...", "author": "...", "context": "where it was mentioned"},
    {"type": "film", "name": "...", "year": "...", "context": "..."},
    {"type": "product", "name": "...", "context": "..."},
    ...
  ],
  "tone": "educational|motivational|entertaining|instructional|narrative",
  "estimated_read_time_minutes": 2
}

Rules:
1. Be concise and extract ONLY what's explicitly mentioned — do not invent details
2. If a reference is mentioned but incomplete (e.g., "this book" without title), note it as uncertain
3. Always categorize, even if you're not 100% sure — pick the closest fit
4. If caption is empty or private, return "insufficient_data": true
5. Preserve the creator's exact phrasing where possible
```

### 7.2 Category-Specific Templates

**Fitness:**
- key_points: exercises, reps, form tips
- steps: warm-up, main workout, cooldown
- references: supplements, equipment brands, apps

**Finance:**
- key_points: financial principles, saving tips, investment advice
- steps: investment strategy steps (if applicable)
- references: books, tools, financial products

**Food:**
- key_points: ingredients, cooking techniques
- steps: detailed recipe steps
- references: ingredient brands, kitchen tools

**Mindset:**
- key_points: psychological concepts, life lessons
- steps: (often N/A)
- references: philosophers, scientists, books, concepts

**Tech:**
- key_points: tech concepts, tools, coding patterns
- steps: setup/installation steps
- references: frameworks, languages, tools, tutorials

**Travel:**
- key_points: destinations, tips, logistics
- steps: itinerary or travel process
- references: hotels, restaurants, landmarks

**Music:**
- key_points: music theory, production techniques, artist insights
- steps: production steps (if tutorial)
- references: artists, songs, tools, samples

**Film/Entertainment:**
- key_points: plot insights, production details, cinematography
- steps: (N/A)
- references: movies, directors, actors, cinematographers

**Fashion:**
- key_points: style tips, color coordination, outfit advice
- steps: how to style
- references: brands, designers, influencers

**General:**
- Flexible — extract whatever is most relevant

---

## 8. Edge Cases & Constraints

### 8.1 Edge Cases
1. **Private or Deleted Reel** — API returns 404 → show user "Reel unavailable"
2. **Non-English Reel** — Groq can handle 100+ languages; backend returns language code; frontend shows warning
3. **Reel with Only Video (No Caption)** — Try transcript via Instagram API; if both empty, return insufficient_data
4. **Very Long Reel (multi-segment, carousel)** — Fetch all parts, concatenate, extract as one
5. **Spam/Misleading Reel** — No special handling at MVP; user can flag for deletion
6. **User Saves Duplicate URL** — Backend checks, returns existing extraction if <1 week old, else re-processes

### 8.2 Constraints
- Instagram API rate limit: 6,000 calls/hour (plan for it)
- Groq free tier: 30 requests/min (sufficient for typical user load)
- Extraction time: should be <5 seconds end-to-end
- Vault size: start unlimited; add soft cap at 50k reels/user if scaling issues arise
- Session timeout: 30 days

---

## 9. Build Order (MVP → Full Feature)

### Phase A: MVP (2 weeks)
1. Auth (email magic link via Supabase)
2. Reel import (URL paste only, no share-sheet yet)
3. AI extraction (Groq API + basic extraction)
4. Vault storage (Supabase + basic reel list UI)
5. Search (full-text on notes + creator)
6. Deploy (Vercel + Railway)

### Phase B: Core Features (1 week)
7. Collections (create, add reels, rename, delete)
8. References extraction (pull books/films, display as chips)
9. Highlights & notes (user can annotate extractions)
10. Export (simple PNG card export)

### Phase C: Polish & Sharing (1 week)
11. Share collection (public links, read-only view)
12. Creator tracking (show top creators)
13. UI polish (dark mode, mobile responsiveness, animations)
14. Offline mode (service worker caching)

### Phase D: Advanced (Next iteration)
15. Bulk import (CSV of URLs)
16. References hub (centralized book/film view)
17. Insights dashboard
18. Share profile

---

## 10. Success Metrics

- **Activation:** 50% of sign-ups save ≥1 reel in first session
- **Retention:** 30% of users active 30 days later
- **Core Engagement:** Average 5 reels saved per active user per week
- **Search Usage:** 40% of users search vault ≥2x per week
- **Collection Adoption:** 30% of users create custom collections

---

## 11. Technical Stack (Recommended)

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React 18 + Vite | Fast, modern, great DX |
| Styling | TailwindCSS | Utility-first, fast iteration |
| State | React Query + Zustand | Data + UI state separation |
| Backend | Node.js + Express | JavaScript full-stack, vast ecosystem |
| Database | Supabase (Postgres) | Free tier, auth built-in, real-time |
| Auth | Supabase Auth | Magic links + OAuth, no extra service |
| AI | Groq API | Free tier generous, <100ms latency |
| Instagram Data | RapidAPI Instagram Scraper | Free tier for basic data |
| Hosting | Vercel (frontend) + Railway (backend) | Free tier, easy deploys |
| Storage | Supabase Storage | Free, tied to DB |

---

## 12. Not Included (Out of Scope for MVP)

- Mobile app (PWA works on mobile, but no native optimization yet)
- Payments/premium tier
- Community/social feed
- Collaborations on collections
- Video playback in-app (links out to Instagram)
- Voice notes on highlights
- Email digest
- ML-based recommendations
- Integration with other platforms (TikTok, YouTube Shorts, Twitch clips)

---

**Document Version:** 1.0  
**Created:** April 26, 2026  
**Ready for:** Phase 2 Technical Blueprint
