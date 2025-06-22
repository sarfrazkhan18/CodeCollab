'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  GitBranchIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  PlusIcon,
  CheckIcon,
  XIcon,
  UploadIcon,
  DownloadIcon,
  SettingsIcon,
  RefreshCwIcon,
  KeyIcon,
  FolderGitIcon,
  AlertCircleIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { isomorphicGitService, GitStatus, GitCommit } from '@/lib/git/isomorphic-git-client';
import { gitAuthService } from '@/lib/git/git-auth';
import { GitAuthDialog } from './git-auth-dialog';
import { useToast } from '@/hooks/use-toast';

interface EnhancedGitPanelProps {
  projectId: string;
  onFileChange?: (files: string[]) => void;
}

export function EnhancedGitPanel({ projectId, onFileChange }: EnhancedGitPanelProps) {
  const [repository, setRepository] = useState(isomorphicGitService.getCurrentRepository());
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [branches, setBranches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [commitHistory, setCommitHistory] = useState<GitCommit[]>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [cloneUrl, setCloneUrl] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
    if (isAuthenticated) {
      loadGitData();
    }
  }, [projectId, isAuthenticated]);

  const checkAuthStatus = () => {
    const providers = gitAuthService.getProviders();
    for (const provider of providers) {
      if (gitAuthService.hasToken(provider.id)) {
        setIsAuthenticated(true);
        setCurrentProvider(provider.id);
        return;
      }
    }
    setIsAuthenticated(false);
    setCurrentProvider(null);
  };

  const loadGitData = async () => {
    try {
      setIsLoading(true);
      
      const isRepo = await isomorphicGitService.isRepository();
      if (!isRepo) {
        setRepository(null);
        setStatus(null);
        setBranches([]);
        setCommitHistory([]);
        return;
      }

      // Load git status
      const gitStatus = await isomorphicGitService.getStatus();
      setStatus(gitStatus);
      
      // Load branches
      const branchList = await isomorphicGitService.getBranches();
      setBranches(branchList);
      
      // Load commit history
      const history = await isomorphicGitService.getCommitHistory();
      setCommitHistory(history);
      
      // Get current repository
      const repo = isomorphicGitService.getCurrentRepository();
      setRepository(repo);
      
    } catch (error) {
      console.error('Failed to load git data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Git data. Make sure the repository is initialized.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticated = async (provider: string, userInfo: any) => {
    try {
      isomorphicGitService.setConfig({
        username: userInfo.username,
        email: userInfo.email,
        token: userInfo.token,
        provider: provider as any
      });

      setIsAuthenticated(true);
      setCurrentProvider(provider);
      
      await loadGitData();
      
      toast({
        title: 'Git configured',
        description: `Successfully configured Git with ${provider}`,
      });
    } catch (error) {
      toast({
        title: 'Configuration failed',
        description: 'Failed to configure Git',
        variant: 'destructive',
      });
    }
  };

  const handleInitRepository = async () => {
    try {
      setIsLoading(true);
      await isomorphicGitService.initRepository();
      await loadGitData();
      
      toast({
        title: 'Repository initialized',
        description: 'Git repository has been initialized successfully',
      });
    } catch (error) {
      toast({
        title: 'Initialization failed',
        description: 'Failed to initialize Git repository',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloneRepository = async () => {
    if (!cloneUrl.trim()) {
      toast({
        title: 'URL required',
        description: 'Please enter a repository URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const repo = await isomorphicGitService.cloneRepository(cloneUrl);
      setRepository(repo);
      setShowCloneDialog(false);
      setCloneUrl('');
      await loadGitData();
      
      toast({
        title: 'Repository cloned',
        description: `Successfully cloned ${repo.name}`,
      });
    } catch (error) {
      toast({
        title: 'Clone failed',
        description: 'Failed to clone repository. Check the URL and your permissions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageFile = async (file: string) => {
    try {
      await isomorphicGitService.stageFiles([file]);
      await loadGitData();
      toast({
        title: 'File staged',
        description: `${file} has been staged for commit`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to stage file',
        variant: 'destructive',
      });
    }
  };

  const handleUnstageFile = async (file: string) => {
    try {
      await isomorphicGitService.unstageFiles([file]);
      await loadGitData();
      toast({
        title: 'File unstaged',
        description: `${file} has been unstaged`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unstage file',
        variant: 'destructive',
      });
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      toast({
        title: 'Commit message required',
        description: 'Please enter a commit message',
        variant: 'destructive',
      });
      return;
    }

    try {
      const commitHash = await isomorphicGitService.commit(commitMessage);
      setCommitMessage('');
      await loadGitData();
      
      toast({
        title: 'Changes committed',
        description: `Commit ${commitHash.substring(0, 7)} created successfully`,
      });
    } catch (error) {
      toast({
        title: 'Commit failed',
        description: 'Failed to commit changes',
        variant: 'destructive',
      });
    }
  };

  const handlePush = async () => {
    try {
      setIsLoading(true);
      await isomorphicGitService.push();
      await loadGitData();
      
      toast({
        title: 'Changes pushed',
        description: 'Your changes have been pushed to the remote repository',
      });
    } catch (error) {
      toast({
        title: 'Push failed',
        description: 'Failed to push changes. Check your connection and permissions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePull = async () => {
    try {
      setIsLoading(true);
      await isomorphicGitService.pull();
      await loadGitData();
      
      toast({
        title: 'Changes pulled',
        description: 'Latest changes have been pulled from the remote repository',
      });
    } catch (error) {
      toast({
        title: 'Pull failed',
        description: 'Failed to pull changes. Check your connection.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) return;

    try {
      await isomorphicGitService.createBranch(newBranchName);
      await isomorphicGitService.switchBranch(newBranchName);
      setNewBranchName('');
      await loadGitData();
      
      toast({
        title: 'Branch created',
        description: `Created and switched to branch: ${newBranchName}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to create branch',
        description: 'Could not create the new branch',
        variant: 'destructive',
      });
    }
  };

  const handleSwitchBranch = async (branchName: string) => {
    try {
      await isomorphicGitService.switchBranch(branchName);
      await loadGitData();
      
      toast({
        title: 'Branch switched',
        description: `Switched to branch: ${branchName}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to switch branch',
        description: 'Could not switch to the selected branch',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b p-4">
          <h3 className="font-semibold flex items-center gap-2">
            <GitBranchIcon className="h-4 w-4" />
            Git Integration
          </h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <KeyIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>Git Authentication Required</CardTitle>
              <CardDescription>
                Connect your Git provider to enable version control features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowAuthDialog(true)}
                className="w-full"
              >
                <KeyIcon className="h-4 w-4 mr-2" />
                Connect Git Provider
              </Button>
            </CardContent>
          </Card>
        </div>

        <GitAuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          onAuthenticated={handleAuthenticated}
        />
      </div>
    );
  }

  const isRepo = repository !== null;

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold flex items-center gap-2">
              <GitBranchIcon className="h-4 w-4" />
              Git Control
            </h3>
            {currentProvider && (
              <Badge variant="outline">
                {currentProvider}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAuthDialog(true)}
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadGitData}
              disabled={isLoading}
            >
              <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {!isRepo ? (
          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-4">
                <FolderGitIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <h4 className="font-medium mb-2">No Git Repository</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Initialize a new repository or clone an existing one
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleInitRepository} disabled={isLoading}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Initialize
                    </Button>
                    <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <DownloadIcon className="h-4 w-4 mr-2" />
                          Clone
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Clone Repository</DialogTitle>
                          <DialogDescription>
                            Enter the URL of the repository you want to clone
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="https://github.com/user/repo.git"
                            value={cloneUrl}
                            onChange={(e) => setCloneUrl(e.target.value)}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setShowCloneDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCloneRepository} disabled={isLoading}>
                              {isLoading ? 'Cloning...' : 'Clone'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{repository.branch}</Badge>
              <span className="text-sm text-muted-foreground">{repository.name}</span>
              {status && status.ahead > 0 && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                  ↑{status.ahead}
                </Badge>
              )}
              {status && status.behind > 0 && (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                  ↓{status.behind}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePull} disabled={isLoading}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Pull
              </Button>
              <Button variant="outline" size="sm" onClick={handlePush} disabled={isLoading}>
                <UploadIcon className="h-4 w-4 mr-2" />
                Push
              </Button>
            </div>
          </div>
        )}
      </div>

      {isRepo && (
        <Tabs defaultValue="changes" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="changes">Changes</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="changes" className="flex-1 p-4 space-y-4">
            {/* Commit Section */}
            <div className="space-y-2">
              <Textarea
                placeholder="Commit message..."
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="min-h-[80px]"
              />
              <Button 
                onClick={handleCommit} 
                disabled={!commitMessage.trim() || !status?.staged.length}
                className="w-full"
              >
                <GitCommitIcon className="h-4 w-4 mr-2" />
                Commit Changes ({status?.staged.length || 0})
              </Button>
            </div>

            <Separator />

            {/* File Changes */}
            <ScrollArea className="flex-1">
              <div className="space-y-4">
                {status?.staged && status.staged.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-green-600">Staged Changes</h4>
                    <div className="space-y-1">
                      {status.staged.map((file) => (
                        <div key={file} className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                          <span className="text-sm font-mono">{file}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnstageFile(file)}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {status?.modified && status.modified.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-orange-600">Modified Files</h4>
                    <div className="space-y-1">
                      {status.modified.map((file) => (
                        <div key={file} className="flex items-center justify-between p-2 bg-orange-500/10 rounded">
                          <span className="text-sm font-mono">{file}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStageFile(file)}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {status?.untracked && status.untracked.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-blue-600">Untracked Files</h4>
                    <div className="space-y-1">
                      {status.untracked.map((file) => (
                        <div key={file} className="flex items-center justify-between p-2 bg-blue-500/10 rounded">
                          <span className="text-sm font-mono">{file}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStageFile(file)}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!status || (status.modified.length === 0 && status.untracked.length === 0 && status.staged.length === 0)) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <GitCommitIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No changes to commit</p>
                    <p className="text-sm">Working tree clean</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="branches" className="flex-1 p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="New branch name..."
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                />
                <Button onClick={handleCreateBranch} disabled={!newBranchName.trim()}>
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {branches.map((branch) => (
                  <div
                    key={branch}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-accent ${
                      repository?.branch === branch ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => handleSwitchBranch(branch)}
                  >
                    <div className="flex items-center gap-2">
                      <GitBranchIcon className="h-4 w-4" />
                      <span className="text-sm font-mono">{branch}</span>
                    </div>
                    {repository?.branch === branch && (
                      <Badge variant="outline" className="text-xs">Current</Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="flex-1 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {commitHistory.map((commit) => (
                  <Card key={commit.hash}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                          {commit.hash.substring(0, 7)}
                        </code>
                        <span className="text-xs text-muted-foreground">
                          {commit.date.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mb-1">{commit.message}</p>
                      <p className="text-xs text-muted-foreground">
                        by {commit.author} ({commit.email})
                      </p>
                    </CardContent>
                  </Card>
                ))}

                {commitHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <GitCommitIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No commits yet</p>
                    <p className="text-sm">Make your first commit to see history</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}

      <GitAuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
}