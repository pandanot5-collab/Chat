import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Send } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageInputProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled || sending) return;

    setSending(true);
    try {
      await onSend?.(message);
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2 border-t border-slate-700 p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top">
          <DropdownMenuItem>Upload Image</DropdownMenuItem>
          <DropdownMenuItem>Upload File</DropdownMenuItem>
          <DropdownMenuItem>Create Poll</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Textarea
        placeholder="Type a message... (Shift+Enter for new line)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || sending}
        className="max-h-24 resize-none border-slate-600 bg-slate-700 text-white placeholder-slate-400"
        rows={1}
      />

      <Button type="submit" disabled={disabled || sending || !message.trim()} size="icon">
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}