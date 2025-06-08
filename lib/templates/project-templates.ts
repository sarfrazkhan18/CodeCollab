export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'mobile' | 'api' | 'fullstack' | 'ai' | 'blockchain';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  thumbnail: string;
  files: Record<string, string>;
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
  features: string[];
  estimatedTime: string;
  learningObjectives: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'react-dashboard',
    name: 'Modern React Dashboard',
    description: 'A comprehensive admin dashboard with charts, tables, and real-time data',
    category: 'web',
    difficulty: 'intermediate',
    tags: ['React', 'TypeScript', 'Tailwind', 'Charts', 'Dashboard'],
    thumbnail: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg',
    estimatedTime: '4-6 hours',
    learningObjectives: [
      'Advanced React patterns',
      'Data visualization',
      'Responsive design',
      'State management'
    ],
    features: [
      'Interactive charts and graphs',
      'Real-time data updates',
      'Responsive design',
      'Dark/light theme',
      'User authentication',
      'Data export functionality'
    ],
    files: {
      'package.json': JSON.stringify({
        name: 'react-dashboard',
        version: '1.0.0',
        dependencies: {
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'typescript': '^5.0.0',
          'tailwindcss': '^3.4.0',
          'recharts': '^2.8.0',
          'lucide-react': '^0.344.0'
        },
        scripts: {
          'dev': 'next dev',
          'build': 'next build',
          'start': 'next start'
        }
      }, null, 2),
      'src/App.tsx': `import React from 'react';
import { Dashboard } from './components/Dashboard';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Dashboard />
      </div>
    </ThemeProvider>
  );
}

export default App;`,
      'src/components/Dashboard.tsx': `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
];

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,482</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}`
    },
    dependencies: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'typescript': '^5.0.0',
      'tailwindcss': '^3.4.0',
      'recharts': '^2.8.0',
      'lucide-react': '^0.344.0'
    },
    scripts: {
      'dev': 'next dev',
      'build': 'next build',
      'start': 'next start'
    }
  },
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    description: 'Full-featured online store with cart, checkout, and payment integration',
    category: 'fullstack',
    difficulty: 'advanced',
    tags: ['React', 'Node.js', 'Stripe', 'Database', 'Authentication'],
    thumbnail: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg',
    estimatedTime: '8-12 hours',
    learningObjectives: [
      'Full-stack development',
      'Payment processing',
      'Database design',
      'Authentication systems'
    ],
    features: [
      'Product catalog',
      'Shopping cart',
      'User authentication',
      'Payment processing',
      'Order management',
      'Admin dashboard'
    ],
    files: {
      'package.json': JSON.stringify({
        name: 'ecommerce-store',
        version: '1.0.0',
        dependencies: {
          'react': '^18.2.0',
          'next': '^14.0.0',
          'stripe': '^14.0.0',
          '@supabase/supabase-js': '^2.39.0'
        }
      }, null, 2)
    },
    dependencies: {
      'react': '^18.2.0',
      'next': '^14.0.0',
      'stripe': '^14.0.0',
      '@supabase/supabase-js': '^2.39.0'
    },
    scripts: {
      'dev': 'next dev',
      'build': 'next build',
      'start': 'next start'
    }
  },
  {
    id: 'ai-chatbot',
    name: 'AI-Powered Chatbot',
    description: 'Intelligent chatbot with natural language processing and learning capabilities',
    category: 'ai',
    difficulty: 'advanced',
    tags: ['AI', 'NLP', 'React', 'OpenAI', 'Machine Learning'],
    thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    estimatedTime: '6-8 hours',
    learningObjectives: [
      'AI integration',
      'Natural language processing',
      'Real-time communication',
      'Context management'
    ],
    features: [
      'Natural language understanding',
      'Context-aware responses',
      'Learning from conversations',
      'Multi-language support',
      'Voice input/output',
      'Integration with external APIs'
    ],
    files: {
      'package.json': JSON.stringify({
        name: 'ai-chatbot',
        version: '1.0.0',
        dependencies: {
          'react': '^18.2.0',
          'openai': '^4.0.0',
          'socket.io': '^4.7.0'
        }
      }, null, 2)
    },
    dependencies: {
      'react': '^18.2.0',
      'openai': '^4.0.0',
      'socket.io': '^4.7.0'
    },
    scripts: {
      'dev': 'next dev',
      'build': 'next build',
      'start': 'next start'
    }
  },
  {
    id: 'task-manager',
    name: 'Collaborative Task Manager',
    description: 'Team productivity app with real-time collaboration and project management',
    category: 'web',
    difficulty: 'intermediate',
    tags: ['React', 'Real-time', 'Collaboration', 'Productivity'],
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    estimatedTime: '5-7 hours',
    learningObjectives: [
      'Real-time collaboration',
      'State management',
      'Drag and drop interfaces',
      'Team workflows'
    ],
    features: [
      'Kanban boards',
      'Real-time updates',
      'Team collaboration',
      'File attachments',
      'Time tracking',
      'Progress analytics'
    ],
    files: {
      'package.json': JSON.stringify({
        name: 'task-manager',
        version: '1.0.0',
        dependencies: {
          'react': '^18.2.0',
          'react-beautiful-dnd': '^13.1.0',
          'socket.io-client': '^4.7.0'
        }
      }, null, 2)
    },
    dependencies: {
      'react': '^18.2.0',
      'react-beautiful-dnd': '^13.1.0',
      'socket.io-client': '^4.7.0'
    },
    scripts: {
      'dev': 'next dev',
      'build': 'next build',
      'start': 'next start'
    }
  }
];

export class TemplateService {
  private static instance: TemplateService;

  private constructor() {}

  static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  getTemplates(): ProjectTemplate[] {
    return PROJECT_TEMPLATES;
  }

  getTemplateById(id: string): ProjectTemplate | undefined {
    return PROJECT_TEMPLATES.find(template => template.id === id);
  }

  getTemplatesByCategory(category: string): ProjectTemplate[] {
    return PROJECT_TEMPLATES.filter(template => template.category === category);
  }

  getTemplatesByDifficulty(difficulty: string): ProjectTemplate[] {
    return PROJECT_TEMPLATES.filter(template => template.difficulty === difficulty);
  }

  searchTemplates(query: string): ProjectTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return PROJECT_TEMPLATES.filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async createProjectFromTemplate(templateId: string, projectName: string): Promise<{
    files: Record<string, string>;
    dependencies: Record<string, string>;
    scripts: Record<string, string>;
  }> {
    const template = this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Customize template files with project name
    const customizedFiles = { ...template.files };
    
    // Update package.json with project name
    if (customizedFiles['package.json']) {
      const packageJson = JSON.parse(customizedFiles['package.json']);
      packageJson.name = projectName.toLowerCase().replace(/\s+/g, '-');
      customizedFiles['package.json'] = JSON.stringify(packageJson, null, 2);
    }

    return {
      files: customizedFiles,
      dependencies: template.dependencies,
      scripts: template.scripts
    };
  }
}

export const templateService = TemplateService.getInstance();