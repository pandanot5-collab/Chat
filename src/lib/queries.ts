import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Attachment, Channel, Message, Profile } from "@/lib/orbit";
import { randomCode } from "@/lib/orbit";

export type ServerRow = {
  id: string;
  name: string;
  icon_url: string | null;
  banner_url: string | null;
  description: string | null;
  owner_id: string;
  is_public: boolean;
  created_at: string;
};

export type MemberRow = {
  id: string;
  server_id: string;
  user_id: string;
  nickname: string | null;
  member_role: string;
  timeout_until: string | null;
  joined_at: string;
  profile?: Profile;
};

export type RoleRow = {
  id: string;
  server_id: string;
  name: string;
  color: string;
  position: number;
  hoisted: boolean;
  mentionable: boolean;
  permissions: Record<string, boolean>;
};

export type ReactionRow = {
  id: string;
  message_id: string;
  channel_id: string;
  user_id: string;
  emoji: string;
};

export type FriendshipRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
};

export type VoiceStateRow = {
  id: string;
  channel_id: string;
  user_id: string;
  server_id: string | null;
  self_mute: boolean;
  self_deaf: boolean;
  video: boolean;
  screen_share: boolean;
  profile?: Profile;
};

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/* ------------------------------------------------------------------ profiles */

export function useProfilesMap(ids: string[]) {
  const key = [...new Set(ids)].sort();
  return useQuery({
    queryKey: ["profiles", key],
    enabled: key.length > 0,
    queryFn: async () => {
      const data = unwrap(await supabase.from("profiles").select("*").in("id", key));
      const map: Record<string, Profile> = {};
      for (const p of data as Profile[]) map[p.id] = p;
      return map;
    },
  });
}

export function useSearchProfiles(term: string) {
  return useQuery({
    queryKey: ["profile-search", term],
    enabled: term.trim().length > 1,
    queryFn: async () =>
      unwrap(
        await supabase
          .from("profiles")
          .select("*")
          .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
          .limit(20),
      ) as Profile[],
  });
}

/* ------------------------------------------------------------------- servers */

export function useMyServers() {
  return useQuery({
    queryKey: ["my-servers"],
    queryFn: async () => {
      const memberships = unwrap(await supabase.from("server_members").select("server_id"));
      const ids = (memberships as { server_id: string }[]).map((m) => m.server_id);
      if (!ids.length) return [] as ServerRow[];
      const servers = unwrap(await supabase.from("servers").select("*").in("id", ids));
      return (servers as ServerRow[]).sort((a, b) => a.created_at.localeCompare(b.created_at));
    },
  });
}

export function useServer(serverId: string | undefined) {
  return useQuery({
    queryKey: ["server", serverId],
    enabled: !!serverId,
    queryFn: async () =>
      unwrap(await supabase.from("servers").select("*").eq("id", serverId!).maybeSingle()) as ServerRow,
  });
}

export function usePublicServers() {
  return useQuery({
    queryKey: ["public-servers"],
    queryFn: async () =>
      unwrap(
        await supabase.from("servers").select("*").eq("is_public", true).order("created_at"),
      ) as ServerRow[],
  });
}

export function useServerChannels(serverId: string | undefined) {
  return useQuery({
    queryKey: ["channels", serverId],
    enabled: !!serverId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from("channels")
          .select("*")
          .eq("server_id", serverId!)
          .order("position"),
      ) as Channel[],
  });
}

export function useCategories(serverId: string | undefined) {
  return useQuery({
    queryKey: ["categories", serverId],
    enabled: !!serverId,
    queryFn: async () =>
      unwrap(
        await supabase.from("categories").select("*").eq("server_id", serverId!).order("position"),
      ) as { id: string; name: string; position: number; server_id: string }[],
  });
}

export function useServerMembers(serverId: string | undefined) {
  return useQuery({
    queryKey: ["members", serverId],
    enabled: !!serverId,
    queryFn: async () => {
      const rows = unwrap(
        await supabase.from("server_members").select("*, profile:profiles(*)").eq("server_id", serverId!),
      ) as MemberRow[];
      return rows.sort((a, b) =>
        (a.profile?.display_name ?? "").localeCompare(b.profile?.display_name ?? ""),
      );
    },
  });
}

export function useRoles(serverId: string | undefined) {
  return useQuery({
    queryKey: ["roles", serverId],
    enabled: !!serverId,
    queryFn: async () =>
      unwrap(
        await supabase.from("roles").select("*").eq("server_id", serverId!).order("position", { ascending: false }),
      ) as RoleRow[],
  });
}

export function useMemberRoles(serverId: string | undefined) {
  return useQuery({
    queryKey: ["member-roles", serverId],
    enabled: !!serverId,
    queryFn: async () =>
      unwrap(await supabase.from("member_roles").select("*").eq("server_id", serverId!)) as {
        id: string;
        role_id: string;
        user_id: string;
      }[],
  });
}

export function useInvites(serverId: string | undefined) {
  return useQuery({
    queryKey: ["invites", serverId],
    enabled: !!serverId,
    queryFn: async () =>
      unwrap(
        await supabase.from("invites").select("*").eq("server_id", serverId!).order("created_at", { ascending: false }),
      ),
  });
}

export function useBans(serverId: string | undefined) {
  return useQuery({
    queryKey: ["bans", serverId],
    enabled: !!serverId,
    queryFn: async () =>
      unwrap(
        await supabase.from("bans").select("*, profile:profiles!bans_user_id_fkey(*)").eq("server_id", serverId!),
      ) as { id: string; user_id: string; reason: string | null; created_at: string; profile?: Profile }[],
  });
}

export function useAuditLog(serverId: string | undefined) {
  return useQuery({
    queryKey: ["audit", serverId],
    enabled: !!serverId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from("audit_logs")
          .select("*, actor:profiles(*)")
          .eq("server_id", serverId!)
          .order("created_at", { ascending: false })
          .limit(100),
      ) as { id: string; action: string; target: string | null; created_at: string; actor?: Profile }[],
  });
}

export async function logAudit(serverId: string, actorId: string, action: string, target?: string) {
  await supabase.from("audit_logs").insert({ server_id: serverId, actor_id: actorId, action, target: target ?? null });
}

/* ----------------------------------------------------------------------- DMs */

export type DMChannel = Channel & { members: Profile[]; unread?: boolean };

export function useDMChannels(userId: string | undefined) {
  return useQuery({
    queryKey: ["dm-channels", userId],
    enabled: !!userId,
    queryFn: async () => {
      const mine = unwrap(
        await supabase.from("channel_members").select("channel_id").eq("user_id", userId!),
      ) as { channel_id: string }[];
      const ids = mine.map((m) => m.channel_id);
      if (!ids.length) return [] as DMChannel[];
      const channels = unwrap(
        await supabase.from("channels").select("*").in("id", ids).order("last_message_at", { ascending: false }),
      ) as Channel[];
      const memberRows = unwrap(
        await supabase.from("channel_members").select("channel_id, user_id, profile:profiles(*)").in("channel_id", ids),
      ) as { channel_id: string; user_id: string; profile: Profile }[];
      return channels.map((c) => ({
        ...c,
        members: memberRows.filter((m) => m.channel_id === c.id && m.user_id !== userId).map((m) => m.profile),
      })) as DMChannel[];
    },
  });
}

export function useChannel(channelId: string | undefined) {
  return useQuery({
    queryKey: ["channel", channelId],
    enabled: !!channelId,
    queryFn: async () =>
      unwrap(await supabase.from("channels").select("*").eq("id", channelId!).maybeSingle()) as Channel,
  });
}

export function useChannelMembers(channelId: string | undefined) {
  return useQuery({
    queryKey: ["channel-members", channelId],
    enabled: !!channelId,
    queryFn: async () =>
      (
        unwrap(
          await supabase.from("channel_members").select("user_id, profile:profiles(*)").eq("channel_id", channelId!),
        ) as { user_id: string; profile: Profile }[]
      ).map((r) => r.profile),
  });
}

/* ------------------------------------------------------------------ messages */

const PAGE_SIZE = 60;

export function useMessages(channelId: string | undefined) {
  return useQuery({
    queryKey: ["messages", channelId],
    enabled: !!channelId,
    queryFn: async () => {
      const rows = unwrap(
        await supabase
          .from("messages")
          .select("*, author:profiles(*)")
          .eq("channel_id", channelId!)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(PAGE_SIZE),
      ) as (Message & { author: Profile | null })[];
      return rows.reverse();
    },
  });
}

export function useReactions(channelId: string | undefined) {
  return useQuery({
    queryKey: ["reactions", channelId],
    enabled: !!channelId,
    queryFn: async () =>
      unwrap(await supabase.from("message_reactions").select("*").eq("channel_id", channelId!)) as ReactionRow[],
  });
}

export function usePinnedMessages(channelId: string | undefined) {
  return useQuery({
    queryKey: ["pins", channelId],
    enabled: !!channelId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from("messages")
          .select("*, author:profiles(*)")
          .eq("channel_id", channelId!)
          .eq("pinned", true)
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
      ) as (Message & { author: Profile | null })[],
  });
}

/** Realtime: messages + reactions for one channel. */
export function useChannelRealtime(channelId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!channelId) return;
    const channel = supabase
      .channel(`channel-${channelId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
        () => {
          void qc.invalidateQueries({ queryKey: ["messages", channelId] });
          void qc.invalidateQueries({ queryKey: ["pins", channelId] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "message_reactions", filter: `channel_id=eq.${channelId}` },
        () => void qc.invalidateQueries({ queryKey: ["reactions", channelId] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [channelId, qc]);
}

/** Realtime: anything that changes the sidebars. */
export function useGlobalRealtime(userId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`global-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => {
        void qc.invalidateQueries({ queryKey: ["friends"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "server_members" }, () => {
        void qc.invalidateQueries({ queryKey: ["my-servers"] });
        void qc.invalidateQueries({ queryKey: ["members"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "channels" }, () => {
        void qc.invalidateQueries({ queryKey: ["channels"] });
        void qc.invalidateQueries({ queryKey: ["dm-channels"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        void qc.invalidateQueries({ queryKey: ["members"] });
        void qc.invalidateQueries({ queryKey: ["friends"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}

export function useSendMessage(channelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      content: string;
      authorId: string;
      replyToId?: string | null;
      attachments?: Attachment[];
      mentions?: string[];
    }) => {
      const { error } = await supabase.from("messages").insert({
        channel_id: channelId,
        author_id: input.authorId,
        content: input.content,
        reply_to_id: input.replyToId ?? null,
        attachments: (input.attachments ?? []) as unknown as never,
        mentions: input.mentions ?? [],
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["messages", channelId] });
      void qc.invalidateQueries({ queryKey: ["dm-channels"] });
    },
  });
}

export async function editMessage(id: string, content: string) {
  const { error } = await supabase
    .from("messages")
    .update({ content, edited_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteMessage(id: string) {
  const { error } = await supabase.from("messages").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function togglePin(id: string, pinned: boolean) {
  const { error } = await supabase.from("messages").update({ pinned }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function toggleReaction(
  messageId: string,
  channelId: string,
  userId: string,
  emoji: string,
  existingId?: string,
) {
  if (existingId) {
    const { error } = await supabase.from("message_reactions").delete().eq("id", existingId);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase
    .from("message_reactions")
    .insert({ message_id: messageId, channel_id: channelId, user_id: userId, emoji });
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------- friends */

export type FriendEntry = { friendship: FriendshipRow; profile: Profile; direction: "in" | "out" };

export function useFriends(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", userId],
    enabled: !!userId,
    queryFn: async () => {
      const rows = unwrap(await supabase.from("friendships").select("*")) as FriendshipRow[];
      const otherIds = rows.map((r) => (r.requester_id === userId ? r.addressee_id : r.requester_id));
      const profiles = otherIds.length
        ? ((unwrap(await supabase.from("profiles").select("*").in("id", otherIds)) as Profile[]) ?? [])
        : [];
      const byId = Object.fromEntries(profiles.map((p) => [p.id, p]));
      return rows
        .map((r) => {
          const otherId = r.requester_id === userId ? r.addressee_id : r.requester_id;
          const profile = byId[otherId];
          if (!profile) return null;
          return {
            friendship: r,
            profile,
            direction: r.requester_id === userId ? "out" : "in",
          } as FriendEntry;
        })
        .filter(Boolean) as FriendEntry[];
    },
  });
}

export async function sendFriendRequest(userId: string, username: string) {
  const { data: target, error: e1 } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username.trim())
    .maybeSingle();
  if (e1) throw new Error(e1.message);
  if (!target) throw new Error("No one with that username");
  if (target.id === userId) throw new Error("You cannot add yourself");
  const { data: existing } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${target.id},addressee_id.eq.${target.id}`)
    .maybeSingle();
  if (existing) throw new Error("You already have a pending or active connection");
  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: userId, addressee_id: target.id, status: "pending" });
  if (error) throw new Error(error.message);
  return target as Profile;
}

export async function respondToFriendRequest(id: string, status: "accepted" | "declined") {
  if (status === "declined") {
    const { error } = await supabase.from("friendships").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase.from("friendships").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removeFriendship(id: string) {
  const { error } = await supabase.from("friendships").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function blockUser(userId: string, otherId: string, existingId?: string) {
  if (existingId) {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "blocked", requester_id: userId, addressee_id: otherId })
      .eq("id", existingId);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: userId, addressee_id: otherId, status: "blocked" });
  if (error) throw new Error(error.message);
}

export async function openDM(otherId: string) {
  const { data, error } = await supabase.rpc("get_or_create_dm", { _other: otherId });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function createGroupDM(name: string, members: string[]) {
  const { data, error } = await supabase.rpc("create_group_dm", { _name: name, _members: members });
  if (error) throw new Error(error.message);
  return data as string;
}

/* --------------------------------------------------------------------- voice */

export function useVoiceStates(serverId: string | undefined) {
  return useQuery({
    queryKey: ["voice-states", serverId],
    enabled: !!serverId,
    queryFn: async () =>
      unwrap(
        await supabase.from("voice_states").select("*, profile:profiles(*)").eq("server_id", serverId!),
      ) as VoiceStateRow[],
  });
}

export function useVoiceRealtime(serverId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!serverId) return;
    const channel = supabase
      .channel(`voice-states-${serverId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "voice_states" }, () => {
        void qc.invalidateQueries({ queryKey: ["voice-states", serverId] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [serverId, qc]);
}

/* ------------------------------------------------------------------- uploads */

export async function uploadFile(userId: string, file: File): Promise<Attachment> {
  const path = `${userId}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
  const { error } = await supabase.storage.from("attachments").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw new Error(error.message);
  const { data, error: signErr } = await supabase.storage
    .from("attachments")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  if (signErr) throw new Error(signErr.message);
  return {
    url: data!.signedUrl,
    name: file.name,
    size: file.size,
    contentType: file.type || "application/octet-stream",
  };
}

/* ------------------------------------------------------------------- servers */

export async function createServer(name: string, ownerId: string, iconUrl?: string | null) {
  const { data, error } = await supabase
    .from("servers")
    .insert({ name, owner_id: ownerId, icon_url: iconUrl ?? null })
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ServerRow;
}

export async function createChannel(input: {
  serverId: string;
  categoryId: string | null;
  name: string;
  type: string;
  topic?: string;
  createdBy: string;
}) {
  const { data, error } = await supabase
    .from("channels")
    .insert({
      server_id: input.serverId,
      category_id: input.categoryId,
      name: input.name,
      type: input.type,
      topic: input.topic ?? null,
      created_by: input.createdBy,
    })
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Channel;
}

export async function createInvite(input: {
  serverId: string;
  channelId?: string | null;
  createdBy: string;
  maxUses: number | null;
  expiresInHours: number | null;
}) {
  const code = randomCode(8);
  const { data, error } = await supabase
    .from("invites")
    .insert({
      code,
      server_id: input.serverId,
      channel_id: input.channelId ?? null,
      created_by: input.createdBy,
      max_uses: input.maxUses,
      expires_at: input.expiresInHours
        ? new Date(Date.now() + input.expiresInHours * 3600_000).toISOString()
        : null,
    })
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as { code: string };
}

export async function searchMessages(params: {
  query: string;
  serverId?: string | null;
  channelId?: string | null;
  authorId?: string | null;
}) {
  const { data, error } = await supabase.rpc("search_messages", {
    _query: params.query,
    _server: params.serverId ?? null,
    _channel: params.channelId ?? null,
    _author: params.authorId ?? null,
    _limit: 50,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as Message[];
}
