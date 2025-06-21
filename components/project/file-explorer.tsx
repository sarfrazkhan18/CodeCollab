'use client';

import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  FileIcon, 
  FolderIcon, 
  SearchIcon, 
  PlusIcon,
  FolderPlusIcon,
  FilePlusIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface FileExplorerProps {
  onSelectFile: (filePath: string) => void;
  files?: Record<string, string>;
  currentFile?: string | null;
  onFileCreated?: (filePath: string, content: string) => void;
  onFileDeleted?: (filePath: string) => void;
  onFileRenamed?: (oldPath: string, newPath: string) => void;
}

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
  expanded?: boolean;
}

export function FileExplorer({ 
  onSelectFile, 
  files = {}, 
  currentFile,
  onFileCreated,
  onFileDeleted,
  onFileRenamed
}: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [creatingItem, setCreatingItem] = useState<{ parentPath: string; type: 'file' | 'folder' } | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [renamingItem, setRenamingItem] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (Object.keys(files).length > 0) {
      const structure = buildFileStructure(files);
      setFileStructure(structure);
    } else {
      // Default structure if no files provided
      const defaultStructure: FileNode[] = [
        {
          id: '1',
          name: 'app',
          type: 'folder',
          path: 'app',
          expanded: true,
          children: [
            { id: '2', name: 'page.tsx', type: 'file', path: 'app/page.tsx' },
            { id: '3', name: 'layout.tsx', type: 'file', path: 'app/layout.tsx' },
            { id: '4', name: 'globals.css', type: 'file', path: 'app/globals.css' },
          ],
        },
        {
          id: '5',
          name: 'components',
          type: 'folder',
          path: 'components',
          expanded: false,
          children: [
            { id: '6', name: 'Header.tsx', type: 'file', path: 'components/Header.tsx' },
            { id: '7', name: 'Footer.tsx', type: 'file', path: 'components/Footer.tsx' },
          ],
        },
        { id: '8', name: 'package.json', type: 'file', path: 'package.json' },
        { id: '9', name: 'README.md', type: 'file', path: 'README.md' },
        { id: '10', name: 'tailwind.config.js', type: 'file', path: 'tailwind.config.js' },
      ];
      setFileStructure(defaultStructure);
    }
  }, [files]);

  const buildFileStructure = (files: Record<string, string>): FileNode[] => {
    const structure: FileNode[] = [];
    const folderMap = new Map<string, FileNode>();
    
    // Sort files to ensure folders come before files
    const sortedPaths = Object.keys(files).sort();
    
    sortedPaths.forEach((filePath, index) => {
      const parts = filePath.split('/');
      let currentPath = '';
      
      parts.forEach((part, partIndex) => {
        const isLast = partIndex === parts.length - 1;
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (isLast) {
          // It's a file
          const fileNode: FileNode = {
            id: `file-${index}-${partIndex}`,
            name: part,
            type: 'file',
            path: filePath,
          };
          
          if (parentPath) {
            const parentFolder = folderMap.get(parentPath);
            if (parentFolder) {
              parentFolder.children = parentFolder.children || [];
              parentFolder.children.push(fileNode);
            }
          } else {
            structure.push(fileNode);
          }
        } else {
          // It's a folder
          if (!folderMap.has(currentPath)) {
            const folderNode: FileNode = {
              id: `folder-${index}-${partIndex}`,
              name: part,
              type: 'folder',
              path: currentPath,
              expanded: partIndex === 0, // Expand root folders by default
              children: [],
            };
            
            folderMap.set(currentPath, folderNode);
            
            if (parentPath) {
              const parentFolder = folderMap.get(parentPath);
              if (parentFolder) {
                parentFolder.children = parentFolder.children || [];
                parentFolder.children.push(folderNode);
              }
            } else {
              structure.push(folderNode);
            }
          }
        }
      });
    });
    
    return structure;
  };

  const toggleFolder = (id: string) => {
    setFileStructure(prev => toggleFolderById(prev, id));
  };

  const toggleFolderById = (nodes: FileNode[], id: string): FileNode[] => {
    return nodes.map(node => {
      if (node.id === id) {
        return { ...node, expanded: !node.expanded };
      }
      if (node.children) {
        return { ...node, children: toggleFolderById(node.children, id) };
      }
      return node;
    });
  };

  const startCreating = (parentPath: string, type: 'file' | 'folder') => {
    setCreatingItem({ parentPath, type });
    setNewItemName('');
  };

  const startRenaming = (node: FileNode) => {
    setRenamingItem(node.path);
    setRenameValue(node.name);
  };

  const confirmCreate = () => {
    if (!newItemName.trim() || !creatingItem) return;

    const extension = creatingItem.type === 'file' && !newItemName.includes('.') 
      ? getDefaultExtension(newItemName) 
      : '';
    
    const fullName = newItemName + extension;
    const newPath = creatingItem.parentPath 
      ? `${creatingItem.parentPath}/${fullName}`
      : fullName;

    if (creatingItem.type === 'file') {
      const defaultContent = getDefaultFileContent(newPath);
      onFileCreated?.(newPath, defaultContent);
      toast({
        title: 'File created',
        description: `Created ${newPath}`,
      });
    } else {
      // For folders, create a placeholder file to establish the folder structure
      const placeholderPath = `${newPath}/.gitkeep`;
      onFileCreated?.(placeholderPath, '');
      toast({
        title: 'Folder created',
        description: `Created ${newPath}`,
      });
    }

    setCreatingItem(null);
    setNewItemName('');
  };

  const confirmRename = () => {
    if (!renameValue.trim() || !renamingItem) return;

    const pathParts = renamingItem.split('/');
    pathParts[pathParts.length - 1] = renameValue;
    const newPath = pathParts.join('/');

    onFileRenamed?.(renamingItem, newPath);
    
    toast({
      title: 'File renamed',
      description: `Renamed to ${newPath}`,
    });

    setRenamingItem(null);
    setRenameValue('');
  };

  const deleteItem = (path: string) => {
    onFileDeleted?.(path);
    toast({
      title: 'File deleted',
      description: `Deleted ${path}`,
    });
  };

  const getDefaultExtension = (name: string): string => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('component') || lowercaseName.includes('page')) return '.tsx';
    if (lowercaseName.includes('hook')) return '.ts';
    if (lowercaseName.includes('util') || lowercaseName.includes('helper')) return '.ts';
    if (lowercaseName.includes('style')) return '.css';
    if (lowercaseName.includes('test')) return '.test.ts';
    if (lowercaseName.includes('config')) return '.js';
    return '.tsx'; // Default to .tsx for React components
  };

  const getDefaultFileContent = (path: string): string => {
    const fileName = path.split('/').pop() || '';
    const baseName = fileName.split('.')[0];
    
    if (path.endsWith('.tsx')) {
      const componentName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
      return `export default function ${componentName}() {
  return (
    <div>
      <h1>${componentName}</h1>
      <p>Component created with CodeCollab AI</p>
    </div>
  );
}`;
    }
    
    if (path.endsWith('.ts')) {
      if (fileName.includes('hook')) {
        return `import { useState } from 'react';

export function use${baseName.charAt(0).toUpperCase() + baseName.slice(1)}() {
  const [state, setState] = useState();

  return {
    state,
    setState,
  };
}`;
      }
      return `// ${fileName}\n\nexport default {};`;
    }
    
    if (path.endsWith('.css')) {
      return `/* Styles for ${baseName} */\n\n.${baseName} {\n  /* Add your styles here */\n}`;
    }
    
    if (path.endsWith('.md')) {
      return `# ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}\n\nDocumentation for ${baseName}.`;
    }
    
    if (path.endsWith('.json')) {
      return '{\n  \n}';
    }
    
    return `// ${fileName}\n`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const colors = {
      tsx: 'text-blue-500',
      ts: 'text-blue-600',
      js: 'text-yellow-500',
      jsx: 'text-blue-400',
      css: 'text-pink-500',
      scss: 'text-pink-600',
      html: 'text-orange-500',
      json: 'text-green-500',
      md: 'text-gray-600',
      txt: 'text-gray-500',
    };
    
    return <FileIcon className={`h-4 w-4 ${colors[ext as keyof typeof colors] || 'text-gray-400'}`} />;
  };

  const filterNodes = (nodes: FileNode[], query: string): FileNode[] => {
    if (!query) return nodes;
    
    return nodes.filter(node => {
      if (node.type === 'file') {
        return node.name.toLowerCase().includes(query.toLowerCase());
      } else {
        const hasMatchingChildren = node.children && filterNodes(node.children, query).length > 0;
        const nameMatches = node.name.toLowerCase().includes(query.toLowerCase());
        return nameMatches || hasMatchingChildren;
      }
    }).map(node => {
      if (node.type === 'folder' && node.children) {
        return {
          ...node,
          children: filterNodes(node.children, query),
          expanded: true // Expand folders when searching
        };
      }
      return node;
    });
  };

  const renderFileTree = (nodes: FileNode[], level: number = 0) => {
    const filteredNodes = filterNodes(nodes, searchQuery);
    
    return filteredNodes.map(node => {
      if (node.type === 'folder') {
        return (
          <div key={node.id} className="select-none">
            <ContextMenu>
              <ContextMenuTrigger>
                <div 
                  className="flex items-center py-1 px-2 cursor-pointer hover:bg-accent rounded-sm group"
                  style={{ paddingLeft: `${level * 16 + 8}px` }}
                  onClick={() => toggleFolder(node.id)}
                >
                  <div className="mr-1">
                    {node.expanded ? (
                      <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <FolderIcon className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm flex-1">{node.name}</span>
                  <Badge variant="outline" className="opacity-0 group-hover:opacity-100 text-xs">
                    {node.children?.length || 0}
                  </Badge>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <ContextMenuItem 
                  className="flex items-center text-sm"
                  onClick={() => startCreating(node.path, 'file')}
                >
                  <FilePlusIcon className="h-4 w-4 mr-2" /> New File
                </ContextMenuItem>
                <ContextMenuItem 
                  className="flex items-center text-sm"
                  onClick={() => startCreating(node.path, 'folder')}
                >
                  <FolderPlusIcon className="h-4 w-4 mr-2" /> New Folder
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem 
                  className="flex items-center text-sm"
                  onClick={() => startRenaming(node)}
                >
                  <EditIcon className="h-4 w-4 mr-2" /> Rename
                </ContextMenuItem>
                <ContextMenuItem 
                  className="flex items-center text-sm text-red-600"
                  onClick={() => deleteItem(node.path)}
                >
                  <TrashIcon className="h-4 w-4 mr-2" /> Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            
            {/* Create new item input */}
            {creatingItem?.parentPath === node.path && (
              <div className="flex items-center py-1 px-2 ml-5" style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}>
                <div className="mr-1 w-4" />
                {creatingItem.type === 'file' ? (
                  <FileIcon className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <FolderIcon className="h-4 w-4 mr-2 text-green-500" />
                )}
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmCreate();
                    if (e.key === 'Escape') setCreatingItem(null);
                  }}
                  onBlur={confirmCreate}
                  placeholder={creatingItem.type === 'file' ? 'filename' : 'folder name'}
                  className="h-6 text-sm px-1"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 ml-1"
                  onClick={confirmCreate}
                >
                  <CheckIcon className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setCreatingItem(null)}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {node.expanded && node.children && (
              <div>{renderFileTree(node.children, level + 1)}</div>
            )}
          </div>
        );
      }
      
      return (
        <ContextMenu key={node.id}>
          <ContextMenuTrigger>
            <div 
              className={`flex items-center py-1 px-2 cursor-pointer hover:bg-accent rounded-sm group ${
                currentFile === node.path ? 'bg-accent' : ''
              }`}
              style={{ paddingLeft: `${level * 16 + 24}px` }}
              onClick={() => onSelectFile(node.path)}
            >
              {renamingItem === node.path ? (
                <>
                  {getFileIcon(node.name)}
                  <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmRename();
                      if (e.key === 'Escape') setRenamingItem(null);
                    }}
                    onBlur={confirmRename}
                    className="h-6 text-sm px-1 ml-2 flex-1"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 ml-1"
                    onClick={confirmRename}
                  >
                    <CheckIcon className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setRenamingItem(null)}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <>
                  {getFileIcon(node.name)}
                  <span className="text-sm ml-2 flex-1">{node.name}</span>
                  {currentFile === node.path && (
                    <div className="w-2 h-2 rounded-full bg-primary ml-2" />
                  )}
                </>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuItem 
              className="flex items-center text-sm"
              onClick={() => startRenaming(node)}
            >
              <EditIcon className="h-4 w-4 mr-2" /> Rename
            </ContextMenuItem>
            <ContextMenuItem 
              className="flex items-center text-sm text-red-600"
              onClick={() => deleteItem(node.path)}
            >
              <TrashIcon className="h-4 w-4 mr-2" /> Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-3 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Explorer</h3>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6"
              onClick={() => startCreating('', 'file')}
              title="New File"
            >
              <FilePlusIcon className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6"
              onClick={() => startCreating('', 'folder')}
              title="New Folder"
            >
              <FolderPlusIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files..."
            className="w-full pl-8 h-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Create new item at root level */}
          {creatingItem?.parentPath === '' && (
            <div className="flex items-center py-1 px-2 mb-2">
              {creatingItem.type === 'file' ? (
                <FileIcon className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <FolderIcon className="h-4 w-4 mr-2 text-green-500" />
              )}
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmCreate();
                  if (e.key === 'Escape') setCreatingItem(null);
                }}
                onBlur={confirmCreate}
                placeholder={creatingItem.type === 'file' ? 'filename' : 'folder name'}
                className="h-6 text-sm px-1"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 ml-1"
                onClick={confirmCreate}
              >
                <CheckIcon className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setCreatingItem(null)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <div className="space-y-1">{renderFileTree(fileStructure)}</div>
        </div>
      </ScrollArea>
    </div>
  );
}