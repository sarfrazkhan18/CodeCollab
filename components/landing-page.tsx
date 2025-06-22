'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  PlayIcon,
  SparklesIcon,
  MonitorIcon,
  BookTemplateIcon as TemplateIcon,
  TrendingUpIcon,
  ShieldIcon,
  GitBranchIcon,
  TerminalIcon,
  ArrowRightIcon,
  CheckIcon
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function LandingPage() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  const handleDemo = () => {
    router.push('/demo');
  };

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <CodeIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">CodeCollab AI</h1>
              <p className="text-xs text-muted-foreground">Developer Platform</p>
            </div>
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#demo" className="text-sm font-medium hover:text-primary transition-colors">
              Demo
            </Link>
            <Link href="#docs" className="text-sm font-medium hover:text-primary transition-colors">
              Docs
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignIn}
              className="cursor-pointer"
            >
              Sign In
            </Button>
            <Button 
              size="sm"
              onClick={handleGetStarted}
              className="cursor-pointer"
            >
              Get Started
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Clean & Developer-focused */}
        <section className="py-20 md:py-32">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="mb-6">
                <Badge variant="outline" className="mb-4">
                  <SparklesIcon className="w-3 h-3 mr-1" />
                  AI-Powered Development Platform
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Build Software{' '}
                <span className="gradient-text">10x Faster</span>
                <br />with AI Agents
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                The collaborative coding platform designed by developers, for developers. 
                Ship production-ready code with AI assistance, real-time collaboration, and one-click deployment.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  className="px-8 cursor-pointer"
                  onClick={handleDemo}
                >
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Try Interactive Demo
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 cursor-pointer"
                  onClick={handleGetStarted}
                >
                  Start Building Free
                </Button>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
                {[
                  { number: '10x', label: 'Faster Development' },
                  { number: '5', label: 'AI Specialists' },
                  { number: '50+', label: 'Project Templates' },
                  { number: '99.9%', label: 'Uptime' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-primary">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Core Features - Simplified */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything You Need to Ship Faster</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Production-ready tools that integrate seamlessly into your development workflow
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <BrainCircuitIcon className="h-6 w-6" />,
                  title: 'AI Code Assistant',
                  description: 'Write, review, and refactor code with specialized AI agents',
                  features: ['Code generation', 'Bug detection', 'Performance optimization']
                },
                {
                  icon: <UsersIcon className="h-6 w-6" />,
                  title: 'Real-time Collaboration',
                  description: 'Work together with live cursors, comments, and shared editing',
                  features: ['Live cursors', 'Inline comments', 'Conflict resolution']
                },
                {
                  icon: <RocketIcon className="h-6 w-6" />,
                  title: 'One-click Deploy',
                  description: 'Deploy to production with automatic configuration',
                  features: ['Multiple platforms', 'Auto scaling', 'Custom domains']
                },
                {
                  icon: <TemplateIcon className="h-6 w-6" />,
                  title: 'Project Templates',
                  description: 'Start with production-ready templates and best practices',
                  features: ['50+ templates', 'Full-stack apps', 'Modern frameworks']
                },
                {
                  icon: <GitBranchIcon className="h-6 w-6" />,
                  title: 'Git Integration',
                  description: 'Visual git interface with smart merge conflict resolution',
                  features: ['Visual diffs', 'Branch management', 'Smart merging']
                },
                {
                  icon: <MonitorIcon className="h-6 w-6" />,
                  title: 'Live Preview',
                  description: 'See changes instantly with hot reload and responsive testing',
                  features: ['Hot reload', 'Mobile preview', 'Performance metrics']
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="dev-card h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg text-primary">
                          {feature.icon}
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.features.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckIcon className="h-3 w-3 text-green-500" />
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

        {/* Demo Section */}
        <section id="demo" className="py-20">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">See It In Action</h3>
                <p className="text-lg text-muted-foreground mb-8">
                  Experience the power of AI-assisted development with our interactive demo. 
                  No signup required - start coding immediately.
                </p>
                
                <div className="space-y-4 mb-8">
                  {[
                    '🤖 AI analyzes and improves your code in real-time',
                    '🚀 Generate complete applications from simple descriptions',
                    '👥 Collaborate with team members using live cursors',
                    '📦 Deploy to production with zero configuration'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  size="lg" 
                  className="px-8 cursor-pointer"
                  onClick={handleDemo}
                >
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Launch Interactive Demo
                </Button>
              </div>

              <div className="relative">
                <div className="glass-effect rounded-xl p-1">
                  <div className="bg-card rounded-lg overflow-hidden">
                    {/* Mock Terminal/IDE Interface */}
                    <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 border-b">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">CodeCollab AI</span>
                    </div>
                    
                    <div className="p-6 code-font text-sm">
                      <div className="space-y-2">
                        <div className="text-green-400">$ codecollab generate --type="dashboard"</div>
                        <div className="text-blue-400">🤖 AI: Generating React dashboard with charts...</div>
                        <div className="text-yellow-400">📁 Created: components/Dashboard.tsx</div>
                        <div className="text-yellow-400">📁 Created: hooks/useAnalytics.ts</div>
                        <div className="text-yellow-400">📁 Created: styles/dashboard.css</div>
                        <div className="text-green-400 flex items-center gap-2">
                          ✅ Ready for deployment
                          <span className="status-dot status-online"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to 10x Your Development Speed?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers shipping faster with AI-powered collaboration
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8 cursor-pointer"
                onClick={handleGetStarted}
              >
                Start Building Free
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 cursor-pointer"
                onClick={handleDemo}
              >
                <PlayIcon className="mr-2 h-4 w-4" />
                Try Demo First
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Free forever plan available
            </p>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                  <CodeIcon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold">CodeCollab AI</h3>
                  <p className="text-xs text-muted-foreground">Developer Platform</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                The collaborative coding platform that empowers developers to build faster with AI assistance.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <GithubIcon className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                <li><Button variant="link" className="text-muted-foreground hover:text-primary transition-colors p-0 h-auto" onClick={handleDemo}>Demo</Button></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Templates</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">API Reference</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} CodeCollab AI. Built for developers, by developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}