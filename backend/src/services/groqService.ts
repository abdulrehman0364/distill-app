// src/services/groqService.ts

import Groq from 'groq-sdk';
import logger from '../utils/logger.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const EXTRACTION_SYSTEM_PROMPT = `You are an expert AI that extracts and structures knowledge from Instagram reel captions and transcripts.

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
    { "step": 2, "action": "Second action" }
  ],
  "creator_tip": "Any special wisdom, caution, or insight the creator emphasized. If none, null.",
  "references": [
    {
      "type": "book|film|product|app|person|concept|brand",
      "name": "Exact name",
      "details": { "author": "...", "year": "...", "link": "...", "image_url": "..." },
      "context": "Where/how it was mentioned"
    }
  ],
  "tone": "educational|motivational|entertaining|instructional|narrative",
  "estimated_read_time_minutes": 2,
  "insufficient_data": false
}

## Rules:
1. ONLY extract information explicitly mentioned. Do NOT invent.
2. Always categorize, even if uncertain — pick closest fit.
3. For instructional content, include detailed steps.
4. For non-instructional, leave steps empty [].
5. Preserve creator's exact wording in key_points and creator_tip.
6. If caption is empty or unavailable, set insufficient_data: true.
7. References should be explicitly mentioned only.

## Category-Specific Guidance:

**Fitness:** exercises, reps, form cues, warm-up/workout/cooldown steps
**Finance:** financial principles, investment tips, saving strategies
**Food:** cuisine, technique, detailed recipe steps, ingredient brands
**Travel:** destinations, logistics, itinerary steps
**Fashion:** style tips, color coordination, outfit styling steps
**Mindset:** psychological concepts, life lessons, philosophies
**Tech:** technical concepts, coding tips, setup/installation steps
**Music:** music theory, production techniques, production steps if tutorial
**Film:** plot, cinematography, production insights (no steps)
**General:** apply best judgment; extract what's most valuable

Return ONLY valid JSON, no extra text.`;

interface ExtractionResult {
  category: string;
  summary: string;
  key_points: string[];
  steps: Array<{ step: number; action: string }>;
  creator_tip: string | null;
  references: Array<{
    type: string;
    name: string;
    details: Record<string, any>;
    context: string;
  }>;
  tone: string;
  estimated_read_time_minutes: number;
  insufficient_data: boolean;
}

export async function extractReelWithGroq(
  caption: string,
  transcript: string
): Promise<ExtractionResult> {
  try {
    const startTime = Date.now();

    const message = await groq.messages.create({
      model: 'llama2-70b-4096',
      max_tokens: 1500,
      temperature: 0.3,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Caption: "${caption || ''}"\n\nTranscript: "${transcript || ''}"`
        }
      ]
    });

    const processingTime = Date.now() - startTime;
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Clean JSON response (remove markdown code blocks if present)
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const extraction: ExtractionResult = JSON.parse(cleanedResponse);
    
    logger.info(`Extraction completed in ${processingTime}ms`, {
      category: extraction.category,
      hasReferences: extraction.references?.length || 0
    });

    return {
      ...extraction,
      processingTime
    } as any;
  } catch (error) {
    logger.error('Groq extraction error:', error);
    
    // Fallback: return minimal extraction
    return {
      category: 'general',
      summary: caption ? caption.substring(0, 150) : 'Extraction failed',
      key_points: [],
      steps: [],
      creator_tip: null,
      references: [],
      tone: 'unknown',
      estimated_read_time_minutes: 2,
      insufficient_data: !caption && !transcript
    };
  }
}

export async function reprocessReel(
  caption: string,
  transcript: string
): Promise<ExtractionResult> {
  return extractReelWithGroq(caption, transcript);
}
