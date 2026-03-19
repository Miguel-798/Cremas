# Cremas Inventory - Frontend

A modern inventory management frontend for tracking ice cream (cremas) inventory, sales, and reservations.

## Deployment

This project is configured for deployment on **Vercel**.

### Prerequisites

- Node.js 18+
- npm or yarn
- A Vercel account

### Required Secrets / Environment Variables

Before deploying, configure the following environment variables in the **Vercel Dashboard > Settings > Environment Variables**:

#### Required for Production

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | The base URL of your deployed backend API | `https://your-backend.vercel.app` |

#### Optional (only needed if your backend uses them)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep secret) |
| `GMAIL_CLIENT_ID` | Google OAuth client ID for notifications |
| `GMAIL_CLIENT_SECRET` | Google OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | Google OAuth refresh token |
| `GMAIL_FROM_EMAIL` | Sender email address |
| `GMAIL_TO_EMAIL` | Recipient email for notifications |

### Deployment Steps

1. **Push to GitHub** (recommended) or connect directly to Vercel:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create a GitHub repo and push
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js framework

3. **Configure Environment Variables**:
   - In Vercel Dashboard, go to Settings > Environment Variables
   - Add `NEXT_PUBLIC_API_URL` with your backend URL
   - Add any optional variables from the table above

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Deployment Files

- `vercel.json` — Build settings, routing, and header configuration
- `.env.vercel` — Template for environment variables

### Local Development

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm run test
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS
- **Animations**: Framer Motion
- **Data Fetching**: TanStack Query v5
- **Testing**: Vitest + Testing Library
