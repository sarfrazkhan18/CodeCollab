import { WebContainer, FileSystemTree } from '@webcontainer/api';

export class WebContainerService {
  private static instance: WebContainerService;
  private webcontainer: WebContainer | null = null;
  private isBooting = false;
  private serverProcess: any = null;
  private serverUrl: string | null = null;
  private isAvailable = false;

  private constructor() {
    this.checkAvailability();
  }

  static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }

  private async checkAvailability(): Promise<void> {
    try {
      // Check if WebContainer is available in this environment
      if (typeof window !== 'undefined' && 'SharedArrayBuffer' in window) {
        this.isAvailable = true;
      } else {
        console.warn('WebContainer not available in this environment');
        this.isAvailable = false;
      }
    } catch (error) {
      console.warn('WebContainer availability check failed:', error);
      this.isAvailable = false;
    }
  }

  async initialize(): Promise<WebContainer | null> {
    if (!this.isAvailable) {
      throw new Error('WebContainer is not available in this environment');
    }

    if (this.webcontainer) {
      return this.webcontainer;
    }

    if (this.isBooting) {
      // Wait for existing boot process
      while (this.isBooting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.webcontainer;
    }

    try {
      this.isBooting = true;
      this.webcontainer = await WebContainer.boot();
      this.isBooting = false;
      return this.webcontainer;
    } catch (error) {
      this.isBooting = false;
      console.error('WebContainer initialization failed:', error);
      throw new Error(`Failed to initialize WebContainer: ${error}`);
    }
  }

  async createProject(files: Record<string, string>): Promise<void> {
    if (!this.isAvailable) {
      // In environments where WebContainer isn't available, just return
      console.warn('WebContainer not available, skipping project creation');
      return;
    }

    const container = await this.initialize();
    if (!container) return;
    
    // Transform flat files object to FileSystemTree
    const fileSystemTree = this.transformToFileSystemTree(files);
    await container.mount(fileSystemTree);
  }

  private transformToFileSystemTree(files: Record<string, string>): FileSystemTree {
    const tree: FileSystemTree = {};

    for (const [filePath, content] of Object.entries(files)) {
      const pathParts = filePath.split('/').filter(part => part !== '');
      let current = tree;

      // Navigate/create directory structure
      for (let i = 0; i < pathParts.length - 1; i++) {
        const dirName = pathParts[i];
        if (!current[dirName]) {
          current[dirName] = {
            directory: {}
          };
        }
        current = current[dirName].directory!;
      }

      // Add the file
      const fileName = pathParts[pathParts.length - 1];
      current[fileName] = {
        file: {
          contents: content
        }
      };
    }

    return tree;
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (!this.isAvailable) return;
    
    const container = await this.initialize();
    if (!container) return;
    
    await container.fs.writeFile(path, content);
  }

  async readFile(path: string): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('WebContainer not available');
    }
    
    const container = await this.initialize();
    if (!container) throw new Error('Container not initialized');
    
    const file = await container.fs.readFile(path, 'utf-8');
    return file;
  }

  async installDependencies(): Promise<void> {
    if (!this.isAvailable) {
      console.warn('WebContainer not available, skipping dependency installation');
      return;
    }

    const container = await this.initialize();
    if (!container) return;
    
    const installProcess = await container.spawn('npm', ['install']);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Dependency installation timeout'));
      }, 60000); // 1 minute timeout

      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log('npm install:', data);
        }
      }));

      installProcess.exit.then((code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });
    });
  }

  async startDevServer(): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('WebContainer not available for development server');
    }

    if (this.serverUrl && this.serverProcess) {
      return this.serverUrl;
    }

    const container = await this.initialize();
    if (!container) throw new Error('Container not initialized');
    
    try {
      // Kill existing server process if any
      if (this.serverProcess) {
        this.serverProcess.kill();
      }

      // Start the development server
      this.serverProcess = await container.spawn('npm', ['run', 'dev']);
      
      // Wait for server to be ready and get the URL
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Server startup timeout'));
        }, 30000); // 30 second timeout

        container.on('server-ready', (port: number, url: string) => {
          clearTimeout(timeout);
          this.serverUrl = url;
          console.log(`Development server ready at ${url}`);
          resolve(url);
        });

        // Listen for process output to detect when server is ready
        this.serverProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('Server output:', data);
            // Look for Next.js ready message
            if (data.includes('Ready') || data.includes('localhost:3000')) {
              clearTimeout(timeout);
              const url = 'http://localhost:3000';
              this.serverUrl = url;
              resolve(url);
            }
          }
        }));

        // Handle process exit
        this.serverProcess.exit.then((code: number) => {
          if (code !== 0) {
            clearTimeout(timeout);
            reject(new Error(`Development server exited with code ${code}`));
          }
        });
      });
    } catch (error) {
      throw new Error(`Failed to start development server: ${error}`);
    }
  }

  async executeCommand(command: string, args: string[] = []): Promise<{
    output: string;
    exitCode: number;
  }> {
    if (!this.isAvailable) {
      // Return mock output for environments where WebContainer isn't available
      return {
        output: `Command executed: ${command} ${args.join(' ')}\n(WebContainer not available)`,
        exitCode: 0
      };
    }

    const container = await this.initialize();
    if (!container) {
      return {
        output: 'Container not available',
        exitCode: 1
      };
    }
    
    const process = await container.spawn(command, args);
    
    let output = '';
    
    process.output.pipeTo(new WritableStream({
      write(data) {
        output += data;
      }
    }));

    const exitCode = await process.exit;
    return { output, exitCode };
  }

  getContainer(): WebContainer | null {
    return this.webcontainer;
  }

  getServerUrl(): string | null {
    return this.serverUrl;
  }

  async stopServer(): Promise<void> {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
      this.serverUrl = null;
    }
  }

  isWebContainerAvailable(): boolean {
    return this.isAvailable;
  }
}

export const webContainerService = WebContainerService.getInstance();