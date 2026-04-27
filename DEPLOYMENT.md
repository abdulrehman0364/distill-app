# distill. — Complete Deployment Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- A Supabase account (free tier)
- A Groq API key (free tier)

### Step 1: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (pick any region)
3. In Project Settings → API, copy your:
   - Project URL
   - Service Key (for backend)
   - Anon Key (for frontend)
4. Go to SQL Editor and paste the full schema from `03_DATABASE_SCHEMA.md`
5. Run the migration

### Step 2: Get API Keys

1. **Groq API** (free tier)
   - Go to [console.groq.com](https://console.groq.com)
   - Create account, generate API key
   - Free tier gives 30 requests/min (enough for MVP)

2. **RapidAPI Instagram Data** (optional)
   - Go to [RapidAPI.com](https://rapidapi.com)
   - Search for "Instagram Data"
   - Subscribe to a free tier scraper
   - Get your API key

### Step 3: Setup Backend

```bash
cd backend

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your keys
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_key
GROQ_API_KEY=your_key

# Install dependencies
npm install

# Start development server
npm run dev

# Should see: "API server started on port 5000"
```

### Step 4: Setup Frontend

```bash
cd frontend

# Create .env file
echo 'VITE_API_URL=http://localhost:5000/api' > .env

# Install dependencies
npm install

# Start dev server
npm run dev

# Should see: "Local: http://localhost:3000"
```

### Step 5: Test Locally

1. Open http://localhost:3000
2. Log in with any email
3. Paste an Instagram reel URL: `https://www.instagram.com/reel/...`
4. Should process in ~3-5 seconds
5. Check backend logs for extraction success

---

## Production Deployment

### Option A: Deploy to Railway (Recommended for Backend)

1. **Connect GitHub**
   - Push your code to GitHub
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Select your repo

2. **Configure Backend Service**
   ```
   Service: Node.js
   Start Command: npm run build && npm start
   Environment:
     - SUPABASE_URL
     - SUPABASE_SERVICE_KEY
     - GROQ_API_KEY
     - FRONTEND_URL=your-frontend.vercel.app
   ```

3. **Deploy**
   - Railway auto-deploys on git push
   - Get your backend URL from Railway dashboard
   - Update frontend VITE_API_URL to point to it

### Option B: Deploy to Vercel (Frontend)

1. **Push to GitHub**
   - Commit all code
   - git push

2. **Connect Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Select "frontend" directory

3. **Environment Variables**
   - Add in Vercel dashboard:
   ```
   VITE_API_URL=https://your-railway-api.up.railway.app/api
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Deploy**
   - Vercel auto-deploys on git push
   - Get your frontend URL (e.g., distill.vercel.app)

### Option C: Docker Deployment

**Build backend image:**

```bash
cd backend

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 5000
CMD ["node", "dist/server.js"]
EOF

# Build & run locally
docker build -t distill-api .
docker run -p 5000:5000 --env-file .env.local distill-api
```

**Deploy to Railway with Docker:**

```bash
# Railway auto-detects Dockerfile
git push
```

---

## Database Setup (One-time)

### Run Migrations

1. Connect to Supabase SQL Editor
2. Copy entire schema from `03_DATABASE_SCHEMA.md`
3. Execute
4. Verify tables exist: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`

### Enable Row-Level Security

```sql
-- Users can only access their own data
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reels"
ON reels FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reels"
ON reels FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reels"
ON reels FOR DELETE
USING (auth.uid() = user_id);

-- (Repeat for other sensitive tables)
```

---

## Environment Variables Reference

### Backend (.env.local)

```
NODE_ENV=production                    # development | production
PORT=5000

SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...        # Get from Supabase dashboard
SUPABASE_ANON_KEY=eyJhbGc...           # Get from Supabase dashboard

GROQ_API_KEY=gsk_...                   # Get from console.groq.com
RAPIDAPI_KEY=...                       # Optional: Instagram data scraper
RAPIDAPI_HOST=instagram-data1.p.rapidapi.com

FRONTEND_URL=https://distill.vercel.app  # Your frontend domain
LOG_LEVEL=info                         # error | warn | info | debug
```

### Frontend (.env)

```
VITE_API_URL=https://your-api.up.railway.app/api
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Monitoring & Debugging

### Backend Logs

```bash
# Local
npm run dev

# Production (Railway)
# View in Railway dashboard → Deployments → Logs

# Production (Docker)
docker logs -f distill-api
```

### Check API Health

```bash
curl https://your-api.up.railway.app/health

# Should return:
# {"status":"ok","timestamp":"2026-04-26T...","env":"production"}
```

### Common Issues

**Issue: "CORS error from frontend"**
- Solution: Update FRONTEND_URL in backend .env
- Restart backend
- Clear browser cache

**Issue: "Groq API returns 429 (rate limited)"**
- Free tier: 30 requests/min
- Solution: Batch extractions or upgrade plan
- Add retry logic in groqService.ts

**Issue: "Instagram URL not working"**
- RapidAPI key expired or rate limited
- Solution: Use fallback caption parsing (already implemented)

**Issue: "Database connection error"**
- Verify SUPABASE_URL and SERVICE_KEY in .env
- Check firewall: Supabase allows all IPs by default
- Verify tables exist in Supabase dashboard

---

## Scaling Tips

### If Users Exceed Groq Free Tier
- Upgrade to Groq's paid tier (~$0.10 per extraction)
- Or: Use Ollama self-hosted (free, slower)
- Or: Use other free LLM APIs (Together AI, Hugging Face)

### If Database Gets Large
- Add indexes on frequently queried columns
- Implement pagination (already in code)
- Archive old reels after 90 days

### If Frontend is Slow
- Enable Vercel Analytics
- Add image optimization (next-image alternative)
- Use React.lazy() for code splitting

### Background Job Queue
When extractions pile up:

```bash
# Install Redis
# Then use Bull library
npm install bull redis

# See: backend/src/services/queueService.ts (to be implemented)
```

---

## Security Checklist

- [ ] Set `NODE_ENV=production` on production
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Rotate API keys monthly
- [ ] Enable Supabase RLS policies
- [ ] Add rate limiting (already in app.ts)
- [ ] Monitor logs for errors
- [ ] Use environment-specific URLs (no hardcoding)
- [ ] Set secure cookies with httpOnly flag
- [ ] Implement CSRF protection if adding forms

---

## Testing in Production

```bash
# 1. Check API is reachable
curl https://your-api.up.railway.app/health

# 2. Test auth flow
curl -X POST https://your-api.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 3. Test reel extraction
# (Need token from auth flow)

# 4. Monitor database
# Check Supabase dashboard → logs
```

---

## Next Steps After Launch

1. **User Auth**: Implement proper Supabase magic link flow
2. **Analytics**: Add PostHog or Plausible
3. **Error Tracking**: Add Sentry
4. **Backups**: Enable Supabase automated backups
5. **CDN**: Enable Vercel's automatic CDN
6. **Performance**: Monitor Core Web Vitals

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Groq Docs**: https://console.groq.com/docs
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **React Query**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Last Updated:** April 2026  
**Status:** Production-Ready MVP
