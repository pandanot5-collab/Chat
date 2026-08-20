import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Settings, Search, Hash } from 'lucide-react';

interface ChatHeaderProps {
  channelName?: string;
  channelTopic?: string;
  onSearchChange?: (query: string) => void;
}

export function ChatHeader({ channelName = 'general', channelTopic = '', onSearchChange }: ChatHeaderProps) {
  return (
    <div className="border-b border-slate-700 bg-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Hash className="h-5 w-5 text-slate-400" />
            <div>
              <h1 className="font-bold text-white">{channelName}</h1>
              {channelTopic && <p className="text-sm text-slate-400">{channelTopic}</p>}
            </div>
          </div>
        </div>

        <div className="flex-1 px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search messages..."
              className="border-slate-600 bg-slate-700 pl-10 text-white placeholder-slate-400"
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}