# Supabase Database Setup

## Phase 2 Implementation: Database Persistence

This guide will help you set up Supabase for the Begin Learning Profile platform to enable persistent storage and shareable profiles.

## Prerequisites

1. A Supabase account (free tier is sufficient)
2. Node.js and npm installed
3. The project already has @supabase/supabase-js installed

## Setup Steps

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization and give your project a name
5. Set a secure database password
6. Choose a region close to your users
7. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon public key
3. Create a `.env.local` file in your project root:

```bash
# Copy .env.example to .env.local and fill in your values
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Create Database Tables

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to execute the SQL

This will create:
- `profiles` table for storing learning profiles
- `responses` table for detailed response tracking (optional)
- `results` table for caching computed results (optional)
- Proper indexes for performance
- Row Level Security (RLS) policies for data protection

### 4. Verify Setup

1. Go to Table Editor in your Supabase dashboard
2. You should see the `profiles` table with the correct columns
3. The table should have RLS enabled

## Database Schema

### profiles table
- `id` (UUID, Primary Key)
- `child_name` (Text)
- `grade` (Text)
- `responses` (JSONB) - Stores all assessment responses
- `scores` (JSONB) - Stores calculated category scores
- `personality_label` (Text) - The computed personality type
- `description` (Text) - Generated description
- `is_public` (Boolean) - Whether the profile can be publicly shared
- `share_token` (Text, Unique) - Token for sharing profiles
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Features Enabled

### ✅ Profile Persistence
- Assessment responses are saved to the database
- Profiles persist beyond browser session
- Unique URLs for each profile

### ✅ Shareable Profiles  
- Each profile gets a unique share token
- Public profiles can be viewed by anyone with the link
- Share via URL or social media

### ✅ Privacy Controls
- Profiles can be made public or private
- Only public profiles are accessible via share links
- Row Level Security ensures data protection

### ✅ Performance Optimized
- Proper database indexes for fast queries
- JSONB storage for flexible response data
- Efficient caching of computed results

## API Endpoints

The following API routes are now available:

- `POST /api/profiles` - Create a new profile
- `GET /api/profiles/[id]` - Get a profile by ID
- `PATCH /api/profiles/[id]/privacy` - Update profile privacy
- `GET /api/share/[token]` - Get a profile by share token

## Usage Examples

### Creating a Profile
```javascript
const response = await fetch('/api/profiles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    child_name: 'Emma',
    grade: '3rd Grade',
    responses: { 1: 4, 2: 5, ... }
  })
})
```

### Sharing a Profile
Profiles can be shared using two URL formats:
- Direct: `/results/uuid-here`
- Shareable: `/share/share-token-here`

## Security

- Row Level Security (RLS) is enabled on all tables
- Only public profiles can be accessed via share links
- No authentication required for viewing public profiles
- API routes include proper error handling and validation

## Development vs Production

### Development
- Use localhost URL in `NEXT_PUBLIC_APP_URL`
- Supabase handles CORS automatically

### Production
- Update `NEXT_PUBLIC_APP_URL` to your production domain
- Consider adding custom domain to Supabase project
- Monitor usage in Supabase dashboard

## Troubleshooting

### Common Issues

1. **"Profile not found" errors**
   - Check that the profile ID is correct
   - Verify the profile exists in the database
   - Ensure the profile is public if accessing via share link

2. **Database connection errors**
   - Verify your Supabase URL and anon key are correct
   - Check that your Supabase project is active
   - Ensure environment variables are loaded

3. **RLS policy errors**
   - Make sure you ran the complete schema SQL
   - Verify RLS policies are correctly set up
   - Check Supabase logs for detailed error messages

### Testing the Database

You can test the database setup by:

1. Running the development server: `npm run dev`
2. Going to `/assessment/start`
3. Completing an assessment
4. Verifying the profile appears in your Supabase table editor
5. Testing the share functionality

## Next Steps

With Phase 2 complete, you now have:
- ✅ Persistent database storage
- ✅ Shareable profile URLs
- ✅ Proper error handling and loading states
- ✅ Privacy controls
- ✅ Production-ready architecture

Future enhancements could include:
- User authentication and profile ownership
- Profile editing capabilities
- Analytics and reporting
- Bulk profile management for educators
- Email sharing functionality