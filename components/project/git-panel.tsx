'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  GitBranchIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  PlusIcon,
  CheckIcon,
  XIcon,
  UploadIcon,
  DownloadIcon,
  SettingsIcon
} from 'lucide-react';
import { gitService, GitStatus, GitRepository } from '@/lib/git/client';
import { useToast } from '@/hooks/use-toast';

interface GitPanelProps {
  projectId: string;
}

export function GitPanel({ projectId }: GitPanelProps) {
  const [repository, setRepository] = useState<GitRepository | null>(null);
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [branches, setBranches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [commitHistory, setCommitHistory] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadGitData();
  }, [projectId]);

  const loadGitData = async () => {
    try {
      setIsLoading(true);
      
      // Load git status
      const gitStatus = await gitService.getStatus();
      setStatus(gitStatus);
      
      // Load branches
      const branchList = await gitService.getBranches();
      setBranches(branchList);
      
      // Load commit history
      const history = await gitService.getCommitHistory();
      setCommitHistory(history);
      
      // Get current repository
      const repo = gitService.getCurrentRepository();
      setRepository(repo);
      
    } catch (error) {
      console.error('Failed to load git data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageFile = async (file: string) => {
    try {
      await gitService.stageFiles([file]);
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
      const commitHash = await gitService.commit(commitMessage);
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
      await gitService.push();
      toast({
        title: 'Changes pushed',
        description: 'Your changes have been pushed to the remote repository',
      });
    } catch (error) {
      toast({
        title: 'Push failed',
        description: 'Failed to push changes to remote repository',
        variant: 'destructive',
      });
    }
  };

  const handlePull = async () => {
    try {
      await gitService.pull();
      await loadGitData();
      toast({
        title: 'Changes pulled',
        description: 'Latest changes have been pulled from the remote repository',
      });
    } catch (error) {
      toast({
        title: 'Pull failed',
        description: 'Failed to pull changes from remote repository',
        variant: 'destructive',
      });
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) return;

    try {
      await gitService.createBranch(newBranchName);
      await gitService.switchBranch(newBranchName);
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
      await gitService.switchBranch(branchName);
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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <GitBranchIcon className="h-4 w-4" />
            Git Control
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePull}>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Pull
            </Button>
            <Button variant="outline" size="sm" onClick={handlePush}>
              <UploadIcon className="h-4 w-4 mr-2" />
              Push
            </Button>
          </div>
        </div>

        {repository && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{repository.branch}</Badge>
              <span className="text-sm text-muted-foreground">{repository.name}</span>
            </div>
            {repository.lastCommit && (
              <div className="text-xs text-muted-foreground">
                Last commit: {repository.lastCommit.hash.substring(0, 7)} - {repository.lastCommit.message}
              </div>
            )}
          </div>
        )}
      </div>

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
              Commit Changes
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
                        <span className="text-sm">{file}</span>
                        <CheckIcon className="h-4 w-4 text-green-600" />
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
                        <span className="text-sm">{file}</span>
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
                        <span className="text-sm">{file}</span>
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
                    <span className="text-sm">{branch}</span>
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
                <div key={commit.hash} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {commit.hash.substring(0, 7)}
                    </code>
                    <span className="text-xs text-muted-foreground">
                      {commit.date.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm mb-1">{commit.message}</p>
                  <p className="text-xs text-muted-foreground">by {commit.author}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}