// src/services/dbService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Failed to fetch user:', error);
    throw error;
  }
}

export async function createReel(
  userId: string,
  instagramUrl: string,
  reelData: any
) {
  try {
    const { data, error } = await supabase
      .from('reels')
      .insert([
        {
          user_id: userId,
          instagram_url: instagramUrl,
          caption: reelData.caption,
          transcript: reelData.transcript,
          thumbnail_url: reelData.thumbnail_url,
          duration_seconds: reelData.duration_seconds,
          creator_username: reelData.creator_username,
          likes_count: reelData.likes_count,
          metadata: reelData.metadata,
          saved_at: new Date()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Failed to create reel:', error);
    throw error;
  }
}

export async function saveExtraction(reelId: string, extraction: any) {
  try {
    const { data, error } = await supabase
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
          extracted_at: new Date(),
          model_used: 'groq-llama2',
          processing_time_ms: extraction.processingTime || 0
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Failed to save extraction:', error);
    throw error;
  }
}

export async function saveReferences(extractionId: string, references: any[]) {
  try {
    if (!references || references.length === 0) {
      return [];
    }

    const refsToInsert = references.map((ref) => ({
      extraction_id: extractionId,
      ref_type: ref.type,
      ref_name: ref.name,
      ref_details: ref.details || {},
      mention_context: ref.context,
      ref_link: ref.link || null
    }));

    const { data, error } = await supabase
      .from('references')
      .insert(refsToInsert)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Failed to save references:', error);
    throw error;
  }
}

export async function getReelWithExtraction(reelId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('reels')
      .select(
        `
        *,
        extractions(*),
        references(*),
        highlights(*)
        `
      )
      .eq('id', reelId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Failed to fetch reel with extraction:', error);
    throw error;
  }
}

export async function getUserReels(
  userId: string,
  page: number = 1,
  limit: number = 20,
  category?: string
) {
  try {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('reels')
      .select(
        `
        id, instagram_url, creator_username, thumbnail_url, saved_at, likes_count,
        extractions(id, category, summary, key_points, tone)
        `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .eq('is_archived', false);

    if (category) {
      query = query.eq('extractions.category', category);
    }

    query = query.order('saved_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      reels: data || [],
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    logger.error('Failed to fetch user reels:', error);
    throw error;
  }
}

export async function searchUserReels(userId: string, query: string, limit: number = 20) {
  try {
    const { data, error } = await supabase
      .from('reels')
      .select(
        `
        id, instagram_url, creator_username, thumbnail_url, saved_at,
        extractions(id, category, summary, key_points)
        `
      )
      .eq('user_id', userId)
      .or(`caption.ilike.%${query}%,extractions.summary.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Failed to search reels:', error);
    throw error;
  }
}

export async function createCollection(userId: string, title: string, description?: string) {
  try {
    const { data, error } = await supabase
      .from('collections')
      .insert([
        {
          user_id: userId,
          title,
          description,
          icon_emoji: '📚',
          is_ai_suggested: false,
          is_public: false
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Failed to create collection:', error);
    throw error;
  }
}

export async function getUserCollections(userId: string) {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select(
        `
        *,
        collection_reels(count)
        `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Failed to fetch collections:', error);
    throw error;
  }
}

export async function addReelToCollection(collectionId: string, reelId: string) {
  try {
    const { data, error } = await supabase
      .from('collection_reels')
      .insert([
        {
          collection_id: collectionId,
          reel_id: reelId
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Failed to add reel to collection:', error);
    throw error;
  }
}

export async function createHighlight(
  extractionId: string,
  userId: string,
  text: string,
  userNote?: string
) {
  try {
    const { data, error } = await supabase
      .from('highlights')
      .insert([
        {
          extraction_id: extractionId,
          user_id: userId,
          text,
          user_note: userNote,
          highlight_tags: [],
          created_at: new Date()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Failed to create highlight:', error);
    throw error;
  }
}

export async function updateProcessingQueueStatus(reelId: string, status: string, errorMsg?: string) {
  try {
    const update: any = {
      status,
      updated_at: new Date()
    };

    if (status === 'completed') {
      update.completed_at = new Date();
    }

    if (errorMsg) {
      update.error_message = errorMsg;
    }

    const { data, error } = await supabase
      .from('processing_queue')
      .update(update)
      .eq('reel_id', reelId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Failed to update processing queue:', error);
    throw error;
  }
}

export { supabase };
