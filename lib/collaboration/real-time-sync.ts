import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { awareness } from 'y-protocols/awareness';

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
  private doc: Y.Doc;
  private provider: WebsocketProvider | null = null;
  private awareness: awareness.Awareness | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private cursors: Map<string, UserCursor> = new Map();
  private comments: Map<string, Comment> = new Map();

  private constructor() {
    this.doc = new Y.Doc();
  }

  static getInstance(): RealTimeSync {
    if (!RealTimeSync.instance) {
      RealTimeSync.instance = new RealTimeSync();
    }
    return RealTimeSync.instance;
  }

  async connect(projectId: string, userId: string, userName: string): Promise<void> {
    try {
      // Initialize WebSocket provider
      this.provider = new WebsocketProvider(
        process.env.NEXT_PUBLIC_COLLABORATION_WS_URL || 'ws://localhost:1234',
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

      this.emit('connected', { projectId, userId, userName });
    } catch (error) {
      console.error('Failed to connect to collaboration server:', error);
      throw error;
    }
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
    this.emit('disconnected', {});
  }

  // File synchronization
  getSharedText(filePath: string): Y.Text {
    return this.doc.getText(filePath);
  }

  updateFile(filePath: string, content: string): void {
    const ytext = this.getSharedText(filePath);
    ytext.delete(0, ytext.length);
    ytext.insert(0, content);
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
    
    // Sync comment to other users
    const commentsMap = this.doc.getMap('comments');
    commentsMap.set(comment.id, comment);

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
    
    // Update in shared document
    const commentsMap = this.doc.getMap('comments');
    commentsMap.set(commentId, parentComment);

    this.emit('comment-replied', { parentComment, reply });
    return reply;
  }

  resolveComment(commentId: string): void {
    const comment = this.comments.get(commentId);
    if (comment) {
      comment.resolved = true;
      
      // Update in shared document
      const commentsMap = this.doc.getMap('comments');
      commentsMap.set(commentId, comment);

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
    [...added, ...updated].forEach((clientId: number) => {
      const state = this.awareness!.getStates().get(clientId);
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
    if (!this.awareness) return [];
    
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