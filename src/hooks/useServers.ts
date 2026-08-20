import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Server {
  id: string;
  name: string;
  icon_url?: string;
  description?: string;
  owner_id: string;
  is_public: boolean;
  created_at: string;
}

export function useServers() {
  const { data: servers = [], isLoading } = useQuery({
    queryKey: ['servers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .or(`owner_id.eq.${user.id},id.in(select server_id from server_members where user_id='${user.id}')`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Server[];
    },
  });

  return { servers, isLoading };
}