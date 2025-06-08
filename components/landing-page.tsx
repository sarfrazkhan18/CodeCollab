'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CodeIcon, BrainCircuitIcon, RocketIcon, UsersIcon, ZapIcon, GithubIcon, TwitterIcon, LinkedinIcon, DiscIcon as DiscordIcon, ChevronRightIcon, ArrowRightIcon } from 'lucide-react';
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
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/demo" className="text-sm font-medium hover:text-primary transition-colors">
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
                Collaborative Coding Powered by{' '}
                <span className="text-primary">AI Agents</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Build software faster with intelligent agent collaboration. CodeCollab AI combines real-time collaboration with AI-powered coding assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    <ZapIcon className="mr-2 h-4 w-4" /> Start Building
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Try Live Demo <ChevronRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
          
          {/* Background Gradient */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),transparent),radial-gradient(40rem_60rem_at_bottom,theme(colors.indigo.100),transparent)] opacity-20 dark:opacity-[0.15]" />
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                Powered by Advanced AI
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI system combines multiple specialized agents using state-of-the-art language models for enhanced coding assistance
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Agents Section */}
        <section id="agents" className="py-20">
          <div className="container space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Meet Your AI Teammates</h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">
                Our specialized AI agents work together to help you build software faster
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
                  <div className={`h-10 w-10 rounded-full ${agent.bgColor} flex items-center justify-center text-white font-bold`}>
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
                    <p className="text-muted-foreground mb-3">{agent.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {agent.skills.map((skill, i) => (
                        <span key={i} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.skillBg}`}>
                          {skill}
                        </span>
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
              Start Building Better Software Today
            </h2>
            <p className="text-muted-foreground max-w-[600px] mx-auto">
              Join thousands of developers who are already using CodeCollab AI to build faster
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="px-8">
                  View Demo
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
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Integrations</Link></li>
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

const features = [
  {
    icon: <BrainCircuitIcon className="h-6 w-6 text-primary" />,
    title: "AI-Powered Assistance",
    description: "Multiple specialized AI agents work together to help you write better code faster."
  },
  {
    icon: <RocketIcon className="h-6 w-6 text-primary" />,
    title: "Instant Deployment",
    description: "Deploy your projects with a single click to your favorite cloud platform."
  },
  {
    icon: <UsersIcon className="h-6 w-6 text-primary" />,
    title: "Real-time Collaboration",
    description: "Work together with your team in real-time with presence indicators and live updates."
  }
];

const agents = [
  {
    name: "Frontend Specialist",
    description: "Crafts beautiful UIs with React, TypeScript, and Tailwind CSS",
    icon: "F",
    bgColor: "bg-[hsl(var(--chart-1))]",
    skillBg: "bg-[hsl(var(--chart-1))]/20 text-[hsl(var(--chart-1))]",
    skills: ["React", "TypeScript", "Tailwind"]
  },
  {
    name: "Backend Specialist",
    description: "Creates robust APIs with FastAPI, Python, and database integration",
    icon: "B",
    bgColor: "bg-[hsl(var(--chart-2))]",
    skillBg: "bg-[hsl(var(--chart-2))]/20 text-[hsl(var(--chart-2))]",
    skills: ["FastAPI", "Python", "Supabase"]
  },
  {
    name: "Database Specialist",
    description: "Designs efficient database schemas and optimizes queries",
    icon: "D",
    bgColor: "bg-[hsl(var(--chart-3))]",
    skillBg: "bg-[hsl(var(--chart-3))]/20 text-[hsl(var(--chart-3))]",
    skills: ["PostgreSQL", "Schema Design", "SQL"]
  },
  {
    name: "Testing Specialist",
    description: "Ensures code quality with unit and integration tests",
    icon: "T",
    bgColor: "bg-[hsl(var(--chart-4))]",
    skillBg: "bg-[hsl(var(--chart-4))]/20 text-[hsl(var(--chart-4))]",
    skills: ["Jest", "Cypress", "QA"]
  }
];