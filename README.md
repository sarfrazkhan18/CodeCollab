# CodeCollab AI

A collaborative coding platform powered by AI agents with real-time collaboration features.

## Features

- 🤖 **AI-Powered Development** - Multiple specialized AI agents for different aspects of development
- 👥 **Real-time Collaboration** - Live cursors, comments, and team presence
- 🧠 **Code Intelligence** - AI-powered code analysis, refactoring, and documentation
- 🚀 **One-Click Deployment** - Deploy to Vercel, Netlify, and other platforms
- 📦 **Project Templates** - Production-ready templates for rapid development
- 🔧 **Integrated Tools** - Git integration, terminal, and live preview

## Getting Started

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/yourusername/codecollab-ai.git
cd codecollab-ai
npm install
```

### 2. Environment Configuration

The app uses Supabase for authentication, database, and real-time features.

#### Option 1: Automated Setup (Recommended)

Run the setup wizard which will guide you through the process:

```bash
node scripts/setup-local-env.js
```

#### Option 2: Manual Setup

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

### GitHub Actions Deployment (Recommended)

This project is configured to deploy automatically using GitHub Actions.

1. Fork this repository
2. Add the following secrets to your GitHub repository:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
   - `NETLIFY_SITE_ID`: Your Netlify site ID

3. Push to the main branch and GitHub Actions will handle deployment

### Manual Deployment to Netlify

1. Set up environment variables in Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

2. Deploy the project using the Netlify CLI or dashboard

## Demo Mode

The app runs in demo mode when Supabase is not configured:
- ✅ All UI features work
- ✅ Project creation and editing
- ✅ Code editor and file management
- ✅ Live preview
- ❌ User authentication (shows demo messages)
- ❌ Real-time collaboration (simulated)

## Project Structure

```
├── app/                    # Next.js app router pages
├── components/             # React components
├── lib/                    # Utility libraries
│   ├── ai/                 # AI agents and services
│   ├── collaboration/      # Real-time collaboration
│   ├── deployment/         # Deployment services
│   ├── supabase/           # Supabase client and utilities
│   └── templates/          # Project templates
├── public/                 # Static assets
├── scripts/                # Utility scripts
│   └── setup-local-env.js  # Environment setup wizard
└── supabase/               # Supabase configuration
    └── migrations/         # Database migrations
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `node scripts/setup-local-env.js` - Run environment setup wizard

## License

MIT License - see LICENSE file for details.