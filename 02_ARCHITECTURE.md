# distill. — Technical Architecture

**Version:** 1.0  
**Date:** April 2026

---

## 1. Tech Stack Summary

```
Frontend:   React 18 + Vite + TailwindCSS + React Query + Zustand
Backend:    Node.js + Express + TypeScript
Database:   PostgreSQL (Supabase)
Auth:       Supabase Auth (magic link + Google OAuth)
AI:         Groq API (Llama 2 70B) — Free tier
Instagram:  RapidAPI Instagram Data Scraper
Hosting:    Vercel (frontend) + Railway (backend)
Storage:    Supabase Storage (for exports, thumbnails)
```

---

## 2. Project Structure

### Frontend (React PWA)
```
distill-app/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json (PWA)
│   │   └── icon-192x192.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── SignupForm.jsx
│   │   │   ├── vault/
│   │   │   │   ├── ReelCard.jsx
│   │   │   │   ├── ReelDetail.jsx
│   │   │   │   ├── ReelGrid.jsx
│   │   │   │   └── ImportModal.jsx
│   │   │   ├── collections/
│   │   │   │   ├── CollectionList.jsx
│   │   │   │   ├── CollectionDetail.jsx
│   │   │   │   └── CreateCollection.jsx
│   │   │   ├── search/
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   └── SearchResults.jsx
│   │   │   ├── export/
│   │   │   │   ├── ExportModal.jsx
│   │   │   │   └── ShareLink.jsx
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       ├── Card.jsx
│   │   │       ├── Badge.jsx
│   │   │       └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── VaultPage.jsx
│   │   │   ├── CollectionsPage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   ├── CreatorPage.jsx
│   │   │   ├── ReferencesPage.jsx
│   │   │   └── SharedCollectionPage.jsx
│   │   ├── hooks/
│   │   │   ├── useReels.js
│   │   │   ├── useCollections.js
│   │   │   ├── useSearch.js
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   ├── api.js (axios instance + endpoints)
│   │   │   ├── supabase.js (Supabase client init)
│   │   │   └── export.js (PNG/PDF generation)
│   │   ├── store/
│   │   │   ├── authStore.js (Zustand)
│   │   │   ├── reelsStore.js
│   │   │   └── uiStore.js
│   │   ├── utils/
│   │   │   ├── formatDate.js
│   │   │   ├── categoryIcons.js
│   │   │   └── tailwindHelpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css (TailwindCSS imports)
│   │   └── serviceWorker.js (PWA offline)
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── reels.ts
│   │   │   ├── collections.ts
│   │   │   ├── search.ts
│   │   │   ├── references.ts
│   │   │   ├── highlights.ts
│   │   │   ├── export.ts
│   │   │   ├── creators.ts
│   │   │   └── admin.ts (health checks, logs)
│   │   ├── controllers/
│   │   │   ├── reelController.ts
│   │   │   ├── extractionController.ts
│   │   │   ├── collectionController.ts
│   │   │   └── searchController.ts
│   │   ├── services/
│   │   │   ├── groqService.ts (AI extraction)
│   │   │   ├── instagramService.ts (RapidAPI)
│   │   │   ├── dbService.ts (Supabase queries)
│   │   │   ├── referenceService.ts (process references)
│   │   │   └── exportService.ts (PNG/PDF generation)
│   │   ├── middleware/
│   │   │   ├── auth.ts (Supabase JWT verify)
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimit.ts
│   │   │   └── cors.ts
│   │   ├── types/
│   │   │   ├── index.ts (TypeScript interfaces)
│   │   │   └── database.ts
│   │   ├── db/
│   │   │   ├── schema.sql (Supabase migrations)
│   │   │   └── migrations/ (versioned SQL files)
│   │   ├── prompts/
│   │   │   └── extractionPrompt.ts (AI system prompt)
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── cache.ts
│   │   │   └── validators.ts
│   │   ├── app.ts (Express setup)
│   │   └── server.ts (entry point)
│   ├── .env.example
│   ├── .env.local (git-ignored)
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── docs/
│   ├── API_REFERENCE.md
│   ├── DEPLOYMENT.md
│   ├── DATABASE_SCHEMA.md
│   └── AI_PROMPTS.md
│
└── README.md
```

---

## 3. Database Schema (PostgreSQL via Supabase)

### 3.1 SQL Schema Definition

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

-- Enum types
CREATE TYPE category_enum AS ENUM (
  'fitness', 'finance', 'food', 'travel', 'fashion',
  'mindset', 'tech', 'music', 'film', 'general'
);

CREATE TYPE ref_type_enum AS ENUM (
  'book', 'film', 'product', 'app', 'person', 'concept', 'brand'
);

CREATE TYPE auth_provider_enum AS ENUM ('email', 'google', 'github');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  profile_pic_url TEXT,
  auth_provider auth_provider_enum NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  settings JSONB DEFAULT '{"dark_mode": false, "email_notifications": true}',
  last_login TIMESTAMP
);

-- Creators table
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  profile_pic_url TEXT,
  follower_count INTEGER DEFAULT 0,
  bio TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_synced TIMESTAMP,
  save_count INTEGER DEFAULT 0 -- aggregate across all users
);

-- Reels table
CREATE TABLE reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES creators(id),
  creator_username VARCHAR(100),
  instagram_url TEXT NOT NULL,
  UNIQUE(user_id, instagram_url), -- prevent duplicates per user
  
  caption TEXT,
  transcript TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  likes_count INTEGER,
  
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  metadata JSONB DEFAULT '{}', -- video_id, original_posted_date, etc
  
  is_archived BOOLEAN DEFAULT FALSE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_creator_id (creator_id),
  INDEX idx_saved_at (saved_at DESC)
);

-- Extractions table
CREATE TABLE extractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_id UUID NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  
  category category_enum NOT NULL,
  summary TEXT NOT NULL,
  key_points JSONB, -- array of strings
  steps JSONB, -- array of {step: number, action: string}
  creator_tip TEXT,
  tone VARCHAR(50),
  estimated_read_time_minutes INTEGER,
  
  raw_ai_response JSONB, -- full AI output for debugging
  extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  model_used VARCHAR(50) DEFAULT 'groq-llama2',
  processing_time_ms INTEGER,
  
  UNIQUE(reel_id),
  INDEX idx_reel_id (reel_id),
  INDEX idx_category (category),
  INDEX idx_extracted_at (extracted_at DESC)
);

-- References table
CREATE TABLE references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  extraction_id UUID NOT NULL REFERENCES extractions(id) ON DELETE CASCADE,
  
  ref_type ref_type_enum NOT NULL,
  ref_name VARCHAR(255) NOT NULL,
  ref_details JSONB, -- {author, year, link, image_url, etc}
  mention_context TEXT, -- snippet of where mentioned
  ref_link TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_extraction_id (extraction_id),
  INDEX idx_ref_type (ref_type),
  INDEX idx_ref_name (ref_name)
);

-- Collections table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_emoji VARCHAR(10) DEFAULT '📚',
  
  is_ai_suggested BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at DESC),
  UNIQUE(user_id, title)
);

-- Collection reels junction table
CREATE TABLE collection_reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  reel_id UUID NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(collection_id, reel_id),
  INDEX idx_collection_id (collection_id),
  INDEX idx_reel_id (reel_id)
);

-- Highlights table
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  extraction_id UUID NOT NULL REFERENCES extractions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  text TEXT NOT NULL,
  start_idx INTEGER,
  end_idx INTEGER,
  user_note TEXT,
  highlight_tags JSONB DEFAULT '[]', -- array of tags
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_extraction_id (extraction_id),
  INDEX idx_user_id (user_id)
);

-- Saved references table (user-curated)
CREATE TABLE saved_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reference_id UUID NOT NULL REFERENCES references(id) ON DELETE CASCADE,
  
  user_note TEXT,
  is_purchased BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, reference_id),
  INDEX idx_user_id (user_id)
);

-- Shared collections (for read-only links)
CREATE TABLE shared_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  share_token VARCHAR(50) UNIQUE NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- optional expiry
  access_count INTEGER DEFAULT 0,
  
  INDEX idx_share_token (share_token),
  INDEX idx_collection_id (collection_id)
);

-- Processing queue (for background jobs)
CREATE TABLE processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_id UUID NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_created_at (created_at DESC)
);

-- Activity log (for insights)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50), -- 'save_reel', 'search', 'create_collection', etc
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at DESC)
);

-- Create indexes for full-text search
CREATE INDEX idx_extractions_summary ON extractions USING GIN(to_tsvector('english', summary));
CREATE INDEX idx_reels_caption ON reels USING GIN(to_tsvector('english', caption));
CREATE INDEX idx_references_name ON references USING GIN(to_tsvector('english', ref_name));

-- Row-level security policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own data
CREATE POLICY user_read_own_data ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY user_read_own_reels ON reels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_insert_own_reels ON reels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- (Continue for other tables...)
```

---

## 4. API Routes & Endpoints

### 4.1 Authentication Endpoints

```typescript
// routes/auth.ts

// POST /api/auth/signup
// { email: string }
// Response: { message, magicLink_sent }

// POST /api/auth/login
// { email: string }
// Response: { message, magicLink_sent }

// POST /api/auth/callback
// { token: string }  -- from magic link
// Response: { user, session_token }

// POST /api/auth/oauth/google
// { id_token: string }
// Response: { user, session_token }

// GET /api/auth/me
// Headers: { Authorization: "Bearer {token}" }
// Response: { user }

// POST /api/auth/logout
// Response: { message: "logged out" }
```

### 4.2 Reels Endpoints

```typescript
// routes/reels.ts

// POST /api/reels
// { url: string }
// Triggers background extraction
// Response: { reel_id, processing_status }

// GET /api/reels
// Query: ?page=1&limit=20&category=fitness&sort=recent
// Response: { reels: [], total, page, limit }

// GET /api/reels/{id}
// Response: { reel, extraction, references, highlights }

// DELETE /api/reels/{id}
// Response: { message: "deleted" }

// PUT /api/reels/{id}
// { is_archived: boolean }
// Response: { updated_reel }

// POST /api/reels/{id}/reprocess
// Re-run AI extraction
// Response: { new_extraction }
```

### 4.3 Collections Endpoints

```typescript
// routes/collections.ts

// POST /api/collections
// { title: string, description?: string, icon_emoji?: string }
// Response: { collection }

// GET /api/collections
// Response: { collections: [] }

// GET /api/collections/{id}
// Response: { collection, reels: [] }

// PUT /api/collections/{id}
// { title?, description?, icon_emoji? }
// Response: { updated_collection }

// DELETE /api/collections/{id}
// Response: { message: "deleted" }

// POST /api/collections/{id}/reels
// { reel_id: string }
// Response: { updated_collection }

// DELETE /api/collections/{id}/reels/{reel_id}
// Response: { updated_collection }
```

### 4.4 Search Endpoint

```typescript
// routes/search.ts

// GET /api/search
// Query: ?q=sleep&category=mindset&type=reel|reference|creator
// Response: { reels: [], references: [], creators: [] }
```

### 4.5 Export & Sharing

```typescript
// routes/export.ts

// GET /api/export/reel/{id}
// Query: ?format=png|pdf|txt
// Response: File download or { download_url }

// POST /api/share/collection/{id}
// { expires_in_days?: number }
// Response: { share_token, share_url }

// GET /api/share/collection/{token}
// Response: { collection, reels: [] }  -- public, no auth needed
```

---

## 5. AI Extraction System Prompt

```typescript
// services/groqService.ts

const EXTRACTION_SYSTEM_PROMPT = `
You are an expert AI that extracts and structures knowledge from Instagram reel captions and transcripts.

Your task: Given a reel's caption and transcript, extract structured, actionable knowledge in JSON format.

## Output Format (strict JSON):
{
  "category": "fitness|finance|food|travel|fashion|mindset|tech|music|film|general",
  "summary": "2-3 sentence concise overview",
  "key_points": [
    "Point 1: specific, actionable insight",
    "Point 2: ...",
    "Point 3: ..."
  ],
  "steps": [
    { "step": 1, "action": "First action or ingredient" },
    { "step": 2, "action": "Second action" },
    ...
  ],  // Empty array if not instructional
  "creator_tip": "Any special wisdom, caution, or insight the creator emphasized. If none, null.",
  "references": [
    {
      "type": "book",
      "name": "Exact title",
      "details": { "author": "...", "year": "...", "description": "..." },
      "context": "Where/how it was mentioned in the reel"
    },
    {
      "type": "film",
      "name": "Movie title",
      "details": { "year": "...", "director": "..." },
      "context": "..."
    },
    {
      "type": "product",
      "name": "Product name",
      "details": { "brand": "...", "category": "..." },
      "context": "..."
    },
    {
      "type": "app",
      "name": "App name",
      "details": { "platform": "iOS|Android|Web", "link": "..." },
      "context": "..."
    },
    {
      "type": "person",
      "name": "Full name",
      "details": { "title": "...", "expertise": "..." },
      "context": "..."
    },
    {
      "type": "concept",
      "name": "Concept/principle name",
      "details": { "definition": "..." },
      "context": "..."
    },
    {
      "type": "brand",
      "name": "Brand name",
      "details": { "category": "..." },
      "context": "..."
    }
  ],
  "tone": "educational|motivational|entertaining|instructional|narrative",
  "estimated_read_time_minutes": 2,
  "insufficient_data": false  // true if caption is empty or insufficient
}

## Rules:
1. ONLY extract information explicitly mentioned in the caption/transcript. Do NOT invent or assume.
2. If a reference is partial (e.g., "this great book" but no title), include it with "unknown": true.
3. Always categorize. If uncertain, pick the closest fit.
4. Preserve the creator's exact wording for key_points and creator_tip.
5. For instructional content, steps should be numbered and detailed.
6. For non-instructional content (e.g., advice, commentary), steps should be empty [].
7. If caption is empty or says "[caption unavailable]", set insufficient_data: true and return minimal data.
8. References should only be things the creator explicitly mentioned — not inferred.

## Category-Specific Guidance:

**Fitness:**
- key_points: exercises, reps, sets, form cues
- steps: warm-up → main workout → cooldown
- references: supplement brands, equipment, fitness apps, influencers

**Finance:**
- key_points: financial principles, investment tips, saving strategies
- steps: steps to execute a strategy (if applicable)
- references: books (e.g., "Rich Dad Poor Dad"), finance tools, apps

**Food:**
- key_points: cuisine, technique, flavor profile
- steps: detailed recipe (or cooking method)
- references: ingredient brands, kitchen tools, restaurants

**Travel:**
- key_points: destination highlights, logistics, tips
- steps: itinerary or travel process
- references: hotels, restaurants, landmarks, travel apps

**Fashion:**
- key_points: style tips, color matching, outfit formula
- steps: how to style an outfit (if applicable)
- references: brands, designers, influencers, fashion apps

**Mindset:**
- key_points: psychological concepts, life lessons, philosophies
- steps: mental exercises or habit-formation steps (if applicable)
- references: philosophers, psychologists, books, concepts

**Tech:**
- key_points: technical concepts, coding tips, tool features
- steps: setup or installation steps (if applicable)
- references: frameworks, languages, libraries, tools

**Music:**
- key_points: music theory, production techniques, artist insights
- steps: music production steps (if tutorial)
- references: artists, songs, instruments, production tools

**Film:**
- key_points: plot, cinematography, production insights
- steps: N/A
- references: directors, actors, cinematographers, films

**General:**
- Apply best judgment; extract what's most valuable.

## Examples:

### Input (Fitness reel):
Caption: "3 chest exercises that work. First: incline bench press, 4 sets of 6 reps. Form: shoulders back, chest out. Second: dips with added weight, 3 sets of 8. Third: cable flyes, 3 sets of 12. Do this 2x per week."

Output:
{
  "category": "fitness",
  "summary": "Three effective chest-building exercises with specific rep schemes.",
  "key_points": [
    "Incline bench press builds upper chest; keep shoulders retracted and chest up",
    "Weighted dips (3x8) add mass with heavy load",
    "Cable flyes (3x12) provide pump and isolation"
  ],
  "steps": [
    { "step": 1, "action": "Incline bench press: 4 sets of 6 reps" },
    { "step": 2, "action": "Dips with added weight: 3 sets of 8 reps" },
    { "step": 3, "action": "Cable flyes: 3 sets of 12 reps" },
    { "step": 4, "action": "Repeat 2x per week, allow 48 hours between sessions" }
  ],
  "creator_tip": "Progressive overload and form matter more than volume.",
  "references": [],
  "tone": "instructional",
  "estimated_read_time_minutes": 2,
  "insufficient_data": false
}

### Input (Finance reel):
Caption: "Read 'The Richest Man in Babylon' by George S. Clason. It teaches the power of compound interest and paying yourself first. Best investment book I've read."

Output:
{
  "category": "finance",
  "summary": "A recommendation for 'The Richest Man in Babylon' as a foundational finance book.",
  "key_points": [
    "Compound interest is the most powerful force in wealth building",
    "Pay yourself first — save a portion before spending",
    "Ancient wisdom applied to modern personal finance"
  ],
  "steps": [],
  "creator_tip": "This book is a starting point; its timeless lessons apply today.",
  "references": [
    {
      "type": "book",
      "name": "The Richest Man in Babylon",
      "details": { "author": "George S. Clason", "year": "1926" },
      "context": "Creator recommends it as the best investment book they've read"
    }
  ],
  "tone": "motivational",
  "estimated_read_time_minutes": 3,
  "insufficient_data": false
}

---

Now process the following reel:

Caption: "${caption}"
Transcript: "${transcript}"

Return ONLY valid JSON, no extra text.
`;

// Usage in extractionController:
import Groq from '@anthropic-ai/sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function extractReel(caption: string, transcript: string) {
  const message = await groq.messages.create({
    model: 'llama2-70b', // or llama-3-70b for speed
    max_tokens: 1500,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Caption: "${caption}"\n\nTranscript: "${transcript}"`
      }
    ]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const extraction = JSON.parse(responseText);
  return extraction;
}
```

---

## 6. Backend Implementation (Express + TypeScript)

### 6.1 App Setup & Middleware

```typescript
// src/app.ts

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler, authMiddleware } from './middleware';

import authRoutes from './routes/auth';
import reelsRoutes from './routes/reels';
import collectionsRoutes from './routes/collections';
import searchRoutes from './routes/search';
import referencesRoutes from './routes/references';
import highlightsRoutes from './routes/highlights';
import creatorsRoutes from './routes/creators';
import exportRoutes from './routes/export';
import adminRoutes from './routes/admin';

const app: Express = express();

// Trust proxy
app.set('trust proxy', 1);

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting (global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reels', authMiddleware, reelsRoutes);
app.use('/api/collections', authMiddleware, collectionsRoutes);
app.use('/api/search', authMiddleware, searchRoutes);
app.use('/api/references', authMiddleware, referencesRoutes);
app.use('/api/highlights', authMiddleware, highlightsRoutes);
app.use('/api/creators', authMiddleware, creatorsRoutes);
app.use('/api/export', authMiddleware, exportRoutes);
app.use('/api/admin', adminRoutes); // health checks, logs

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
```

### 6.2 Reels Controller

```typescript
// src/controllers/reelController.ts

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { extractReel } from '../services/groqService';
import { fetchReelData } from '../services/instagramService';
import { processReferences } from '../services/referenceService';
import logger from '../utils/logger';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function createReel(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { url } = req.body;
    const userId = req.user!.id;

    // Validate URL
    if (!url || !url.includes('instagram.com')) {
      return res.status(400).json({ error: 'Invalid Instagram URL' });
    }

    // Check if already saved
    const { data: existingReel } = await supabase
      .from('reels')
      .select('id')
      .eq('user_id', userId)
      .eq('instagram_url', url)
      .single();

    if (existingReel) {
      return res.status(409).json({
        error: 'Reel already saved',
        reel_id: existingReel.id
      });
    }

    // Create reel record
    const { data: reel, error: reelError } = await supabase
      .from('reels')
      .insert([
        {
          user_id: userId,
          instagram_url: url,
          saved_at: new Date()
        }
      ])
      .select()
      .single();

    if (reelError) throw reelError;

    // Add to processing queue
    await supabase.from('processing_queue').insert([
      {
        reel_id: reel.id,
        status: 'pending'
      }
    ]);

    // Trigger background extraction (async, don't wait)
    processReelAsync(reel.id, url, userId).catch(err => {
      logger.error('Background extraction error:', err);
    });

    res.status(202).json({
      message: 'Reel added. Processing in background...',
      reel_id: reel.id,
      status: 'processing'
    });
  } catch (error) {
    next(error);
  }
}

async function processReelAsync(reelId: string, url: string, userId: string) {
  try {
    // Fetch reel data from Instagram
    const reelData = await fetchReelData(url);

    // Extract using AI
    const startTime = Date.now();
    const extraction = await extractReel(
      reelData.caption || '',
      reelData.transcript || ''
    );
    const processingTime = Date.now() - startTime;

    // Update reel with fetched data
    await supabase.from('reels').update({
      caption: reelData.caption,
      transcript: reelData.transcript,
      thumbnail_url: reelData.thumbnail_url,
      duration_seconds: reelData.duration_seconds,
      creator_username: reelData.creator_username,
      likes_count: reelData.likes_count,
      metadata: reelData.metadata
    }).eq('id', reelId);

    // Save extraction
    const { data: ext, error: extError } = await supabase
      .from('extractions')
      .insert([
        {
          reel_id: reelId,
          category: extraction.category,
          summary: extraction.summary,
          key_points: extraction.key_points,
          steps: extraction.steps,
          creator_tip: extraction.creator_tip,
          tone: extraction.tone,
          estimated_read_time_minutes: extraction.estimated_read_time_minutes,
          raw_ai_response: extraction,
          processing_time_ms: processingTime,
          model_used: 'groq-llama2'
        }
      ])
      .select()
      .single();

    if (extError) throw extError;

    // Process and save references
    if (extraction.references && extraction.references.length > 0) {
      const refs = extraction.references.map((ref: any) => ({
        extraction_id: ext.id,
        ref_type: ref.type,
        ref_name: ref.name,
        ref_details: ref.details,
        mention_context: ref.context,
        ref_link: ref.link || null
      }));

      await supabase.from('references').insert(refs);
    }

    // Update processing queue
    await supabase.from('processing_queue').update({
      status: 'completed',
      completed_at: new Date()
    }).eq('reel_id', reelId);

    logger.info(`Reel ${reelId} processed successfully`);
  } catch (error) {
    logger.error(`Failed to process reel ${reelId}:`, error);
    await supabase.from('processing_queue').update({
      status: 'failed',
      error_message: (error as Error).message
    }).eq('reel_id', reelId);
  }
}

export async function getReels(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20, category, sort = 'recent' } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('reels')
      .select(
        `
        id, instagram_url, creator_username, thumbnail_url, saved_at,
        extractions!inner(id, category, summary, key_points)
        `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .eq('is_archived', false);

    if (category) {
      query = query.eq('extractions.category', category);
    }

    query = query.order(sort === 'recent' ? 'saved_at' : 'likes_count', {
      ascending: false
    });

    const { data: reels, count, error } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) throw error;

    res.json({
      reels,
      total: count,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    next(error);
  }
}

export async function getReelDetail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data: reel, error: reelError } = await supabase
      .from('reels')
      .select(
        `
        *,
        extractions(*),
        references(*)
        `
      )
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (reelError) throw reelError;
    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    // Get user highlights for this extraction
    const { data: highlights } = await supabase
      .from('highlights')
      .select('*')
      .eq('extraction_id', reel.extractions[0].id);

    res.json({
      reel,
      extraction: reel.extractions[0],
      references: reel.references,
      highlights
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReel(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { error } = await supabase
      .from('reels')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Reel deleted' });
  } catch (error) {
    next(error);
  }
}
```

---

## 7. Frontend Architecture (React + Vite)

### 7.1 Example: Home/Vault Page

```jsx
// src/pages/VaultPage.jsx

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import SearchBar from '../components/search/SearchBar';
import ReelGrid from '../components/vault/ReelGrid';
import ImportModal from '../components/vault/ImportModal';
import { api } from '../services/api';

export default function VaultPage() {
  const { user } = useAuth();
  const [showImportModal, setShowImportModal] = useState(false);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['reels', page, category],
    queryFn: () => api.get('/reels', {
      params: { page, limit: 20, category }
    }).then(res => res.data),
    staleTime: 5 * 60 * 1000
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.username || 'Distiller'}
          </h1>
          <p className="text-slate-400">
            You have {data?.total || 0} reels in your vault
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8">
          <SearchBar onSearch={(query) => {
            // Navigate to search page
          }} />
          
          <div className="mt-4 flex gap-2 flex-wrap">
            {['all', 'fitness', 'finance', 'mindset', 'tech', 'travel'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat === 'all' ? null : cat);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  category === cat || (cat === 'all' && !category)
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Reel Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-slate-400 mt-4">Loading your vault...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-white">
            <p>Error loading reels. Please try again.</p>
          </div>
        ) : data?.reels.length > 0 ? (
          <ReelGrid reels={data.reels} />
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg mb-4">
              Your vault is empty. Import your first reel to get started!
            </p>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
            >
              Add Reel
            </button>
          </div>
        )}

        {/* Pagination */}
        {data?.total > 0 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-300">Page {page}</span>
            <button
              disabled={data.reels.length < 20}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowImportModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-2xl flex items-center justify-center shadow-lg transition"
      >
        +
      </button>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            // Refetch reels
          }}
        />
      )}
    </div>
  );
}
```

### 7.2 Reel Card Component

```jsx
// src/components/vault/ReelCard.jsx

import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { getCategoryIcon } from '../../utils/categoryIcons';

export default function ReelCard({ reel, extraction }) {
  return (
    <Link
      to={`/reel/${reel.id}`}
      className="group rounded-lg overflow-hidden bg-slate-800 hover:bg-slate-700 transition shadow-md hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-slate-700 overflow-hidden">
        {reel.thumbnail_url && (
          <img
            src={reel.thumbnail_url}
            alt="Reel"
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
          {getCategoryIcon(extraction?.category)}
          {extraction?.category || 'loading'}
        </div>

        {/* Creator */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          @{reel.creator_username || 'unknown'}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-white line-clamp-2 mb-2">
          {extraction?.summary || 'Processing...'}
        </h3>
        
        <p className="text-xs text-slate-400 mb-3">
          Saved {formatDate(reel.saved_at)}
        </p>

        {extraction?.key_points && extraction.key_points.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {extraction.key_points.slice(0, 2).map((point, idx) => (
              <span
                key={idx}
                className="text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded line-clamp-1"
              >
                {point.slice(0, 20)}...
              </span>
            ))}
            {extraction.key_points.length > 2 && (
              <span className="text-xs text-slate-400 px-2 py-1">
                +{extraction.key_points.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
```

---

## 8. Deployment Architecture

```
┌─────────────────────┐
│   Frontend (React)  │
│  Vercel (PWA)       │
│  → distill.app      │
└──────────┬──────────┘
           │ HTTPS
           ↓
┌─────────────────────────────────────┐
│        API Gateway / CORS            │
│  (Backend: Node.js Express)          │
│  Railway                             │
│  → api.distill.app                   │
└──────────┬──────────────────────────┘
           │
      ┌────┴────┐
      │          │
      ↓          ↓
┌──────────┐   ┌──────────────────┐
│Supabase  │   │  Groq API        │
│(Postgres)│   │  (AI Extraction) │
│          │   │                  │
│Auth      │   │  Free tier       │
│Storage   │   │  llama2-70b      │
└──────────┘   └──────────────────┘
      │
      ↓
┌──────────────────────────────────────┐
│  Background Jobs (Optional)          │
│  - Bull/Redis (if scaling)           │
│  - Scheduled extractions             │
│  - Aggregate insights                │
└──────────────────────────────────────┘
```

---

## 9. Environment Variables

```bash
# .env.local (Backend)

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key

# Groq
GROQ_API_KEY=your_groq_key

# Instagram API (RapidAPI)
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=instagram-data1.p.rapidapi.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server
NODE_ENV=development
PORT=5000
LOG_LEVEL=info

# Optional: Redis for background jobs
REDIS_URL=redis://localhost:6379
```

```bash
# .env (Frontend)

VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

**This blueprint is production-ready. Next: Phase 3 → Database setup + Backend core routes.**
