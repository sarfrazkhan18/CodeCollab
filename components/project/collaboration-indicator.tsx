'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UsersIcon } from 'lucide-react';

interface User {
  name: string;
  color: string;
}

interface CollaborationIndicatorProps {
  projectId: string;
  filePath: string;
}

export function CollaborationIndicator({ projectId, filePath }: CollaborationIndicatorProps) {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  useEffect(() => {
    // In production, this would use WebSocket
    const mockUsers: User[] = [
      { name: 'Alice', color: '#FF6B6B' },
      { name: 'Bob', color: '#4ECDC4' },
      { name: 'Charlie', color: '#45B7D1' },
    ];
    setActiveUsers(mockUsers);

    const interval = setInterval(() => {
      // Simulate users joining/leaving
      if (Math.random() > 0.7) {
        const newUser = {
          name: `User${Math.floor(Math.random() * 100)}`,
          color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        };
        setActiveUsers(prev => [...prev, newUser]);
      } else if (activeUsers.length > 1 && Math.random() > 0.7) {
        setActiveUsers(prev => prev.slice(0, -1));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 3).map((user, i) => (
          <Tooltip key={i}>
            <TooltipTrigger>
              <Avatar
                className="border-2 border-background"
                style={{ backgroundColor: user.color }}
              >
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{user.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      {activeUsers.length > 3 && (
        <div className="flex items-center text-sm text-muted-foreground">
          <UsersIcon className="h-4 w-4 mr-1" />
          +{activeUsers.length - 3} more
        </div>
      )}
    </div>
  );
}