import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ChatSidebar } from '@/components/chat-sidebar';
import { ChatHeader } from '@/components/chat-header';
import { MessageItem } from '@/components/message-item';
import { MessageInput } from '@/components/message-input';
import { ScrollArea } from '@/components/ui/scroll-area';

export const Route = createFileRoute('/dashboard')({ component: DashboardPage });

function DashboardPage() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      author: { id: 'u1', name: 'Alex', avatar: undefined },
      content: 'Welcome to the chat! This is a test message.',
      timestamp: new Date(Date.now() - 5 * 60000),
      reactions: [{ emoji: '👍', count: 2 }],
      isOwn: false,
    },
    {
      id: '2',
      author: { id: 'u2', name: 'Jordan', avatar: undefined },
      content: 'Hey everyone! Happy to be here.',
      timestamp: new Date(Date.now() - 2 * 60000),
      reactions: [],
      isOwn: false,
    },
  ]);

  const [currentServer] = useState({
    id: 'server-1',
    name: 'General',
  });

  const servers = [
    { id: 'server-1', name: 'General' },
    { id: 'server-2', name: 'Development' },
    { id: 'server-3', name: 'Gaming' },
  ];

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      author: { id: 'current-user', name: 'You', avatar: undefined },
      content,
      timestamp: new Date(),
      reactions: [],
      isOwn: true,
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950">
      <ChatSidebar
        servers={servers}
        currentServer={currentServer}
        userDisplayName="Current User"
      />

      <div className="flex flex-1 flex-col">
        <ChatHeader channelName="general" channelTopic="General discussion" />

        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {messages.map((msg) => (
              <MessageItem key={msg.id} {...msg} />
            ))}
          </div>
        </ScrollArea>

        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}