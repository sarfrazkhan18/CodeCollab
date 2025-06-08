import { awareness } from 'y-protocols/awareness';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

export interface UserPresence {
  id: string;
  name: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export class PresenceManager {
  private doc: Y.Doc;
  private provider: WebsocketProvider;
  private awareness: awareness.Awareness;

  constructor(projectId: string, userId: string, userName: string) {
    this.doc = new Y.Doc();
    this.provider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_COLLABORATION_WS_URL || 'ws://localhost:1234',
      `project-${projectId}`,
      this.doc
    );
    this.awareness = this.provider.awareness;

    // Set initial user state
    this.awareness.setLocalState({
      user: {
        id: userId,
        name: userName,
        color: this.generateUserColor(),
      },
    });

    // Listen for remote user changes
    this.awareness.on('change', this.handleAwarenessChange);
  }

  private generateUserColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEEAD', '#D4A5A5', '#9FA8DA', '#CE93D8'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private handleAwarenessChange = ({ added, updated, removed }: any) => {
    // Handle presence updates
    [...added, ...updated].forEach(clientId => {
      const state = this.awareness.getStates().get(clientId);
      if (state) {
        // Emit presence update event
        this.emit('presence-update', {
          type: 'update',
          user: state.user,
        });
      }
    });

    removed.forEach(clientId => {
      // Emit presence removal event
      this.emit('presence-update', {
        type: 'remove',
        clientId,
      });
    });
  };

  updateCursor(cursor: { line: number; column: number }) {
    const state = this.awareness.getLocalState();
    if (state) {
      this.awareness.setLocalState({
        ...state,
        cursor,
      });
    }
  }

  updateSelection(selection: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  }) {
    const state = this.awareness.getLocalState();
    if (state) {
      this.awareness.setLocalState({
        ...state,
        selection,
      });
    }
  }

  getActiveUsers(): UserPresence[] {
    const users: UserPresence[] = [];
    this.awareness.getStates().forEach((state: any) => {
      if (state.user) {
        users.push(state.user);
      }
    });
    return users;
  }

  destroy() {
    this.awareness.destroy();
    this.provider.destroy();
    this.doc.destroy();
  }

  private emit(event: string, data: any) {
    // Implement event emission logic
    // This could use EventEmitter or a custom event system
    console.log('Presence event:', event, data);
  }
}