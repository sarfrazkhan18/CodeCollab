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
  FilePlusIcon
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface FileExplorerProps {
  onSelectFile: (filePath: string) => void;
  files?: Record<string, string>;
  currentFile?: string | null;
}

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
  expanded?: boolean;
}

export function FileExplorer({ onSelectFile, files = {}, currentFile }: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);

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

  const renderFileTree = (nodes: FileNode[]) => {
    const filteredNodes = filterNodes(nodes, searchQuery);
    
    return filteredNodes.map(node => {
      if (node.type === 'folder') {
        return (
          <div key={node.id} className="select-none">
            <ContextMenu>
              <ContextMenuTrigger>
                <div 
                  className="flex items-center py-1 px-2 cursor-pointer hover:bg-accent rounded-sm group"
                  onClick={() => toggleFolder(node.id)}
                >
                  <div className="mr-1">
                    {node.expanded ? (
                      <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <FolderIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{node.name}</span>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <ContextMenuItem className="flex items-center text-sm">
                  <FilePlusIcon className="h-4 w-4 mr-2" /> New File
                </ContextMenuItem>
                <ContextMenuItem className="flex items-center text-sm">
                  <FolderPlusIcon className="h-4 w-4 mr-2" /> New Folder
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            {node.expanded && node.children && (
              <div className="pl-5">{renderFileTree(node.children)}</div>
            )}
          </div>
        );
      }
      
      return (
        <ContextMenu key={node.id}>
          <ContextMenuTrigger>
            <div 
              className={`flex items-center py-1 px-2 cursor-pointer hover:bg-accent rounded-sm group ml-5 ${
                currentFile === node.path ? 'bg-accent' : ''
              }`}
              onClick={() => onSelectFile(node.path)}
            >
              <FileIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{node.name}</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuItem className="flex items-center text-sm">
              Rename
            </ContextMenuItem>
            <ContextMenuItem className="flex items-center text-sm text-red-500">
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-2 border-b flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon" title="New File">
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">{renderFileTree(fileStructure)}</div>
      </ScrollArea>
    </div>
  );
}