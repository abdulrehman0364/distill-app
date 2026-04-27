// src/services/instagramService.ts

import axios from 'axios';
import logger from '../utils/logger.js';

const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'instagram-data1.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

interface ReelData {
  caption: string;
  transcript: string;
  thumbnail_url: string;
  duration_seconds: number;
  creator_username: string;
  likes_count: number;
  metadata: Record<string, any>;
}

/**
 * Extract Instagram post ID from reel URL
 * Supports: instagram.com/p/{id}/ or instagram.com/reel/{id}/
 */
function extractPostIdFromUrl(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)\/?/);
  return match ? match[1] : null;
}

/**
 * Fetch reel data from Instagram via RapidAPI
 * Falls back to basic caption parsing if API fails
 */
export async function fetchReelData(instagramUrl: string): Promise<ReelData> {
  try {
    const postId = extractPostIdFromUrl(instagramUrl);
    if (!postId) {
      throw new Error('Invalid Instagram URL format');
    }

    // Try RapidAPI first (requires API key)
    if (RAPIDAPI_KEY) {
      try {
        const response = await axios.get(
          `https://${RAPIDAPI_HOST}/api/ig/media_info`,
          {
            params: { ig_username: 'user', post_id: postId },
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': RAPIDAPI_HOST
            },
            timeout: 10000
          }
        );

        const media = response.data.data;

        return {
          caption: media.caption || '',
          transcript: media.video_title || media.caption || '',
          thumbnail_url: media.media_type === 'VIDEO' ? media.thumbnail_url : media.image_url,
          duration_seconds: media.video_duration || 15,
          creator_username: media.username,
          likes_count: media.like_count || 0,
          metadata: {
            video_id: postId,
            original_posted_date: media.timestamp,
            media_type: media.media_type
          }
        };
      } catch (apiError) {
        logger.warn('RapidAPI call failed, falling back to URL parsing', {
          error: (apiError as Error).message
        });
      }
    }

    // Fallback: return minimal data (in production, you'd scrape HTML)
    logger.info('Using fallback reel data extraction');

    return {
      caption: `Instagram reel: ${instagramUrl}`,
      transcript: '',
      thumbnail_url: '',
      duration_seconds: 15,
      creator_username: 'unknown',
      likes_count: 0,
      metadata: {
        video_id: postId,
        source: 'fallback'
      }
    };
  } catch (error) {
    logger.error('Failed to fetch reel data:', error);
    throw error;
  }
}

/**
 * Validate Instagram URL format
 */
export function isValidInstagramUrl(url: string): boolean {
  return /instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?/.test(url);
}
