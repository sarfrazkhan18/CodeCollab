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
}

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
  expanded?: boolean;
}

export function FileExplorer({ onSelectFile }: FileExplorerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);

  useEffect(() => {
    const fetchFileStructure = async () => {
      try {
        setIsLoading(true);
        
        // This would be a real API call in production
        // For demo purposes, we're using mock data
        setTimeout(() => {
          const mockFileStructure: FileNode[] = [
            {
              id: '1',
              name: 'src',
              type: 'folder',
              path: 'src',
              expanded: true,
              children: [
                {
                  id: '2',
                  name: 'components',
                  type: 'folder',
                  path: 'src/components',
                  expanded: false,
                  children: [
                    { id: '3', name: 'Header.tsx', type: 'file', path: 'src/components/Header.tsx' },
                    { id: '4', name: 'Feed.tsx', type: 'file', path: 'src/components/Feed.tsx' },
                    { id: '5', name: 'Sidebar.tsx', type: 'file', path: 'src/components/Sidebar.tsx' },
                  ],
                },
                { id: '6', name: 'App.tsx', type: 'file', path: 'src/App.tsx' },
                { id: '7', name: 'index.tsx', type: 'file', path: 'src/index.tsx' },
                { id: '8', name: 'index.css', type: 'file', path: 'src/index.css' },
              ],
            },
            {
              id: '9',
              name: 'public',
              type: 'folder',
              path: 'public',
              expanded: false,
              children: [
                { id: '10', name: 'index.html', type: 'file', path: 'public/index.html' },
                { id: '11', name: 'favicon.ico', type: 'file', path: 'public/favicon.ico' },
              ],
            },
            { id: '12', name: 'package.json', type: 'file', path: 'package.json' },
            { id: '13', name: 'tsconfig.json', type: 'file', path: 'tsconfig.json' },
            { id: '14', name: 'README.md', type: 'file', path: 'README.md' },
          ];
          setFileStructure(mockFileStructure);
          setIsLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('Error fetching file structure:', error);
        setIsLoading(false);
      }
    };

    fetchFileStructure();
  }, []);

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

  const renderFileTree = (nodes: FileNode[]) => {
    return nodes
      .filter(node => 
        searchQuery === '' || 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.children && node.children.some(child => 
          child.name.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
      .map(node => {
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
                className="flex items-center py-1 px-2 cursor-pointer hover:bg-accent rounded-sm group ml-5"
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
        {isLoading ? (
          <div className="animate-pulse space-y-2 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-5 bg-muted rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">{renderFileTree(fileStructure)}</div>
        )}
      </ScrollArea>
    </div>
  );
}