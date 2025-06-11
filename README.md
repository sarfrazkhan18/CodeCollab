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

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

The app works in demo mode by default. To enable full features:

1. **For Authentication (Optional):**
   - Create a Supabase project at [https://supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Edit `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **For AI Features (Optional):**
   - Get API keys from [Anthropic](https://console.anthropic.com) or [Google AI](https://makersuite.google.com)
   - Add to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your-anthropic-key
   GOOGLE_AI_API_KEY=your-google-ai-key
   ```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

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
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── project/          # Project workspace components
│   └── templates/        # Template gallery
├── lib/                  # Utility libraries
│   ├── ai/              # AI agents and services
│   ├── collaboration/   # Real-time collaboration
│   ├── deployment/      # Deployment services
│   └── templates/       # Project templates
└── public/              # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Technologies Used

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI Components:** Radix UI, shadcn/ui, Lucide React
- **Authentication:** Supabase Auth
- **AI Integration:** Anthropic Claude, Google Gemini
- **Code Editor:** Monaco Editor
- **Real-time:** WebSockets, Yjs (optional)
- **Deployment:** Vercel, Netlify support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.