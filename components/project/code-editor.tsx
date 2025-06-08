'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { BrainCircuitIcon, PlayIcon, SaveIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeEditorProps {
  filePath: string;
}

export function CodeEditor({ filePath }: CodeEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [fileContent, setFileContent] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        setIsLoading(true);
        
        // Determine language based on file extension
        const extension = filePath.split('.').pop()?.toLowerCase();
        
        if (extension === 'js') setLanguage('javascript');
        else if (extension === 'ts') setLanguage('typescript');
        else if (extension === 'jsx' || extension === 'tsx') setLanguage('typescript');
        else if (extension === 'css') setLanguage('css');
        else if (extension === 'html') setLanguage('html');
        else if (extension === 'json') setLanguage('json');
        else if (extension === 'py') setLanguage('python');
        else setLanguage('typescript');
        
        // In a real app, this would fetch file content from Supabase
        // For demo purposes, we're using mock data
        const response = await fetch(`/api/files/${encodeURIComponent(filePath)}`);
        if (!response.ok) throw new Error('Failed to fetch file content');
        
        const data = await response.json();
        setFileContent(data.content);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading file:', error);
        setFileContent(`// Error loading file: ${filePath}`);
        setIsLoading(false);
      }
    };

    fetchFileContent();
  }, [filePath]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFileContent(value);
    }
  };

  const handleSave = async () => {
    try {
      // In production, this would save to your backend
      toast({
        title: 'File saved',
        description: `Successfully saved ${filePath}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save file',
        variant: 'destructive',
      });
    }
  };

  const handleAIAssist = async () => {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: 'frontend-specialist',
          messages: [
            {
              role: 'user',
              content: `Please suggest improvements for this code:\n\n${fileContent}`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI suggestions');
      
      const data = await response.json();
      setSuggestions([data.content]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI suggestions',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium">{filePath}</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleAIAssist}>
            <BrainCircuitIcon className="h-4 w-4 mr-2" />
            AI Assist
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="ghost" size="sm">
            <PlayIcon className="h-4 w-4 mr-2" />
            Run
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage={language}
            value={fileContent}
            onChange={handleEditorChange}
            loading={isLoading}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              theme: 'vs-dark',
            }}
          />
        </div>

        {suggestions.length > 0 && (
          <>
            <Separator orientation="vertical" />
            <div className="w-80 border-l">
              <div className="p-4">
                <h3 className="text-sm font-medium mb-2">AI Suggestions</h3>
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="prose prose-sm">
                      <pre className="whitespace-pre-wrap">{suggestion}</pre>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}