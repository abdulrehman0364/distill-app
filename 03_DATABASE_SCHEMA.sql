-- distill. Database Schema
-- PostgreSQL + Supabase
-- Copy & paste into Supabase SQL Editor and execute

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums
CREATE TYPE category_enum AS ENUM (
  'fitness', 'finance', 'food', 'travel', 'fashion',
  'mindset', 'tech', 'music', 'film', 'general'
);

CREATE TYPE ref_type_enum AS ENUM (
  'book', 'film', 'product', 'app', 'person', 'concept', 'brand'
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  profile_pic_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Creators
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  profile_pic_url TEXT,
  follower_count INTEGER DEFAULT 0,
  bio TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_synced TIMESTAMP
);

-- Reels
CREATE TABLE IF NOT EXISTS reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES creators(id),
  creator_username VARCHAR(100),
  instagram_url TEXT NOT NULL,
  
  caption TEXT,
  transcript TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  likes_count INTEGER DEFAULT 0,
  
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(user_id, instagram_url)
);

CREATE INDEX idx_reels_user_id ON reels(user_id);
CREATE INDEX idx_reels_creator_id ON reels(creator_id);
CREATE INDEX idx_reels_saved_at ON reels(saved_at DESC);

-- Extractions
CREATE TABLE IF NOT EXISTS extractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_id UUID NOT NULL UNIQUE REFERENCES reels(id) ON DELETE CASCADE,
  
  category category_enum NOT NULL,
  summary TEXT NOT NULL,
  key_points JSONB,
  steps JSONB,
  creator_tip TEXT,
  tone VARCHAR(50),
  estimated_read_time_minutes INTEGER,
  
  raw_ai_response JSONB,
  extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  model_used VARCHAR(50) DEFAULT 'groq-llama2',
  processing_time_ms INTEGER
);

CREATE INDEX idx_extractions_reel_id ON extractions(reel_id);
CREATE INDEX idx_extractions_category ON extractions(category);
CREATE INDEX idx_extractions_extracted_at ON extractions(extracted_at DESC);
CREATE INDEX idx_extractions_summary ON extractions USING GIN(to_tsvector('english', summary));

-- References
CREATE TABLE IF NOT EXISTS "references" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  extraction_id UUID NOT NULL REFERENCES extractions(id) ON DELETE CASCADE,
  
  ref_type ref_type_enum NOT NULL,
  ref_name VARCHAR(255) NOT NULL,
  ref_details JSONB,
  mention_context TEXT,
  ref_link TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_references_extraction_id ON "references"(extraction_id);
CREATE INDEX idx_references_ref_type ON "references"(ref_type);
CREATE INDEX idx_references_ref_name ON "references"(ref_name);

-- Collections
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_emoji VARCHAR(10) DEFAULT '📚',
  is_ai_suggested BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, title)
);

CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_created_at ON collections(created_at DESC);

-- Collection Reels
CREATE TABLE IF NOT EXISTS collection_reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  reel_id UUID NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(collection_id, reel_id)
);

CREATE INDEX idx_collection_reels_collection_id ON collection_reels(collection_id);
CREATE INDEX idx_collection_reels_reel_id ON collection_reels(reel_id);

-- Highlights
CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  extraction_id UUID NOT NULL REFERENCES extractions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  text TEXT NOT NULL,
  start_idx INTEGER,
  end_idx INTEGER,
  user_note TEXT,
  highlight_tags JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_highlights_extraction_id ON highlights(extraction_id);
CREATE INDEX idx_highlights_user_id ON highlights(user_id);

-- Saved References
CREATE TABLE IF NOT EXISTS saved_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reference_id UUID NOT NULL REFERENCES "references"(id) ON DELETE CASCADE,
  
  user_note TEXT,
  is_purchased BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, reference_id)
);

CREATE INDEX idx_saved_references_user_id ON saved_references(user_id);

-- Shared Collections
CREATE TABLE IF NOT EXISTS shared_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  share_token VARCHAR(50) UNIQUE NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  access_count INTEGER DEFAULT 0
);

CREATE INDEX idx_shared_collections_share_token ON shared_collections(share_token);

-- Processing Queue
CREATE TABLE IF NOT EXISTS processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_id UUID NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_processing_queue_status ON processing_queue(status);
CREATE INDEX idx_processing_queue_created_at ON processing_queue(created_at DESC);

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_action ON activity_log(action);

-- Row-Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own reels" ON reels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reels" ON reels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reels" ON reels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reels" ON reels
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view extractions of own reels" ON extractions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reels WHERE reels.id = extractions.reel_id AND reels.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own collections" ON collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON collections
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own highlights" ON highlights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own highlights" ON highlights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Done
\c
SELECT 'distill. Database Schema Successfully Created!' as status;
