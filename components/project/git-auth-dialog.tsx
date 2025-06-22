'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyIcon, ExternalLinkIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { gitAuthService, GitProvider } from '@/lib/git/git-auth';
import { useToast } from '@/hooks/use-toast';

interface GitAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticated: (provider: string, userInfo: any) => void;
}

export function GitAuthDialog({ open, onOpenChange, onAuthenticated }: GitAuthDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('github');
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [tokenStatuses, setTokenStatuses] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      checkExistingTokens();
    }
  }, [open]);

  const checkExistingTokens = async () => {
    const providers = gitAuthService.getProviders();
    const statuses: Record<string, boolean> = {};

    for (const provider of providers) {
      if (gitAuthService.hasToken(provider.id)) {
        const isValid = await gitAuthService.validateToken(provider.id);
        statuses[provider.id] = isValid;
      }
    }

    setTokenStatuses(statuses);
  };

  const handleTokenSubmit = async () => {
    if (!token.trim() || !username.trim() || !email.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsValidating(true);

    try {
      // Store the token
      gitAuthService.setToken(selectedProvider, token);

      // Validate the token
      const isValid = await gitAuthService.validateToken(selectedProvider);
      
      if (isValid) {
        const userInfo = await gitAuthService.getUserInfo(selectedProvider);
        
        toast({
          title: 'Authentication successful',
          description: `Connected to ${selectedProvider} as ${userInfo?.username || username}`,
        });

        onAuthenticated(selectedProvider, {
          username: userInfo?.username || username,
          email: userInfo?.email || email,
          provider: selectedProvider,
          token
        });

        onOpenChange(false);
      } else {
        gitAuthService.removeToken(selectedProvider);
        throw new Error('Invalid token');
      }
    } catch (error) {
      toast({
        title: 'Authentication failed',
        description: 'Please check your token and try again',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDisconnect = (provider: string) => {
    gitAuthService.removeToken(provider);
    setTokenStatuses(prev => {
      const updated = { ...prev };
      delete updated[provider];
      return updated;
    });
    
    toast({
      title: 'Disconnected',
      description: `Removed ${provider} authentication`,
    });
  };

  const getTokenInstructions = (provider: string) => {
    switch (provider) {
      case 'github':
        return {
          url: 'https://github.com/settings/tokens',
          scopes: 'repo, user:email',
          instructions: 'Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)'
        };
      case 'gitlab':
        return {
          url: 'https://gitlab.com/-/profile/personal_access_tokens',
          scopes: 'api, read_user, read_repository, write_repository',
          instructions: 'Go to GitLab Settings > Access Tokens'
        };
      case 'bitbucket':
        return {
          url: 'https://bitbucket.org/account/settings/app-passwords/',
          scopes: 'Repositories: Read, Write',
          instructions: 'Go to Bitbucket Settings > App passwords'
        };
      default:
        return {
          url: '',
          scopes: '',
          instructions: ''
        };
    }
  };

  const providers = gitAuthService.getProviders();
  const selectedProviderInfo = providers.find(p => p.id === selectedProvider);
  const tokenInfo = getTokenInstructions(selectedProvider);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyIcon className="h-5 w-5" />
            Git Authentication
          </DialogTitle>
          <DialogDescription>
            Connect your Git provider to enable repository operations like push, pull, and collaboration.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="connect" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connect">Connect Provider</TabsTrigger>
            <TabsTrigger value="status">Connection Status</TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Git Provider</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {providers.map((provider) => (
                    <Card 
                      key={provider.id}
                      className={`cursor-pointer transition-all ${
                        selectedProvider === provider.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl mb-1">{provider.icon}</div>
                        <div className="text-sm font-medium">{provider.name}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedProviderInfo && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-xl">{selectedProviderInfo.icon}</span>
                      {selectedProviderInfo.name} Setup
                    </CardTitle>
                    <CardDescription>
                      {tokenInfo.instructions}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-sm font-medium mb-2">Required Scopes:</div>
                      <Badge variant="outline">{tokenInfo.scopes}</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => window.open(tokenInfo.url, '_blank')}
                        className="flex-1"
                      >
                        <ExternalLinkIcon className="h-4 w-4 mr-2" />
                        Create Token
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="token">Personal Access Token</Label>
                        <Input
                          id="token"
                          type="password"
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="your-username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your-email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleTokenSubmit}
                      disabled={isValidating || !token.trim() || !username.trim() || !email.trim()}
                      className="w-full"
                    >
                      {isValidating ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                      )}
                      {isValidating ? 'Validating...' : 'Connect Account'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <div className="space-y-3">
              {providers.map((provider) => {
                const isConnected = tokenStatuses[provider.id];
                const hasToken = gitAuthService.hasToken(provider.id);

                return (
                  <Card key={provider.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{provider.icon}</span>
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {isConnected ? 'Connected and verified' : 
                             hasToken ? 'Token invalid or expired' : 
                             'Not connected'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isConnected ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : hasToken ? (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        ) : null}
                        {hasToken && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(provider.id)}
                          >
                            Disconnect
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {Object.keys(tokenStatuses).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <KeyIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No Git providers connected</p>
                <p className="text-sm">Connect a provider to enable Git operations</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}