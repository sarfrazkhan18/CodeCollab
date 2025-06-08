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
      url: '',
      framework: 'react',
      buildCommand: 'npm run build',
      startCommand: 'npm run dev',
      ...config
    };

    this.previews.set(projectId, defaultConfig);
    return defaultConfig;
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
      this.iframe.src = config.url;
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
      this.iframe.contentWindow.postMessage({
        type: 'hot-reload',
        payload: { type, files }
      }, '*');
    }
  }
}

export const previewService = PreviewService.getInstance();