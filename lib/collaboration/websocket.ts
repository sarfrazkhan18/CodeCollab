import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { editor } from 'monaco-editor';

export class CollaborationService {
  private doc: Y.Doc;
  private provider: WebsocketProvider;
  private awareness: any;
  private bindings: Map<string, MonacoBinding>;

  constructor(projectId: string) {
    this.doc = new Y.Doc();
    this.provider = new WebsocketProvider(
      'ws://localhost:1234',
      projectId,
      this.doc
    );
    this.awareness = this.provider.awareness;
    this.bindings = new Map();

    this.awareness.setLocalState({
      user: {
        name: 'Anonymous',
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      },
    });
  }

  bindEditor(filePath: string, editor: editor.IStandaloneCodeEditor) {
    const ytext = this.doc.getText(filePath);
    const binding = new MonacoBinding(
      ytext,
      editor.getModel()!,
      new Set([editor]),
      this.awareness
    );
    this.bindings.set(filePath, binding);
  }

  unbindEditor(filePath: string) {
    const binding = this.bindings.get(filePath);
    if (binding) {
      binding.destroy();
      this.bindings.delete(filePath);
    }
  }

  setUserInfo(name: string, color: string) {
    this.awareness.setLocalState({
      user: { name, color },
    });
  }

  destroy() {
    this.bindings.forEach(binding => binding.destroy());
    this.provider.destroy();
    this.doc.destroy();
  }
}