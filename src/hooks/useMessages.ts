import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  channel_id: string;
  author_id: string;
  content: string;
  attachments: unknown[];
  created_at: string;
  edited_at?: string;
  deleted_at?: string;
}

export function useMessages(channelId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!channelId,
  });

  useEffect(() => {
    if (data) setMessages(data);
  }, [data]);

  const sendMessage = useCallback(
    async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          author_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      setMessages((prev) => [...prev, data]);
      return data;
    },
    [channelId]
  );

  return { messages, isLoading, sendMessage };
}