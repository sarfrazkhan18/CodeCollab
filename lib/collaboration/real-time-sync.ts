// Conditional imports to avoid build errors
let WebsocketProvider: any = null;
let Y: any = null;
let awareness: any = null;

if (typeof window !== 'undefined') {
  try {
    const yWebsocket = require('y-websocket');
    const yjs = require('yjs');
    const yProtocols = require('y-protocols/awareness');
    
    WebsocketProvider = yWebsocket.WebsocketProvider;
    Y = yjs;
    awareness = yProtocols.awareness;
  } catch (error) {
    console.warn('Collaboration dependencies not available:', error);
  }
}

export interface CollaborationEvent {
  type: 'cursor' | 'selection' | 'edit' | 'presence' | 'comment';
  userId: string;
  data: any;
  timestamp: Date;
}

export interface UserCursor {
  userId: string;
  userName: string;
  color: string;
  position: {
    line: number;
    column: number;
  };
  file: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  file: string;
  line: number;
  resolved: boolean;
  createdAt: Date;
  replies: Comment[];
}

export class RealTimeSync {
  private static instance: RealTimeSync;
  private doc: any;
  private provider: any = null;
  private awareness: any = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private cursors: Map<string, UserCursor> = new Map();
  private comments: Map<string, Comment> = new Map();
  private isConnected: boolean = false;

  private constructor() {
    if (Y) {
      this.doc = new Y.Doc();
    }
  }

  static getInstance(): RealTimeSync {
    if (!RealTimeSync.instance) {
      RealTimeSync.instance = new RealTimeSync();
    }
    return RealTimeSync.instance;
  }

  async connect(projectId: string, userId: string, userName: string): Promise<void> {
    try {
      // Check if collaboration dependencies are available
      if (!WebsocketProvider || !Y || !awareness) {
        console.warn('Collaboration dependencies not available. Running in offline mode.');
        this.simulateOfflineMode(userId, userName);
        return;
      }

      // Check if WebSocket URL is configured
      const wsUrl = process.env.NEXT_PUBLIC_COLLABORATION_WS_URL;
      if (!wsUrl) {
        console.warn('Collaboration WebSocket URL not configured. Running in offline mode.');
        this.simulateOfflineMode(userId, userName);
        return;
      }

      // Initialize WebSocket provider
      this.provider = new WebsocketProvider(
        wsUrl,
        `project-${projectId}`,
        this.doc
      );

      this.awareness = this.provider.awareness;

      // Set user information
      this.awareness.setLocalState({
        user: {
          id: userId,
          name: userName,
          color: this.generateUserColor(),
        },
      });

      // Listen for awareness changes
      this.awareness.on('change', this.handleAwarenessChange.bind(this));

      // Listen for document changes
      this.doc.on('update', this.handleDocumentUpdate.bind(this));

      // Handle connection events
      this.provider.on('status', ({ status }: { status: string }) => {
        if (status === 'connected') {
          this.isConnected = true;
          this.emit('connected', { projectId, userId, userName });
        } else if (status === 'disconnected') {
          this.isConnected = false;
          this.emit('disconnected', {});
        }
      });

    } catch (error) {
      console.error('Failed to connect to collaboration server:', error);
      // Fall back to offline mode
      this.simulateOfflineMode(userId, userName);
    }
  }

  private simulateOfflineMode(userId: string, userName: string): void {
    // Simulate being connected but in offline mode
    this.isConnected = false;
    
    // Add current user to active users
    const currentUser = {
      id: userId,
      name: userName,
      color: this.generateUserColor(),
    };

    // Emit connected event even in offline mode
    setTimeout(() => {
      this.emit('connected', { userId, userName });
    }, 100);
  }

  disconnect(): void {
    if (this.provider) {
      this.provider.destroy();
      this.provider = null;
    }
    if (this.awareness) {
      this.awareness.destroy();
      this.awareness = null;
    }
    this.isConnected = false;
    this.emit('disconnected', {});
  }

  // File synchronization
  getSharedText(filePath: string): any {
    if (!this.doc) return null;
    return this.doc.getText(filePath);
  }

  updateFile(filePath: string, content: string): void {
    if (!this.doc) return;
    
    const ytext = this.getSharedText(filePath);
    if (ytext) {
      ytext.delete(0, ytext.length);
      ytext.insert(0, content);
    }
  }

  // Cursor and selection tracking
  updateCursor(filePath: string, line: number, column: number): void {
    if (!this.awareness) return;

    const state = this.awareness.getLocalState();
    if (state) {
      this.awareness.setLocalState({
        ...state,
        cursor: {
          file: filePath,
          line,
          column,
        },
      });
    }
  }

  updateSelection(filePath: string, start: { line: number; column: number }, end: { line: number; column: number }): void {
    if (!this.awareness) return;

    const state = this.awareness.getLocalState();
    if (state) {
      this.awareness.setLocalState({
        ...state,
        selection: {
          file: filePath,
          start,
          end,
        },
      });
    }
  }

  // Comments system
  addComment(filePath: string, line: number, content: string, userId: string, userName: string): Comment {
    const comment: Comment = {
      id: `comment-${Date.now()}-${Math.random()}`,
      userId,
      userName,
      content,
      file: filePath,
      line,
      resolved: false,
      createdAt: new Date(),
      replies: [],
    };

    this.comments.set(comment.id, comment);
    
    // Sync comment to other users if connected
    if (this.isConnected && this.doc) {
      const commentsMap = this.doc.getMap('comments');
      commentsMap.set(comment.id, comment);
    }

    this.emit('comment-added', comment);
    return comment;
  }

  replyToComment(commentId: string, content: string, userId: string, userName: string): Comment {
    const parentComment = this.comments.get(commentId);
    if (!parentComment) {
      throw new Error('Comment not found');
    }

    const reply: Comment = {
      id: `reply-${Date.now()}-${Math.random()}`,
      userId,
      userName,
      content,
      file: parentComment.file,
      line: parentComment.line,
      resolved: false,
      createdAt: new Date(),
      replies: [],
    };

    parentComment.replies.push(reply);
    
    // Update in shared document if connected
    if (this.isConnected && this.doc) {
      const commentsMap = this.doc.getMap('comments');
      commentsMap.set(commentId, parentComment);
    }

    this.emit('comment-replied', { parentComment, reply });
    return reply;
  }

  resolveComment(commentId: string): void {
    const comment = this.comments.get(commentId);
    if (comment) {
      comment.resolved = true;
      
      // Update in shared document if connected
      if (this.isConnected && this.doc) {
        const commentsMap = this.doc.getMap('comments');
        commentsMap.set(commentId, comment);
      }

      this.emit('comment-resolved', comment);
    }
  }

  getComments(filePath?: string): Comment[] {
    const allComments = Array.from(this.comments.values());
    return filePath 
      ? allComments.filter(comment => comment.file === filePath)
      : allComments;
  }

  // Event handling
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Private methods
  private handleAwarenessChange({ added, updated, removed }: any): void {
    if (!this.awareness) return;

    [...added, ...updated].forEach((clientId: number) => {
      const state = this.awareness.getStates().get(clientId);
      if (state && state.user) {
        const cursor: UserCursor = {
          userId: state.user.id,
          userName: state.user.name,
          color: state.user.color,
          position: state.cursor || { line: 0, column: 0 },
          file: state.cursor?.file || '',
        };
        this.cursors.set(state.user.id, cursor);
        this.emit('cursor-update', cursor);
      }
    });

    removed.forEach((clientId: number) => {
      // Find and remove cursor for disconnected user
      for (const [userId, cursor] of this.cursors.entries()) {
        // Remove cursor logic would go here
      }
    });
  }

  private handleDocumentUpdate(update: Uint8Array): void {
    this.emit('document-update', { update });
  }

  private generateUserColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEEAD', '#D4A5A5', '#9FA8DA', '#CE93D8'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Utility methods
  getActiveCursors(): UserCursor[] {
    return Array.from(this.cursors.values());
  }

  getActiveUsers(): Array<{ id: string; name: string; color: string }> {
    if (!this.awareness) {
      // Return mock user in offline mode
      return [{
        id: 'current-user',
        name: 'You',
        color: this.generateUserColor()
      }];
    }
    
    const users: Array<{ id: string; name: string; color: string }> = [];
    this.awareness.getStates().forEach((state: any) => {
      if (state.user) {
        users.push(state.user);
      }
    });
    return users;
  }
}

export const realTimeSync = RealTimeSync.getInstance();