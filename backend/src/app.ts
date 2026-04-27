// src/app.ts

import express, { Request, Response, NextFunction, Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from './utils/logger.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

const app: Express = express();

// Trust proxy (for deployments behind load balancer)
app.set('trust proxy', 1);

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting (global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.path === '/health'
});
app.use(limiter);

// Health check (no auth needed)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    env: process.env.NODE_ENV
  });
});

// Auth middleware
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    );

    const { data: { user }, error } = await supabase.auth.admin.getUserById(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      id: user.id,
      email: user.email || ''
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Error handler middleware
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Request error:', {
    message: err.message,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// ============ ROUTES ============

// POST /api/reels - Submit a new reel
app.post('/api/reels', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body;
    const userId = req.user!.id;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Invalid URL provided' });
    }

    if (!url.includes('instagram.com')) {
      return res.status(400).json({ error: 'URL must be an Instagram link' });
    }

    // Import here to avoid circular dependencies
    const { fetchReelData, isValidInstagramUrl } = await import('./services/instagramService.js');
    const { extractReelWithGroq } = await import('./services/groqService.js');
    const db = await import('./services/dbService.js');

    if (!isValidInstagramUrl(url)) {
      return res.status(400).json({ error: 'Invalid Instagram reel URL format' });
    }

    // Check if already saved
    const existingReels = await db.getUserReels(userId, 1, 1);
    const alreadySaved = existingReels.reels.some((r) => r.instagram_url === url);
    if (alreadySaved) {
      return res.status(409).json({ error: 'Reel already saved in your vault' });
    }

    // Create reel record
    const reelData = await fetchReelData(url);
    const reel = await db.createReel(userId, url, reelData);

    // Update processing status
    await db.updateProcessingQueueStatus(reel.id, 'processing');

    // Trigger async extraction
    processReelAsync(reel.id, reelData, userId).catch((err) => {
      logger.error('Background extraction error:', err);
    });

    res.status(202).json({
      message: 'Reel added. Extracting knowledge in background...',
      reel_id: reel.id,
      status: 'processing'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reels - List user's reels
app.get('/api/reels', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string | undefined;

    const db = await import('./services/dbService.js');
    const result = await db.getUserReels(userId, page, limit, category);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/reels/:id - Get single reel with extraction
app.get('/api/reels/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const db = await import('./services/dbService.js');
    const reel = await db.getReelWithExtraction(id, userId);

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    res.json(reel);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/reels/:id - Delete a reel
app.delete('/api/reels/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const db = await import('./services/dbService.js');
    const supabase = (await import('./services/dbService.js')).supabase;

    // Verify ownership
    const reel = await db.getReelWithExtraction(id, userId);
    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    // Delete
    const { error } = await supabase.from('reels').delete().eq('id', id);
    if (error) throw error;

    res.json({ message: 'Reel deleted' });
  } catch (error) {
    next(error);
  }
});

// POST /api/collections - Create a collection
app.post('/api/collections', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;
    const userId = req.user!.id;

    if (!title || typeof title !== 'string' || title.length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const db = await import('./services/dbService.js');
    const collection = await db.createCollection(userId, title, description);

    res.status(201).json(collection);
  } catch (error) {
    next(error);
  }
});

// GET /api/collections - List user's collections
app.get('/api/collections', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const db = await import('./services/dbService.js');
    const collections = await db.getUserCollections(userId);

    res.json({ collections });
  } catch (error) {
    next(error);
  }
});

// POST /api/collections/:id/reels - Add reel to collection
app.post(
  '/api/collections/:id/reels',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { reel_id } = req.body;
      const userId = req.user!.id;

      if (!reel_id) {
        return res.status(400).json({ error: 'reel_id is required' });
      }

      const db = await import('./services/dbService.js');
      
      // Verify collection ownership
      const supabase = (await import('./services/dbService.js')).supabase;
      const { data: collection } = await supabase
        .from('collections')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      const result = await db.addReelToCollection(id, reel_id);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/search - Search reels
app.get('/api/search', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    const userId = req.user!.id;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const db = await import('./services/dbService.js');
    const results = await db.searchUserReels(userId, q);

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

// POST /api/highlights - Create a highlight
app.post('/api/highlights', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { extraction_id, text, user_note } = req.body;
    const userId = req.user!.id;

    if (!extraction_id || !text) {
      return res.status(400).json({ error: 'extraction_id and text are required' });
    }

    const db = await import('./services/dbService.js');
    const highlight = await db.createHighlight(extraction_id, userId, text, user_note);

    res.status(201).json(highlight);
  } catch (error) {
    next(error);
  }
});

// Error handler (must be last)
app.use(errorHandler);

export { app, authMiddleware };

// ============ ASYNC EXTRACTION HELPER ============

async function processReelAsync(reelId: string, reelData: any, userId: string) {
  try {
    const { extractReelWithGroq } = await import('./services/groqService.js');
    const db = await import('./services/dbService.js');

    logger.info(`Starting extraction for reel ${reelId}`);

    // Extract with AI
    const extraction = await extractReelWithGroq(
      reelData.caption || '',
      reelData.transcript || ''
    );

    // Save extraction
    const savedExtraction = await db.saveExtraction(reelId, extraction);

    // Save references
    if (extraction.references && extraction.references.length > 0) {
      await db.saveReferences(savedExtraction.id, extraction.references);
    }

    // Update processing status
    await db.updateProcessingQueueStatus(reelId, 'completed');

    logger.info(`Extraction completed for reel ${reelId}`);
  } catch (error) {
    logger.error(`Extraction failed for reel ${reelId}:`, error);
    const db = await import('./services/dbService.js');
    await db.updateProcessingQueueStatus(
      reelId,
      'failed',
      (error as Error).message
    );
  }
}
