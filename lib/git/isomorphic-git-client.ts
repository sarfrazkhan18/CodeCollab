import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { webContainerService } from '@/lib/execution/webcontainer';

export interface GitConfig {
  username: string;
  email: string;
  token?: string;
  provider?: 'github' | 'gitlab' | 'bitbucket';
}

export interface GitRepository {
  name: string;
  url: string;
  branch: string;
  remote: string;
  lastCommit?: {
    hash: string;
    message: string;
    author: string;
    date: Date;
  };
}

export interface GitStatus {
  modified: string[];
  added: string[];
  deleted: string[];
  untracked: string[];
  staged: string[];
  ahead: number;
  behind: number;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  email: string;
  date: Date;
}

export class IsomorphicGitService {
  private static instance: IsomorphicGitService;
  private config: GitConfig | null = null;
  private currentRepo: GitRepository | null = null;
  private fs: any = null;

  private constructor() {
    this.initializeFilesystem();
  }

  static getInstance(): IsomorphicGitService {
    if (!IsomorphicGitService.instance) {
      IsomorphicGitService.instance = new IsomorphicGitService();
    }
    return IsomorphicGitService.instance;
  }

  private async initializeFilesystem() {
    try {
      const container = await webContainerService.initialize();
      if (container) {
        this.fs = container.fs;
      }
    } catch (error) {
      console.warn('WebContainer not available, using fallback filesystem');
      // Fallback to in-memory filesystem for environments without WebContainer
      this.fs = new Map();
    }
  }

  setConfig(config: GitConfig): void {
    this.config = config;
  }

  getConfig(): GitConfig | null {
    return this.config;
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.config?.token) return {};
    
    switch (this.config.provider) {
      case 'github':
        return {
          'Authorization': `token ${this.config.token}`,
          'User-Agent': 'CodeCollab-AI'
        };
      case 'gitlab':
        return {
          'Authorization': `Bearer ${this.config.token}`,
          'User-Agent': 'CodeCollab-AI'
        };
      default:
        return {
          'Authorization': `Bearer ${this.config.token}`,
          'User-Agent': 'CodeCollab-AI'
        };
    }
  }

  async initRepository(dir: string = '/project'): Promise<void> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    try {
      await git.init({ fs: this.fs, dir });
      
      if (this.config) {
        await git.setConfig({
          fs: this.fs,
          dir,
          path: 'user.name',
          value: this.config.username
        });
        
        await git.setConfig({
          fs: this.fs,
          dir,
          path: 'user.email',
          value: this.config.email
        });
      }
    } catch (error) {
      throw new Error(`Failed to initialize repository: ${error}`);
    }
  }

  async cloneRepository(url: string, dir: string = '/project', branch: string = 'main'): Promise<GitRepository> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    if (!this.config) {
      throw new Error('Git configuration not set');
    }

    try {
      await git.clone({
        fs: this.fs,
        http,
        dir,
        url,
        ref: branch,
        singleBranch: true,
        depth: 1,
        headers: this.getAuthHeaders(),
        onAuth: () => ({
          username: this.config!.username,
          password: this.config!.token || ''
        })
      });

      const repoName = url.split('/').pop()?.replace('.git', '') || 'repository';
      const lastCommit = await this.getLastCommit(dir);

      const repository: GitRepository = {
        name: repoName,
        url,
        branch,
        remote: 'origin',
        lastCommit
      };

      this.currentRepo = repository;
      return repository;
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error}`);
    }
  }

  async getStatus(dir: string = '/project'): Promise<GitStatus> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    try {
      const status = await git.statusMatrix({ fs: this.fs, dir });
      const result: GitStatus = {
        modified: [],
        added: [],
        deleted: [],
        untracked: [],
        staged: [],
        ahead: 0,
        behind: 0
      };

      for (const [filepath, head, workdir, stage] of status) {
        if (head === 1 && workdir === 2 && stage === 1) {
          result.modified.push(filepath);
        } else if (head === 0 && workdir === 2 && stage === 0) {
          result.untracked.push(filepath);
        } else if (head === 1 && workdir === 0 && stage === 1) {
          result.deleted.push(filepath);
        } else if (stage === 2) {
          result.staged.push(filepath);
        } else if (head === 0 && workdir === 2 && stage === 2) {
          result.added.push(filepath);
        }
      }

      // Get ahead/behind counts
      try {
        const currentBranch = await git.currentBranch({ fs: this.fs, dir });
        if (currentBranch) {
          const commits = await git.log({ fs: this.fs, dir, ref: currentBranch });
          const remoteCommits = await git.log({ fs: this.fs, dir, ref: `origin/${currentBranch}` });
          result.ahead = commits.length - remoteCommits.length;
        }
      } catch (error) {
        console.warn('Could not determine ahead/behind status:', error);
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to get status: ${error}`);
    }
  }

  async stageFiles(files: string[], dir: string = '/project'): Promise<void> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    try {
      for (const file of files) {
        await git.add({ fs: this.fs, dir, filepath: file });
      }
    } catch (error) {
      throw new Error(`Failed to stage files: ${error}`);
    }
  }

  async unstageFiles(files: string[], dir: string = '/project'): Promise<void> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    try {
      for (const file of files) {
        await git.remove({ fs: this.fs, dir, filepath: file });
      }
    } catch (error) {
      throw new Error(`Failed to unstage files: ${error}`);
    }
  }

  async commit(message: string, dir: string = '/project'): Promise<string> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    if (!this.config) {
      throw new Error('Git configuration not set');
    }

    try {
      const hash = await git.commit({
        fs: this.fs,
        dir,
        author: {
          name: this.config.username,
          email: this.config.email
        },
        message
      });

      // Update current repo last commit
      if (this.currentRepo) {
        this.currentRepo.lastCommit = {
          hash,
          message,
          author: this.config.username,
          date: new Date()
        };
      }

      return hash;
    } catch (error) {
      throw new Error(`Failed to commit: ${error}`);
    }
  }

  async push(branch: string = 'main', dir: string = '/project'): Promise<void> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    if (!this.config?.token) {
      throw new Error('Git token required for push operations');
    }

    try {
      await git.push({
        fs: this.fs,
        http,
        dir,
        remote: 'origin',
        ref: branch,
        headers: this.getAuthHeaders(),
        onAuth: () => ({
          username: this.config!.username,
          password: this.config!.token || ''
        })
      });
    } catch (error) {
      throw new Error(`Failed to push: ${error}`);
    }
  }

  async pull(branch: string = 'main', dir: string = '/project'): Promise<void> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    if (!this.config?.token) {
      throw new Error('Git token required for pull operations');
    }

    try {
      await git.pull({
        fs: this.fs,
        http,
        dir,
        ref: branch,
        headers: this.getAuthHeaders(),
        onAuth: () => ({
          username: this.config!.username,
          password: this.config!.token || ''
        }),
        author: {
          name: this.config.username,
          email: this.config.email
        }
      });
    } catch (error) {
      throw new Error(`Failed to pull: ${error}`);
    }
  }

  async createBranch(branchName: string, dir: string = '/project'): Promise<void> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    try {
      await git.branch({ fs: this.fs, dir, ref: branchName });
    } catch (error) {
      throw new Error(`Failed to create branch: ${error}`);
    }
  }

  async switchBranch(branchName: string, dir: string = '/project'): Promise<void> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    try {
      await git.checkout({ fs: this.fs, dir, ref: branchName });
      
      if (this.currentRepo) {
        this.currentRepo.branch = branchName;
      }
    } catch (error) {
      throw new Error(`Failed to switch branch: ${error}`);
    }
  }

  async getBranches(dir: string = '/project'): Promise<string[]> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    try {
      const branches = await git.listBranches({ fs: this.fs, dir });
      return branches;
    } catch (error) {
      console.warn('Failed to get branches:', error);
      return ['main'];
    }
  }

  async getCommitHistory(limit: number = 10, dir: string = '/project'): Promise<GitCommit[]> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    try {
      const commits = await git.log({ fs: this.fs, dir, depth: limit });
      return commits.map(commit => ({
        hash: commit.oid,
        message: commit.commit.message,
        author: commit.commit.author.name,
        email: commit.commit.author.email,
        date: new Date(commit.commit.author.timestamp * 1000)
      }));
    } catch (error) {
      console.warn('Failed to get commit history:', error);
      return [];
    }
  }

  private async getLastCommit(dir: string = '/project'): Promise<GitCommit | undefined> {
    try {
      const commits = await this.getCommitHistory(1, dir);
      return commits[0];
    } catch (error) {
      console.warn('Failed to get last commit:', error);
      return undefined;
    }
  }

  async getCurrentBranch(dir: string = '/project'): Promise<string | null> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    try {
      return await git.currentBranch({ fs: this.fs, dir });
    } catch (error) {
      console.warn('Failed to get current branch:', error);
      return null;
    }
  }

  async addRemote(name: string, url: string, dir: string = '/project'): Promise<void> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    try {
      await git.addRemote({ fs: this.fs, dir, remote: name, url });
    } catch (error) {
      throw new Error(`Failed to add remote: ${error}`);
    }
  }

  async getRemotes(dir: string = '/project'): Promise<Array<{ remote: string; url: string }>> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    try {
      const remotes = await git.listRemotes({ fs: this.fs, dir });
      return remotes;
    } catch (error) {
      console.warn('Failed to get remotes:', error);
      return [];
    }
  }

  getCurrentRepository(): GitRepository | null {
    return this.currentRepo;
  }

  async isRepository(dir: string = '/project'): Promise<boolean> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    try {
      await git.findRoot({ fs: this.fs, filepath: dir });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getDiff(filepath?: string, dir: string = '/project'): Promise<string> {
    if (!this.fs) {
      await this.initializeFilesystem();
    }

    try {
      // This is a simplified diff - in a real implementation you'd want more sophisticated diffing
      const status = await this.getStatus(dir);
      const changes = [...status.modified, ...status.added, ...status.deleted];
      
      if (filepath && !changes.includes(filepath)) {
        return 'No changes';
      }

      return `Changes detected in: ${changes.join(', ')}`;
    } catch (error) {
      throw new Error(`Failed to get diff: ${error}`);
    }
  }
}

export const isomorphicGitService = IsomorphicGitService.getInstance();