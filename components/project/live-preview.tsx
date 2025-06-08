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
  AlertCircleIcon
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

      // Validate that we have the necessary files
      const hasPackageJson = 'package.json' in files;
      if (!hasPackageJson) {
        throw new Error('package.json not found in project files');
      }

      toast({
        title: 'Starting preview',
        description: 'Setting up the project environment...',
      });
      
      // Initialize WebContainer and create project
      await webContainerService.createProject(files);
      
      // Install dependencies
      toast({
        title: 'Installing dependencies',
        description: 'This may take a moment...',
      });
      
      try {
        await webContainerService.installDependencies();
      } catch (installError) {
        console.warn('Dependency installation failed, continuing anyway:', installError);
      }
      
      // Start development server
      toast({
        title: 'Starting server',
        description: 'Launching development server...',
      });
      
      const serverUrl = await webContainerService.startDevServer();
      
      // Create preview configuration
      const config = await previewService.createPreview(projectId, {
        url: serverUrl,
        framework: 'react',
        port: 3000
      });
      
      setPreviewConfig(config);
      setPreviewUrl(serverUrl);
      setIsServerRunning(true);
      
      toast({
        title: 'Preview ready',
        description: 'Your application is now running!',
      });
      
    } catch (error: any) {
      console.error('Failed to start preview:', error);
      setError(error.message || 'Failed to start preview');
      toast({
        title: 'Preview failed',
        description: error.message || 'Failed to start the development server',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPreview = () => {
    if (iframeRef.current && previewUrl) {
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

  const handleFileChange = async (changedFiles: string[]) => {
    if (isServerRunning) {
      // Trigger hot reload
      await previewService.hotReload(projectId, changedFiles);
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
                Running
              </Badge>
            )}
            {error && (
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                Error
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
              {isServerRunning ? 'Restart' : 'Start'}
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
              {previewUrl}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4">
        {error ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-red-200 rounded-lg bg-red-50/50">
            <div className="text-center">
              <AlertCircleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold mb-2 text-red-700">Preview Error</h3>
              <p className="text-red-600 mb-4 max-w-md">
                {error}
              </p>
              <Button onClick={startPreview} disabled={isLoading}>
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                ) : (
                  <PlayIcon className="h-4 w-4 mr-2" />
                )}
                Try Again
              </Button>
            </div>
          </div>
        ) : !previewUrl ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <MonitorIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Preview Available</h3>
              <p className="text-muted-foreground mb-4">
                Start the development server to see your application
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