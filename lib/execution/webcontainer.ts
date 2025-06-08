import { WebContainer, FileSystemTree } from '@webcontainer/api';

export class WebContainerService {
  private static instance: WebContainerService;
  private webcontainer: WebContainer | null = null;
  private isBooting = false;

  private constructor() {}

  static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }

  async initialize(): Promise<WebContainer> {
    if (this.webcontainer) {
      return this.webcontainer;
    }

    if (this.isBooting) {
      // Wait for existing boot process
      while (this.isBooting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.webcontainer!;
    }

    try {
      this.isBooting = true;
      this.webcontainer = await WebContainer.boot();
      this.isBooting = false;
      return this.webcontainer;
    } catch (error) {
      this.isBooting = false;
      throw new Error(`Failed to initialize WebContainer: ${error}`);
    }
  }

  async createProject(files: Record<string, string>): Promise<void> {
    const container = await this.initialize();
    
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
    const container = await this.initialize();
    await container.fs.writeFile(path, content);
  }

  async readFile(path: string): Promise<string> {
    const container = await this.initialize();
    const file = await container.fs.readFile(path, 'utf-8');
    return file;
  }

  async installDependencies(): Promise<void> {
    const container = await this.initialize();
    const installProcess = await container.spawn('npm', ['install']);
    
    return new Promise((resolve, reject) => {
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log(data);
        }
      }));

      installProcess.exit.then((code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });
    });
  }

  async startDevServer(): Promise<string> {
    const container = await this.initialize();
    const serverProcess = await container.spawn('npm', ['run', 'dev']);
    
    // Wait for server to be ready
    container.on('server-ready', (port, url) => {
      console.log(`Server ready at ${url}`);
    });

    return new Promise((resolve) => {
      container.on('server-ready', (port, url) => {
        resolve(url);
      });
    });
  }

  async executeCommand(command: string, args: string[] = []): Promise<{
    output: string;
    exitCode: number;
  }> {
    const container = await this.initialize();
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
}

export const webContainerService = WebContainerService.getInstance();