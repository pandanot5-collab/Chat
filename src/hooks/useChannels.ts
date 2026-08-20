import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Channel {
  id: string;
  server_id?: string;
  name: string;
  type: 'text' | 'voice' | 'dm' | 'group_dm' | 'forum';
  topic?: string;
  position: number;
  created_at: string;
}

export function useChannels(serverId?: string) {
  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['channels', serverId],
    queryFn: async () => {
      let query = supabase.from('channels').select('*');

      if (serverId) {
        query = query.eq('server_id', serverId);
      }

      const { data, error } = await query.order('position', { ascending: true });
      if (error) throw error;
      return data as Channel[];
    },
    enabled: !!serverId,
  });

  return { channels, isLoading };
}