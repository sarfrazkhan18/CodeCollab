'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CodeIcon, 
  BrainCircuitIcon, 
  RocketIcon, 
  UsersIcon, 
  ZapIcon, 
  GithubIcon, 
  TwitterIcon, 
  LinkedinIcon, 
  DiscIcon as DiscordIcon, 
  ChevronRightIcon, 
  ArrowRightIcon,
  SparklesIcon,
  MonitorIcon,
  BookTemplateIcon as TemplateIcon,
  TrendingUpIcon,
  ShieldIcon,
  GitBranchIcon,
  TerminalIcon,
  PlayIcon
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Modern Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <CodeIcon className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">CodeCollab AI</span>
          </motion.div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#agents" className="text-sm font-medium hover:text-primary transition-colors">
              AI Agents
            </Link>
            <Link href="#showcase" className="text-sm font-medium hover:text-primary transition-colors">
              Showcase
            </Link>
            <Link href="/demo" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <PlayIcon className="h-4 w-4" />
              Live Demo
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="hidden sm:flex">
                Get Started <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                Build Software Faster with{' '}
                <span className="text-primary">AI-Powered Collaboration</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Experience the future of coding with intelligent AI agents, real-time collaboration, 
                code intelligence, and one-click deployment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/demo">
                  <Button size="lg" className="w-full sm:w-auto">
                    <PlayIcon className="mr-2 h-4 w-4" /> Try Interactive Demo
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Start Building Free <ChevronRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { icon: <BrainCircuitIcon className="h-5 w-5" />, text: "AI Code Intelligence" },
                  { icon: <TemplateIcon className="h-5 w-5" />, text: "Project Templates" },
                  { icon: <RocketIcon className="h-5 w-5" />, text: "One-Click Deploy" },
                  { icon: <UsersIcon className="h-5 w-5" />, text: "Real-time Collab" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="text-primary">{item.icon}</div>
                    {item.text}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Background Gradient */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),transparent),radial-gradient(40rem_60rem_at_bottom,theme(colors.indigo.100),transparent)] opacity-20 dark:opacity-[0.15]" />
        </section>

        {/* Advanced Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                Advanced Development Platform
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need for modern software development, powered by cutting-edge AI technology
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {advancedFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                    <CardHeader>
                      <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.features.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Showcase Section */}
        <section id="showcase" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                See It In Action
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Watch how CodeCollab AI transforms your development workflow
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Interactive Demo Experience</h3>
                <p className="text-muted-foreground">
                  Try our live demo to experience AI-powered code analysis, intelligent refactoring, 
                  project templates, and real-time collaboration features.
                </p>
                <div className="space-y-4">
                  {[
                    "🧠 AI analyzes your code in real-time",
                    "🚀 Generate complete projects from templates", 
                    "⚡ Deploy to production with one click",
                    "👥 Collaborate with live cursors and comments"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/demo">
                  <Button size="lg" className="mt-6">
                    <PlayIcon className="mr-2 h-4 w-4" />
                    Try Interactive Demo
                  </Button>
                </Link>
              </div>

              <div className="relative">
                <div className="bg-card border rounded-xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-sm text-muted-foreground">CodeCollab AI Demo</span>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                    <div className="text-green-400">$ codecollab analyze</div>
                    <div className="text-blue-400 mt-2">✓ Code quality: 85/100</div>
                    <div className="text-yellow-400">⚡ Performance: 92/100</div>
                    <div className="text-purple-400">🔒 Security: 88/100</div>
                    <div className="text-green-400 mt-2">🚀 Ready for deployment!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Agents Section */}
        <section id="agents" className="py-20 bg-muted/50">
          <div className="container space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Meet Your AI Development Team</h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">
                Specialized AI agents that work together to accelerate your development process
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {agents.map((agent, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4 items-start p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-all"
                >
                  <div className={`h-12 w-12 rounded-full ${agent.bgColor} flex items-center justify-center text-white font-bold text-lg`}>
                    {agent.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
                    <p className="text-muted-foreground mb-4">{agent.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {agent.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className={agent.skillBg}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted">
          <div className="container text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
              Ready to Transform Your Development Workflow?
            </h2>
            <p className="text-muted-foreground max-w-[600px] mx-auto">
              Join thousands of developers building faster with AI-powered collaboration
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Link href="/demo">
                <Button size="lg" className="px-8">
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Try Demo
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="px-8">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Updated Compact Footer */}
      <footer className="border-t py-8 bg-muted/10">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="md:w-1/3">
              <div className="flex items-center gap-2 mb-4">
                <CodeIcon className="h-5 w-5 text-primary" />
                <span className="font-semibold">CodeCollab AI</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Building the future of collaborative coding with AI-powered assistance.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <GithubIcon className="h-4 w-4" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <TwitterIcon className="h-4 w-4" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <LinkedinIcon className="h-4 w-4" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <DiscordIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Product</h3>
                <ul className="space-y-1.5">
                  <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                  <li><Link href="#agents" className="text-muted-foreground hover:text-primary transition-colors">AI Agents</Link></li>
                  <li><Link href="/demo" className="text-muted-foreground hover:text-primary transition-colors">Live Demo</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Templates</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Resources</h3>
                <ul className="space-y-1.5">
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">API Reference</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Status</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Company</h3>
                <ul className="space-y-1.5">
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Legal</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} CodeCollab AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const advancedFeatures = [
  {
    icon: <BrainCircuitIcon className="h-6 w-6 text-white" />,
    title: "Code Intelligence",
    description: "AI-powered code analysis, refactoring, and documentation generation",
    gradient: "from-blue-500 to-purple-600",
    features: [
      "Real-time code quality metrics",
      "Intelligent refactoring suggestions", 
      "Auto-generated documentation",
      "Security vulnerability detection"
    ]
  },
  {
    icon: <TemplateIcon className="h-6 w-6 text-white" />,
    title: "Project Templates",
    description: "Production-ready templates for rapid development",
    gradient: "from-green-500 to-teal-600",
    features: [
      "React, Vue, Angular templates",
      "Full-stack applications",
      "AI and blockchain projects",
      "One-click project setup"
    ]
  },
  {
    icon: <RocketIcon className="h-6 w-6 text-white" />,
    title: "Smart Deployment",
    description: "One-click deployment to multiple platforms",
    gradient: "from-orange-500 to-red-600",
    features: [
      "Vercel, Netlify, AWS support",
      "Auto-generated configurations",
      "Environment management",
      "Custom domain setup"
    ]
  },
  {
    icon: <UsersIcon className="h-6 w-6 text-white" />,
    title: "Real-time Collaboration",
    description: "Live cursors, comments, and team presence",
    gradient: "from-purple-500 to-pink-600",
    features: [
      "Live cursor tracking",
      "Inline code comments",
      "Conflict resolution",
      "Activity feed"
    ]
  },
  {
    icon: <GitBranchIcon className="h-6 w-6 text-white" />,
    title: "Git Integration",
    description: "Seamless version control and collaboration",
    gradient: "from-indigo-500 to-blue-600",
    features: [
      "Visual git interface",
      "Branch management",
      "Merge conflict resolution",
      "Commit history visualization"
    ]
  },
  {
    icon: <TerminalIcon className="h-6 w-6 text-white" />,
    title: "Integrated Terminal",
    description: "Full-featured terminal with command history",
    gradient: "from-gray-600 to-gray-800",
    features: [
      "Multiple terminal sessions",
      "Command history",
      "Package management",
      "Build tool integration"
    ]
  }
];

const agents = [
  {
    name: "Frontend Specialist",
    description: "Crafts beautiful UIs with React, TypeScript, and modern frameworks",
    icon: "F",
    bgColor: "bg-[hsl(var(--chart-1))]",
    skillBg: "bg-[hsl(var(--chart-1))]/20 text-[hsl(var(--chart-1))]",
    skills: ["React", "TypeScript", "Tailwind", "Next.js"]
  },
  {
    name: "Backend Specialist", 
    description: "Creates robust APIs and server-side architecture",
    icon: "B",
    bgColor: "bg-[hsl(var(--chart-2))]",
    skillBg: "bg-[hsl(var(--chart-2))]/20 text-[hsl(var(--chart-2))]",
    skills: ["Node.js", "Python", "FastAPI", "Supabase"]
  },
  {
    name: "Database Specialist",
    description: "Designs efficient database schemas and optimizes queries",
    icon: "D", 
    bgColor: "bg-[hsl(var(--chart-3))]",
    skillBg: "bg-[hsl(var(--chart-3))]/20 text-[hsl(var(--chart-3))]",
    skills: ["PostgreSQL", "Schema Design", "Optimization"]
  },
  {
    name: "Testing Specialist",
    description: "Ensures code quality with comprehensive testing strategies",
    icon: "T",
    bgColor: "bg-[hsl(var(--chart-4))]", 
    skillBg: "bg-[hsl(var(--chart-4))]/20 text-[hsl(var(--chart-4))]",
    skills: ["Jest", "Cypress", "Unit Testing", "E2E"]
  }
];