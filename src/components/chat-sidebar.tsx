import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Plus, Settings, LogOut } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatSidebarProps {
  servers?: Array<{ id: string; name: string; icon?: string }>;
  currentServer?: { id: string; name: string };
  onServerSelect?: (serverId: string) => void;
  userDisplayName?: string;
}

export function ChatSidebar({ servers = [], currentServer, onServerSelect, userDisplayName = 'User' }: ChatSidebarProps) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-full w-60 flex-col border-r border-slate-700 bg-slate-900">
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && <h2 className="font-bold text-white">Servers</h2>}
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)}>
            <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-2">
            {servers.length === 0 ? (
              <p className="text-sm text-slate-400">No servers yet</p>
            ) : (
              servers.map((server) => (
                <Button
                  key={server.id}
                  variant={currentServer?.id === server.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => onServerSelect?.(server.id)}
                >
                  {server.icon && <span className="mr-2">{server.icon}</span>}
                  {server.name}
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      )}

      {!isCollapsed && (
        <div className="space-y-2 border-t border-slate-700 p-4">
          <Button variant="outline" className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Server
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create DM
          </Button>
        </div>
      )}

      {!isCollapsed && (
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center justify-between rounded-lg bg-slate-800 p-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{userDisplayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{userDisplayName}</p>
                <p className="text-xs text-slate-400">Online</p>
              </div>
            </div>
          </div>
          <div className="mt-2 flex space-x-2">
            <Button variant="ghost" size="sm" className="flex-1">
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => navigate({ to: '/auth/logout' })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}