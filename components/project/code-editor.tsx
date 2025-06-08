'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrainCircuitIcon, PlayIcon, SaveIcon, CopyIcon, DownloadIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeEditorProps {
  filePath: string;
  code?: string;
  onChange?: (code: string) => void;
}

export function CodeEditor({ filePath, code = '', onChange }: CodeEditorProps) {
  const [editorCode, setEditorCode] = useState(code);
  const [language, setLanguage] = useState('typescript');
  const [isModified, setIsModified] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEditorCode(code);
    setIsModified(false);
  }, [code, filePath]);

  useEffect(() => {
    // Determine language based on file extension
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
    };
    
    setLanguage(languageMap[extension || ''] || 'typescript');
  }, [filePath]);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setEditorCode(newCode);
    setIsModified(newCode !== code);
    onChange?.(newCode);
  };

  const handleSave = () => {
    onChange?.(editorCode);
    setIsModified(false);
    toast({
      title: 'File saved',
      description: `Successfully saved ${filePath}`,
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editorCode);
      toast({
        title: 'Code copied',
        description: 'Code has been copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy code to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([editorCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath.split('/').pop() || 'file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'File downloaded',
      description: `Downloaded ${filePath}`,
    });
  };

  const getFileIcon = (extension: string) => {
    const iconMap: Record<string, string> = {
      'tsx': '⚛️',
      'jsx': '⚛️',
      'ts': '🔷',
      'js': '🟨',
      'css': '🎨',
      'html': '🌐',
      'json': '📋',
      'md': '📝',
      'py': '🐍',
      'java': '☕',
      'cpp': '⚙️',
      'go': '🐹',
      'rs': '🦀',
      'php': '🐘',
    };
    
    return iconMap[extension] || '📄';
  };

  const extension = filePath.split('.').pop()?.toLowerCase() || '';

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-2 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getFileIcon(extension)}</span>
          <span className="text-sm font-medium">{filePath}</span>
          {isModified && (
            <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20">
              Modified
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {language}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <CopyIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <DownloadIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={!isModified}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language}
          value={editorCode}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            theme: 'vs-dark',
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            autoIndent: 'full',
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true,
            trimAutoWhitespace: true,
            renderWhitespace: 'selection',
            renderControlCharacters: false,
            fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
            fontLigatures: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            mouseWheelZoom: true,
            contextmenu: true,
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            acceptSuggestionOnCommitCharacter: true,
            snippetSuggestions: 'top',
            emptySelectionClipboard: false,
            copyWithSyntaxHighlighting: true,
            multiCursorModifier: 'ctrlCmd',
            accessibilitySupport: 'auto',
            find: {
              addExtraSpaceOnTop: false,
              autoFindInSelection: 'never',
              seedSearchStringFromSelection: 'always'
            },
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'mouseover',
            unfoldOnClickAfterEndOfLine: false,
            bracketPairColorization: {
              enabled: true
            },
            guides: {
              bracketPairs: true,
              bracketPairsHorizontal: true,
              highlightActiveBracketPair: true,
              indentation: true,
              highlightActiveIndentation: true
            },
            lightbulb: {
              enabled: true
            },
            codeActionsOnSave: {
              'source.fixAll': true,
              'source.organizeImports': true
            }
          }}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">Loading editor...</p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}