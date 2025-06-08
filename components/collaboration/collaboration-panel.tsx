'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UsersIcon,
  MessageSquareIcon,
  EyeIcon,
  EditIcon,
  CheckCircleIcon,
  ReplyIcon,
  PlusIcon
} from 'lucide-react';
import { realTimeSync, UserCursor, Comment } from '@/lib/collaboration/real-time-sync';
import { useToast } from '@/hooks/use-toast';

interface CollaborationPanelProps {
  projectId: string;
  currentFile: string | null;
  userId: string;
  userName: string;
}

export function CollaborationPanel({ projectId, currentFile, userId, userName }: CollaborationPanelProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [cursors, setCursors] = useState<UserCursor[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    connectToCollaboration();
    return () => {
      realTimeSync.disconnect();
    };
  }, [projectId]);

  useEffect(() => {
    if (currentFile) {
      loadComments();
    }
  }, [currentFile]);

  const connectToCollaboration = async () => {
    try {
      await realTimeSync.connect(projectId, userId, userName);
      setIsConnected(true);

      // Set up event listeners
      realTimeSync.on('connected', () => {
        setIsConnected(true);
        toast({
          title: 'Connected',
          description: 'Real-time collaboration is now active',
        });
      });

      realTimeSync.on('disconnected', () => {
        setIsConnected(false);
        toast({
          title: 'Disconnected',
          description: 'Lost connection to collaboration server',
          variant: 'destructive',
        });
      });

      realTimeSync.on('cursor-update', (cursor: UserCursor) => {
        setCursors(prev => {
          const filtered = prev.filter(c => c.userId !== cursor.userId);
          return [...filtered, cursor];
        });
      });

      realTimeSync.on('comment-added', (comment: Comment) => {
        if (comment.file === currentFile) {
          setComments(prev => [...prev, comment]);
        }
      });

      realTimeSync.on('comment-replied', ({ parentComment }: { parentComment: Comment }) => {
        setComments(prev => prev.map(c => c.id === parentComment.id ? parentComment : c));
      });

      realTimeSync.on('comment-resolved', (comment: Comment) => {
        setComments(prev => prev.map(c => c.id === comment.id ? comment : c));
      });

      // Update active users
      const users = realTimeSync.getActiveUsers();
      setActiveUsers(users);

    } catch (error) {
      console.error('Failed to connect to collaboration:', error);
      toast({
        title: 'Connection failed',
        description: 'Could not connect to collaboration server',
        variant: 'destructive',
      });
    }
  };

  const loadComments = () => {
    const fileComments = realTimeSync.getComments(currentFile || undefined);
    setComments(fileComments);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !currentFile) return;

    const comment = realTimeSync.addComment(
      currentFile,
      1, // In a real implementation, this would be the current line
      newComment,
      userId,
      userName
    );

    setNewComment('');
    toast({
      title: 'Comment added',
      description: 'Your comment has been shared with the team',
    });
  };

  const handleReply = (commentId: string) => {
    if (!replyContent.trim()) return;

    realTimeSync.replyToComment(commentId, replyContent, userId, userName);
    setReplyingTo(null);
    setReplyContent('');
    
    toast({
      title: 'Reply added',
      description: 'Your reply has been posted',
    });
  };

  const handleResolveComment = (commentId: string) => {
    realTimeSync.resolveComment(commentId);
    toast({
      title: 'Comment resolved',
      description: 'Comment has been marked as resolved',
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            Collaboration
          </h3>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="users" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="flex-1 p-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Active Users ({activeUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8" style={{ backgroundColor: user.color }}>
                      <AvatarFallback className="text-white font-medium">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.id === userId ? 'You' : 'Online'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Viewing</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Live Cursors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cursors.filter(c => c.userId !== userId).map((cursor) => (
                  <div key={cursor.userId} className="flex items-center gap-2 text-sm">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: cursor.color }}
                    />
                    <span>{cursor.userName}</span>
                    <span className="text-muted-foreground">
                      {cursor.file ? `Line ${cursor.position.line}` : 'Not editing'}
                    </span>
                  </div>
                ))}
                {cursors.filter(c => c.userId !== userId).length === 0 && (
                  <p className="text-sm text-muted-foreground">No other users editing</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="flex-1 p-4 space-y-4">
          {currentFile ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Add Comment</CardTitle>
                  <CardDescription>
                    Comment on {currentFile}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </CardContent>
              </Card>

              <ScrollArea className="flex-1">
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <Card key={comment.id} className={comment.resolved ? 'opacity-60' : ''}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {comment.userName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{comment.userName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Line {comment.line} • {formatTimeAgo(comment.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {comment.resolved && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p className="text-sm">{comment.content}</p>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingTo(comment.id)}
                            >
                              <ReplyIcon className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                            {!comment.resolved && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResolveComment(comment.id)}
                              >
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Resolve
                              </Button>
                            )}
                          </div>

                          {/* Replies */}
                          {comment.replies.length > 0 && (
                            <div className="ml-4 space-y-2 border-l-2 border-muted pl-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback className="text-xs">
                                        {reply.userName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <p className="text-xs font-medium">{reply.userName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatTimeAgo(reply.createdAt)}
                                    </p>
                                  </div>
                                  <p className="text-sm">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Input */}
                          {replyingTo === comment.id && (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="min-h-[60px]"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleReply(comment.id)}
                                  disabled={!replyContent.trim()}
                                >
                                  Reply
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyContent('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {comments.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquareIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
                      <p className="text-muted-foreground">
                        Start a discussion about this file
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="text-center py-8">
              <MessageSquareIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Select a file</h3>
              <p className="text-muted-foreground">
                Choose a file to view and add comments
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="flex-1 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-medium">{userName}</span>
                <span className="text-muted-foreground">joined the project</span>
                <span className="text-xs text-muted-foreground ml-auto">2m ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="font-medium">Alice</span>
                <span className="text-muted-foreground">edited App.tsx</span>
                <span className="text-xs text-muted-foreground ml-auto">5m ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="font-medium">Bob</span>
                <span className="text-muted-foreground">added a comment</span>
                <span className="text-xs text-muted-foreground ml-auto">10m ago</span>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}