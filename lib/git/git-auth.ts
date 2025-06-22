export interface GitProvider {
  id: string;
  name: string;
  icon: string;
  authUrl: string;
  apiUrl: string;
  scopes: string[];
}

export const GIT_PROVIDERS: GitProvider[] = [
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    authUrl: 'https://github.com/login/oauth/authorize',
    apiUrl: 'https://api.github.com',
    scopes: ['repo', 'user:email']
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    icon: '🦊',
    authUrl: 'https://gitlab.com/oauth/authorize',
    apiUrl: 'https://gitlab.com/api/v4',
    scopes: ['api', 'read_user', 'read_repository', 'write_repository']
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    icon: '🪣',
    authUrl: 'https://bitbucket.org/site/oauth2/authorize',
    apiUrl: 'https://api.bitbucket.org/2.0',
    scopes: ['repository', 'account']
  }
];

export class GitAuthService {
  private static instance: GitAuthService;
  private tokens: Map<string, string> = new Map();

  private constructor() {
    this.loadStoredTokens();
  }

  static getInstance(): GitAuthService {
    if (!GitAuthService.instance) {
      GitAuthService.instance = new GitAuthService();
    }
    return GitAuthService.instance;
  }

  private loadStoredTokens(): void {
    try {
      const stored = localStorage.getItem('git-tokens');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.tokens = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn('Failed to load stored Git tokens:', error);
    }
  }

  private saveTokens(): void {
    try {
      const obj = Object.fromEntries(this.tokens);
      localStorage.setItem('git-tokens', JSON.stringify(obj));
    } catch (error) {
      console.warn('Failed to save Git tokens:', error);
    }
  }

  setToken(provider: string, token: string): void {
    this.tokens.set(provider, token);
    this.saveTokens();
  }

  getToken(provider: string): string | undefined {
    return this.tokens.get(provider);
  }

  removeToken(provider: string): void {
    this.tokens.delete(provider);
    this.saveTokens();
  }

  hasToken(provider: string): boolean {
    return this.tokens.has(provider);
  }

  getProvider(providerId: string): GitProvider | undefined {
    return GIT_PROVIDERS.find(p => p.id === providerId);
  }

  getProviders(): GitProvider[] {
    return GIT_PROVIDERS;
  }

  generateAuthUrl(provider: GitProvider, clientId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: provider.scopes.join(' '),
      response_type: 'code'
    });

    return `${provider.authUrl}?${params.toString()}`;
  }

  async validateToken(provider: string): Promise<boolean> {
    const token = this.getToken(provider);
    if (!token) return false;

    const providerConfig = this.getProvider(provider);
    if (!providerConfig) return false;

    try {
      const response = await fetch(`${providerConfig.apiUrl}/user`, {
        headers: {
          'Authorization': provider === 'github' ? `token ${token}` : `Bearer ${token}`,
          'User-Agent': 'CodeCollab-AI'
        }
      });

      return response.ok;
    } catch (error) {
      console.warn(`Failed to validate ${provider} token:`, error);
      return false;
    }
  }

  async getUserInfo(provider: string): Promise<{
    username: string;
    email: string;
    avatarUrl?: string;
  } | null> {
    const token = this.getToken(provider);
    if (!token) return null;

    const providerConfig = this.getProvider(provider);
    if (!providerConfig) return null;

    try {
      const response = await fetch(`${providerConfig.apiUrl}/user`, {
        headers: {
          'Authorization': provider === 'github' ? `token ${token}` : `Bearer ${token}`,
          'User-Agent': 'CodeCollab-AI'
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      
      return {
        username: data.login || data.username,
        email: data.email,
        avatarUrl: data.avatar_url
      };
    } catch (error) {
      console.warn(`Failed to get user info from ${provider}:`, error);
      return null;
    }
  }

  async getRepositories(provider: string): Promise<Array<{
    name: string;
    fullName: string;
    url: string;
    private: boolean;
    defaultBranch: string;
  }>> {
    const token = this.getToken(provider);
    if (!token) return [];

    const providerConfig = this.getProvider(provider);
    if (!providerConfig) return [];

    try {
      const endpoint = provider === 'github' ? '/user/repos' : 
                     provider === 'gitlab' ? '/projects?membership=true' :
                     '/repositories';

      const response = await fetch(`${providerConfig.apiUrl}${endpoint}`, {
        headers: {
          'Authorization': provider === 'github' ? `token ${token}` : `Bearer ${token}`,
          'User-Agent': 'CodeCollab-AI'
        }
      });

      if (!response.ok) return [];

      const data = await response.json();
      
      return data.map((repo: any) => ({
        name: repo.name,
        fullName: repo.full_name || `${repo.namespace?.name}/${repo.name}`,
        url: repo.clone_url || repo.http_url_to_repo || repo.links?.clone[0]?.href,
        private: repo.private || repo.visibility === 'private',
        defaultBranch: repo.default_branch || repo.default_branch || 'main'
      }));
    } catch (error) {
      console.warn(`Failed to get repositories from ${provider}:`, error);
      return [];
    }
  }
}

export const gitAuthService = GitAuthService.getInstance();