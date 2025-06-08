export interface TerminalSession {
  id: string;
  name: string;
  cwd: string;
  isActive: boolean;
  history: TerminalOutput[];
}

export interface TerminalOutput {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export class TerminalService {
  private static instance: TerminalService;
  private sessions: Map<string, TerminalSession> = new Map();
  private activeSessionId: string | null = null;

  private constructor() {}

  static getInstance(): TerminalService {
    if (!TerminalService.instance) {
      TerminalService.instance = new TerminalService();
    }
    return TerminalService.instance;
  }

  createSession(name: string = 'Terminal', cwd: string = '/'): TerminalSession {
    const id = Math.random().toString(36).substring(2, 15);
    const session: TerminalSession = {
      id,
      name,
      cwd,
      isActive: false,
      history: []
    };

    this.sessions.set(id, session);
    
    if (!this.activeSessionId) {
      this.setActiveSession(id);
    }

    return session;
  }

  setActiveSession(sessionId: string): void {
    // Deactivate current session
    if (this.activeSessionId) {
      const currentSession = this.sessions.get(this.activeSessionId);
      if (currentSession) {
        currentSession.isActive = false;
      }
    }

    // Activate new session
    const newSession = this.sessions.get(sessionId);
    if (newSession) {
      newSession.isActive = true;
      this.activeSessionId = sessionId;
    }
  }

  async executeCommand(sessionId: string, command: string): Promise<TerminalOutput[]> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Add command to history
    const commandOutput: TerminalOutput = {
      id: Math.random().toString(36).substring(2, 15),
      type: 'command',
      content: `$ ${command}`,
      timestamp: new Date()
    };

    session.history.push(commandOutput);

    try {
      // Execute command (this would integrate with WebContainer)
      const result = await this.runCommand(command, session.cwd);
      
      const output: TerminalOutput = {
        id: Math.random().toString(36).substring(2, 15),
        type: result.exitCode === 0 ? 'output' : 'error',
        content: result.output,
        timestamp: new Date()
      };

      session.history.push(output);
      return [commandOutput, output];
    } catch (error) {
      const errorOutput: TerminalOutput = {
        id: Math.random().toString(36).substring(2, 15),
        type: 'error',
        content: `Error: ${error}`,
        timestamp: new Date()
      };

      session.history.push(errorOutput);
      return [commandOutput, errorOutput];
    }
  }

  private async runCommand(command: string, cwd: string): Promise<{
    output: string;
    exitCode: number;
  }> {
    // Parse command
    const [cmd, ...args] = command.trim().split(' ');

    // Handle built-in commands
    switch (cmd) {
      case 'ls':
        return {
          output: 'src/\npackage.json\nREADME.md\nnode_modules/',
          exitCode: 0
        };
      case 'pwd':
        return {
          output: cwd,
          exitCode: 0
        };
      case 'cd':
        // Change directory logic would go here
        return {
          output: '',
          exitCode: 0
        };
      case 'npm':
        if (args[0] === 'install') {
          return {
            output: 'Installing dependencies...\nDependencies installed successfully!',
            exitCode: 0
          };
        }
        if (args[0] === 'run' && args[1] === 'dev') {
          return {
            output: 'Starting development server...\nServer running on http://localhost:3000',
            exitCode: 0
          };
        }
        break;
      case 'git':
        return this.handleGitCommand(args);
      default:
        return {
          output: `Command not found: ${cmd}`,
          exitCode: 1
        };
    }

    return {
      output: `Command executed: ${command}`,
      exitCode: 0
    };
  }

  private handleGitCommand(args: string[]): { output: string; exitCode: number } {
    const subcommand = args[0];
    
    switch (subcommand) {
      case 'status':
        return {
          output: `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   src/App.tsx
  
Untracked files:
  src/components/NewComponent.tsx`,
          exitCode: 0
        };
      case 'add':
        return {
          output: '',
          exitCode: 0
        };
      case 'commit':
        return {
          output: '[main abc123] Commit message\n 2 files changed, 10 insertions(+), 5 deletions(-)',
          exitCode: 0
        };
      case 'push':
        return {
          output: 'Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nTo github.com:user/repo.git\n   abc123..def456  main -> main',
          exitCode: 0
        };
      default:
        return {
          output: `git: '${subcommand}' is not a git command.`,
          exitCode: 1
        };
    }
  }

  getSession(sessionId: string): TerminalSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): TerminalSession[] {
    return Array.from(this.sessions.values());
  }

  getActiveSession(): TerminalSession | null {
    if (!this.activeSessionId) return null;
    return this.sessions.get(this.activeSessionId) || null;
  }

  closeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    if (this.activeSessionId === sessionId) {
      const remainingSessions = Array.from(this.sessions.keys());
      this.activeSessionId = remainingSessions.length > 0 ? remainingSessions[0] : null;
    }
  }

  clearHistory(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.history = [];
    }
  }
}

export const terminalService = TerminalService.getInstance();