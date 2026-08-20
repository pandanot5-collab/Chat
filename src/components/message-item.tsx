import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Smile, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessageItemProps {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  reactions?: Array<{ emoji: string; count: number }>;
  isOwn?: boolean;
}

export function MessageItem({ author, content, timestamp, reactions = [], isOwn }: MessageItemProps) {
  return (
    <div className="group flex space-x-4 px-4 py-2 hover:bg-slate-700/50">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={author.avatar} />
        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-white">{author.name}</h3>
          <span className="text-xs text-slate-400">{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
        </div>

        <p className="mt-1 text-slate-100">{content}</p>

        {reactions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {reactions.map((reaction, i) => (
              <button
                key={i}
                className="rounded-full bg-slate-700 px-2 py-1 text-sm hover:bg-slate-600"
              >
                {reaction.emoji} {reaction.count}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden space-x-1 group-hover:flex">
        <Button variant="ghost" size="sm">
          <Smile className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Reply className="h-4 w-4" />
        </Button>
        {isOwn && (
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}