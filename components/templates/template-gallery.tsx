'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  SearchIcon, 
  ClockIcon, 
  StarIcon, 
  UsersIcon,
  CodeIcon,
  DatabaseIcon,
  SmartphoneIcon,
  GlobeIcon,
  BrainCircuitIcon,
  LinkIcon
} from 'lucide-react';
import { templateService, ProjectTemplate } from '@/lib/templates/project-templates';
import { useToast } from '@/hooks/use-toast';

interface TemplateGalleryProps {
  onSelectTemplate: (template: ProjectTemplate) => void;
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ProjectTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const allTemplates = templateService.getTemplates();
    setTemplates(allTemplates);
    setFilteredTemplates(allTemplates);
  }, []);

  useEffect(() => {
    let filtered = templates;

    // Filter by search query
    if (searchQuery) {
      filtered = templateService.searchTemplates(searchQuery);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(template => template.difficulty === selectedDifficulty);
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategory, selectedDifficulty, templates]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'web':
        return <GlobeIcon className="h-4 w-4" />;
      case 'mobile':
        return <SmartphoneIcon className="h-4 w-4" />;
      case 'api':
        return <CodeIcon className="h-4 w-4" />;
      case 'fullstack':
        return <DatabaseIcon className="h-4 w-4" />;
      case 'ai':
        return <BrainCircuitIcon className="h-4 w-4" />;
      case 'blockchain':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <CodeIcon className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    toast({
      title: 'Template selected',
      description: `Creating project from ${template.name} template`,
    });
    onSelectTemplate(template);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-6">
        <h2 className="text-2xl font-bold mb-4">Project Templates</h2>
        <p className="text-muted-foreground mb-6">
          Choose from our curated collection of project templates to get started quickly
        </p>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="web">Web</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="fullstack">Full Stack</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Levels</TabsTrigger>
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 group">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                      {getCategoryIcon(template.category)}
                      <span className="ml-1 capitalize">{template.category}</span>
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {template.estimatedTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4" />
                        {template.learningObjectives.length} objectives
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Key Features:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {template.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button 
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full"
                  >
                    Use This Template
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4 rounded-full bg-muted p-3 w-fit mx-auto">
              <SearchIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all templates
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}