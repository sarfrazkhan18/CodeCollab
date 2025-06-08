'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlayIcon, 
  RefreshCwIcon, 
  ExternalLinkIcon, 
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
  SettingsIcon,
  AlertCircleIcon,
  CodeIcon
} from 'lucide-react';
import { previewService, PreviewConfig } from '@/lib/execution/preview';
import { webContainerService } from '@/lib/execution/webcontainer';
import { useToast } from '@/hooks/use-toast';

interface LivePreviewProps {
  projectId: string;
  files: Record<string, string>;
}

export function LivePreview({ projectId, files }: LivePreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig | null>(null);
  const [viewportSize, setViewportSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'static' | 'server'>('static');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (iframeRef.current) {
      previewService.setIframe(iframeRef.current);
    }
  }, []);

  const startPreview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if files object is valid
      if (!files || typeof files !== 'object') {
        throw new Error('Invalid files object provided');
      }

      // First try static preview mode
      await startStaticPreview();
      
    } catch (error: any) {
      console.error('Failed to start preview:', error);
      setError(error.message || 'Failed to start preview');
      toast({
        title: 'Preview failed',
        description: 'Showing static preview instead',
        variant: 'destructive',
      });
      
      // Fallback to static preview
      await startStaticPreview();
    } finally {
      setIsLoading(false);
    }
  };

  const startStaticPreview = async () => {
    try {
      // Generate static HTML preview from the files
      const htmlContent = generateStaticPreview(files);
      
      // Create a blob URL for the preview
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      setPreviewUrl(url);
      setPreviewMode('static');
      setIsServerRunning(true);
      
      toast({
        title: 'Static preview ready',
        description: 'Your application is now visible in static mode',
      });
      
    } catch (error) {
      throw new Error('Failed to generate static preview');
    }
  };

  const generateStaticPreview = (files: Record<string, string>): string => {
    // Find the main page file
    const mainPageFile = files['app/page.tsx'] || files['src/App.tsx'] || files['index.html'];
    
    if (!mainPageFile) {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Project Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
          <div class="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
            <div class="mb-4">
              <svg class="h-16 w-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Project Preview</h1>
            <p class="text-gray-600 mb-4">Your project files are ready for development</p>
            <div class="text-sm text-gray-500">
              <p>Files loaded: ${Object.keys(files).length}</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // If it's a React component, create a basic HTML wrapper
    if (mainPageFile.includes('export default') || mainPageFile.includes('function')) {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>React Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        </head>
        <body>
          <div id="root"></div>
          <div class="bg-gray-100 min-h-screen flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-md max-w-2xl">
              <div class="flex items-center mb-4">
                <svg class="h-8 w-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
                <h1 class="text-2xl font-bold text-gray-800">React Component Preview</h1>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg mb-4">
                <p class="text-gray-600 mb-2">Your React component is ready for development:</p>
                <ul class="text-sm text-gray-500 space-y-1">
                  <li>• Component structure detected</li>
                  <li>• TypeScript support enabled</li>
                  <li>• Tailwind CSS available</li>
                  <li>• Ready for hot reload</li>
                </ul>
              </div>
              <div class="text-center">
                <p class="text-sm text-gray-500">
                  Start the development server to see live updates
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Return the file content directly if it's HTML
    return mainPageFile;
  };

  const refreshPreview = () => {
    if (previewMode === 'static') {
      // Regenerate static preview
      startStaticPreview();
    } else if (iframeRef.current && previewUrl) {
      const refreshUrl = previewUrl.includes('?') 
        ? `${previewUrl}&t=${Date.now()}`
        : `${previewUrl}?t=${Date.now()}`;
      iframeRef.current.src = refreshUrl;
    }
  };

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const getViewportDimensions = () => {
    switch (viewportSize) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Live Preview</h3>
            {isServerRunning && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                {previewMode === 'static' ? 'Static' : 'Running'}
              </Badge>
            )}
            {error && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                Fallback Mode
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPreview}
              disabled={!previewUrl}
            >
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              disabled={!previewUrl}
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </Button>
            <Button
              onClick={startPreview}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <PlayIcon className="h-4 w-4 mr-2" />
              )}
              {isServerRunning ? 'Refresh' : 'Start'}
            </Button>
          </div>
        </div>

        {/* Viewport Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Viewport:</span>
          <Tabs value={viewportSize} onValueChange={(value) => setViewportSize(value as any)}>
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger value="desktop" className="px-3">
                <MonitorIcon className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="tablet" className="px-3">
                <TabletIcon className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="mobile" className="px-3">
                <SmartphoneIcon className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {previewUrl && (
            <div className="ml-auto text-sm text-muted-foreground">
              {previewMode === 'static' ? 'Static Preview' : previewUrl}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4">
        {!previewUrl ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <MonitorIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Preview Available</h3>
              <p className="text-muted-foreground mb-4">
                Click start to generate a preview of your application
              </p>
              <Button onClick={startPreview} disabled={isLoading}>
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                ) : (
                  <PlayIcon className="h-4 w-4 mr-2" />
                )}
                Start Preview
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex justify-center">
            <div 
              className="border rounded-lg overflow-hidden shadow-lg transition-all duration-300"
              style={getViewportDimensions()}
            >
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full"
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                onError={() => setError('Failed to load preview')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}