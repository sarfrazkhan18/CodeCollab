// Conditional import for WebContainer to avoid build errors
let WebContainer: any = null;
let FileSystemTree: any = null;

if (typeof window !== 'undefined') {
  try {
    const webcontainerModule = require('@webcontainer/api');
    WebContainer = webcontainerModule.WebContainer;
    FileSystemTree = webcontainerModule.FileSystemTree;
  } catch (error) {
    console.warn('WebContainer not available:', error);
  }
}

export class WebContainerService {
  private static instance: WebContainerService;
  private webcontainer: any = null;
  private isBooting = false;
  private serverProcess: any = null;
  private serverUrl: string | null = null;
  private isAvailable = false;
  private activeTimeouts: Set<NodeJS.Timeout> = new Set();
  private activeProcesses: Set<any> = new Set();

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
      // Check if we're in browser environment and WebContainer is available
      if (typeof window !== 'undefined' && WebContainer && 'SharedArrayBuffer' in window) {
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

  private createSafeTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timeoutId = setTimeout(() => {
      this.activeTimeouts.delete(timeoutId);
      try {
        callback();
      } catch (error) {
        console.error('Timeout callback error:', error);
      }
    }, delay);
    this.activeTimeouts.add(timeoutId);
    return timeoutId;
  }

  private clearSafeTimeout(timeoutId: NodeJS.Timeout): void {
    clearTimeout(timeoutId);
    this.activeTimeouts.delete(timeoutId);
  }

  private clearAllTimeouts(): void {
    this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.activeTimeouts.clear();
  }

  async initialize(): Promise<any> {
    if (!this.isAvailable || !WebContainer) {
      throw new Error('WebContainer is not available in this environment');
    }

    if (this.webcontainer) {
      return this.webcontainer;
    }

    if (this.isBooting) {
      // Wait for existing boot process with proper timeout handling
      return new Promise((resolve, reject) => {
        const checkInterval = 100;
        const maxWait = 30000; // 30 seconds
        let elapsed = 0;

        const intervalId = setInterval(() => {
          elapsed += checkInterval;
          if (!this.isBooting && this.webcontainer) {
            clearInterval(intervalId);
            resolve(this.webcontainer);
          } else if (elapsed >= maxWait) {
            clearInterval(intervalId);
            reject(new Error('WebContainer boot timeout'));
          }
        }, checkInterval);
      });
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

  private transformToFileSystemTree(files: Record<string, string>): any {
    const tree: any = {};

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
        current = current[dirName].directory;
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
    this.activeProcesses.add(installProcess);
    
    return new Promise((resolve, reject) => {
      let isResolved = false;
      
      const timeoutId = this.createSafeTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          this.activeProcesses.delete(installProcess);
          reject(new Error('Dependency installation timeout'));
        }
      }, 60000); // 1 minute timeout

      if (installProcess.output && installProcess.output.pipeTo) {
        try {
          installProcess.output.pipeTo(new WritableStream({
            write(data: string) {
              console.log('npm install:', data);
            }
          }));
        } catch (error) {
          console.warn('Failed to pipe install output:', error);
        }
      }

      installProcess.exit.then((code: number) => {
        if (!isResolved) {
          isResolved = true;
          this.clearSafeTimeout(timeoutId);
          this.activeProcesses.delete(installProcess);
          
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`npm install failed with code ${code}`));
          }
        }
      }).catch((error: any) => {
        if (!isResolved) {
          isResolved = true;
          this.clearSafeTimeout(timeoutId);
          this.activeProcesses.delete(installProcess);
          reject(new Error(`npm install process error: ${error}`));
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
        this.activeProcesses.delete(this.serverProcess);
        try {
          this.serverProcess.kill();
        } catch (error) {
          console.warn('Failed to kill existing server process:', error);
        }
      }

      // Start the development server
      this.serverProcess = await container.spawn('npm', ['run', 'dev']);
      this.activeProcesses.add(this.serverProcess);
      
      // Wait for server to be ready and get the URL
      return new Promise((resolve, reject) => {
        let isResolved = false;
        
        const timeoutId = this.createSafeTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            reject(new Error('Server startup timeout'));
          }
        }, 30000); // 30 second timeout

        if (container.on) {
          container.on('server-ready', (port: number, url: string) => {
            if (!isResolved) {
              isResolved = true;
              this.clearSafeTimeout(timeoutId);
              this.serverUrl = url;
              console.log(`Development server ready at ${url}`);
              resolve(url);
            }
          });
        }

        // Listen for process output to detect when server is ready
        if (this.serverProcess.output && this.serverProcess.output.pipeTo) {
          try {
            this.serverProcess.output.pipeTo(new WritableStream({
              write: (data: string) => {
                console.log('Server output:', data);
                // Look for Next.js ready message
                if (!isResolved && (data.includes('Ready') || data.includes('localhost:3000'))) {
                  isResolved = true;
                  this.clearSafeTimeout(timeoutId);
                  const url = 'http://localhost:3000';
                  this.serverUrl = url;
                  resolve(url);
                }
              }
            }));
          } catch (error) {
            console.warn('Failed to pipe server output:', error);
          }
        }

        // Handle process exit
        if (this.serverProcess.exit) {
          this.serverProcess.exit.then((code: number) => {
            if (!isResolved && code !== 0) {
              isResolved = true;
              this.clearSafeTimeout(timeoutId);
              reject(new Error(`Development server exited with code ${code}`));
            }
          }).catch((error: any) => {
            if (!isResolved) {
              isResolved = true;
              this.clearSafeTimeout(timeoutId);
              reject(new Error(`Development server process error: ${error}`));
            }
          });
        }
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
    this.activeProcesses.add(process);
    
    let output = '';
    
    if (process.output && process.output.pipeTo) {
      try {
        process.output.pipeTo(new WritableStream({
          write(data: string) {
            output += data;
          }
        }));
      } catch (error) {
        console.warn('Failed to pipe command output:', error);
      }
    }

    try {
      const exitCode = await process.exit;
      this.activeProcesses.delete(process);
      return { output, exitCode };
    } catch (error) {
      this.activeProcesses.delete(process);
      throw error;
    }
  }

  getContainer(): any {
    return this.webcontainer;
  }

  getServerUrl(): string | null {
    return this.serverUrl;
  }

  async stopServer(): Promise<void> {
    if (this.serverProcess) {
      this.activeProcesses.delete(this.serverProcess);
      try {
        this.serverProcess.kill();
      } catch (error) {
        console.warn('Failed to stop server process:', error);
      }
      this.serverProcess = null;
      this.serverUrl = null;
    }
  }

  async cleanup(): Promise<void> {
    // Clear all timeouts
    this.clearAllTimeouts();
    
    // Stop all active processes
    for (const process of this.activeProcesses) {
      try {
        if (process && process.kill) {
          process.kill();
        }
      } catch (error) {
        console.warn('Failed to kill process during cleanup:', error);
      }
    }
    this.activeProcesses.clear();
    
    // Stop server
    await this.stopServer();
  }

  isWebContainerAvailable(): boolean {
    return this.isAvailable;
  }
}

export const webContainerService = WebContainerService.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    webContainerService.cleanup();
  });
}