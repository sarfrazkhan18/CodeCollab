export interface PreviewConfig {
  port: number;
  url: string;
  framework: 'react' | 'vue' | 'vanilla' | 'node';
  buildCommand?: string;
  startCommand?: string;
}

export class PreviewService {
  private static instance: PreviewService;
  private previews: Map<string, PreviewConfig> = new Map();
  private iframe: HTMLIFrameElement | null = null;

  private constructor() {}

  static getInstance(): PreviewService {
    if (!PreviewService.instance) {
      PreviewService.instance = new PreviewService();
    }
    return PreviewService.instance;
  }

  async createPreview(projectId: string, config: Partial<PreviewConfig>): Promise<PreviewConfig> {
    const defaultConfig: PreviewConfig = {
      port: 3000,
      url: config.url || this.generateFallbackUrl(),
      framework: 'react',
      buildCommand: 'npm run build',
      startCommand: 'npm run dev',
      ...config
    };

    this.previews.set(projectId, defaultConfig);
    return defaultConfig;
  }

  private generateFallbackUrl(): string {
    // Generate a data URL or blob URL for static content
    return 'about:blank';
  }

  async updatePreview(projectId: string, url: string): Promise<void> {
    const config = this.previews.get(projectId);
    if (config) {
      config.url = url;
      this.refreshPreview(projectId);
    }
  }

  refreshPreview(projectId: string): void {
    const config = this.previews.get(projectId);
    if (config && this.iframe) {
      // Add timestamp to force refresh
      const refreshUrl = config.url.includes('?') 
        ? `${config.url}&t=${Date.now()}`
        : `${config.url}?t=${Date.now()}`;
      this.iframe.src = refreshUrl;
    }
  }

  setIframe(iframe: HTMLIFrameElement): void {
    this.iframe = iframe;
  }

  getPreview(projectId: string): PreviewConfig | undefined {
    return this.previews.get(projectId);
  }

  async hotReload(projectId: string, changedFiles: string[]): Promise<void> {
    // Implement hot reload logic based on framework
    const config = this.previews.get(projectId);
    if (!config) return;

    switch (config.framework) {
      case 'react':
        // React Fast Refresh
        this.sendHotReloadMessage('react-refresh', changedFiles);
        break;
      case 'vue':
        // Vue Hot Reload
        this.sendHotReloadMessage('vue-reload', changedFiles);
        break;
      default:
        // Full page reload
        this.refreshPreview(projectId);
    }
  }

  private sendHotReloadMessage(type: string, files: string[]): void {
    if (this.iframe && this.iframe.contentWindow) {
      try {
        this.iframe.contentWindow.postMessage({
          type: 'hot-reload',
          payload: { type, files }
        }, '*');
      } catch (error) {
        console.warn('Failed to send hot reload message:', error);
      }
    }
  }

  // Method to check if preview is available
  async checkPreviewAvailability(url: string): Promise<boolean> {
    try {
      // For blob URLs or data URLs, assume they're available
      if (url.startsWith('blob:') || url.startsWith('data:')) {
        return true;
      }
      
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Generate static HTML preview
  generateStaticPreview(files: Record<string, string>): string {
    const mainFile = files['app/page.tsx'] || files['src/App.tsx'] || files['index.html'];
    
    if (!mainFile) {
      return this.getDefaultPreviewHTML(Object.keys(files).length);
    }

    // Basic HTML wrapper for React components
    if (mainFile.includes('export default') || mainFile.includes('function')) {
      return this.getReactPreviewHTML();
    }

    return mainFile;
  }

  private getDefaultPreviewHTML(fileCount: number): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div class="mb-6">
            <svg class="h-16 w-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mb-3">Project Preview</h1>
          <p class="text-gray-600 mb-6">Your project is ready for development</p>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-blue-700 font-medium">Files loaded: ${fileCount}</p>
            <p class="text-xs text-blue-600 mt-1">Start the development server for live updates</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getReactPreviewHTML(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gradient-to-br from-purple-50 to-pink-100 min-h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-xl shadow-lg max-w-2xl">
          <div class="flex items-center mb-6">
            <svg class="h-10 w-10 text-blue-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
            <h1 class="text-3xl font-bold text-gray-800">React Component</h1>
          </div>
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
            <h2 class="text-lg font-semibold text-gray-700 mb-3">Component Ready</h2>
            <ul class="text-sm text-gray-600 space-y-2">
              <li class="flex items-center">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                React component structure detected
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                TypeScript support enabled
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Tailwind CSS available
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Ready for development
              </li>
            </ul>
          </div>
          <div class="text-center">
            <p class="text-gray-500 text-sm">
              Start the development server to see your component in action
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const previewService = PreviewService.getInstance();