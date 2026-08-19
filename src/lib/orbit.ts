export type Presence = "online" | "idle" | "dnd" | "invisible" | "offline";

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  accent_color: string | null;
  custom_status: string | null;
  presence: string;
  last_seen: string;
};

export type ChannelType = "text" | "voice" | "announcement" | "forum" | "stage" | "dm" | "group_dm";

export type Channel = {
  id: string;
  server_id: string | null;
  category_id: string | null;
  name: string | null;
  type: string;
  topic: string | null;
  position: number;
  slowmode_seconds: number;
  is_locked: boolean;
  nsfw: boolean;
  user_limit: number | null;
  created_by: string | null;
  last_message_at: string;
};

export type Message = {
  id: string;
  channel_id: string;
  author_id: string | null;
  content: string;
  reply_to_id: string | null;
  attachments: Attachment[];
  mentions: string[];
  pinned: boolean;
  is_system: boolean;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
};

export type Attachment = {
  url: string;
  name: string;
  size: number;
  contentType: string;
  width?: number;
  height?: number;
};

export type MemberRole = "owner" | "admin" | "moderator" | "member";

export const ROLE_RANK: Record<string, number> = {
  owner: 3,
  admin: 2,
  moderator: 1,
  member: 0,
};

export const PERMISSION_KEYS = [
  "administrator",
  "manage_server",
  "manage_channels",
  "manage_roles",
  "manage_messages",
  "manage_members",
  "ban_members",
  "kick_members",
  "timeout_members",
  "view_channels",
  "send_messages",
  "embed_links",
  "attach_files",
  "add_reactions",
  "mention_everyone",
  "create_invites",
  "connect",
  "speak",
  "stream",
  "use_video",
  "mute_members",
  "move_members",
  "create_threads",
  "manage_threads",
  "manage_webhooks",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  administrator: "Administrator",
  manage_server: "Manage community",
  manage_channels: "Manage channels",
  manage_roles: "Manage roles",
  manage_messages: "Manage messages",
  manage_members: "Manage members",
  ban_members: "Ban members",
  kick_members: "Remove members",
  timeout_members: "Timeout members",
  view_channels: "View channels",
  send_messages: "Send messages",
  embed_links: "Embed links",
  attach_files: "Attach files",
  add_reactions: "Add reactions",
  mention_everyone: "Mention everyone",
  create_invites: "Create invites",
  connect: "Join voice",
  speak: "Speak",
  stream: "Share screen",
  use_video: "Use camera",
  mute_members: "Mute members",
  move_members: "Move members",
  create_threads: "Create threads",
  manage_threads: "Manage threads",
  manage_webhooks: "Manage webhooks",
};

export function initials(name: string) {
  return name
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function presenceColor(p: string | undefined) {
  switch (p) {
    case "online":
      return "bg-online";
    case "idle":
      return "bg-idle";
    case "dnd":
      return "bg-dnd";
    default:
      return "bg-offline";
  }
}

export function presenceLabel(p: string | undefined) {
  switch (p) {
    case "online":
      return "Online";
    case "idle":
      return "Away";
    case "dnd":
      return "Do not disturb";
    case "invisible":
      return "Invisible";
    default:
      return "Offline";
  }
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDayDivider(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}

export function formatFullTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function shouldGroup(prev: Message | undefined, next: Message) {
  if (!prev) return false;
  if (prev.author_id !== next.author_id) return false;
  if (prev.is_system || next.is_system) return false;
  if (next.reply_to_id) return false;
  return new Date(next.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60 * 1000;
}

export const DEFAULT_EMOJIS = [
  "👍",
  "❤️",
  "😂",
  "🎉",
  "🔥",
  "👀",
  "😮",
  "😢",
  "🙏",
  "🚀",
  "💡",
  "✅",
];

export const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "Smileys",
    emojis: "😀 😃 😄 😁 😆 😅 😂 🙂 🙃 😉 😊 😇 🥰 😍 😘 😗 😙 😚 😋 😛 😝 🤪 🤨 🧐 🤓 😎 🥳 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 🤥 😶 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪".split(" "),
  },
  {
    label: "Gestures",
    emojis: "👍 👎 👌 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐 🖖 👋 🤝 🙏 💪 🦾 ✍️ 👏 🙌 👐 🤲".split(" "),
  },
  {
    label: "Objects",
    emojis: "🔥 ✨ 🎉 🎊 🎈 🎁 🏆 🥇 ⚡ 💡 📌 📎 🔒 🔑 🛠 ⚙️ 🧪 🧬 🔬 💻 🖥 ⌨️ 🖱 📱 ☎️ 📷 🎥 🎬 🎧 🎵 📚 📝".split(" "),
  },
  {
    label: "Nature",
    emojis: "🌱 🌿 🍀 🌳 🌵 🌸 🌼 🌻 🌈 ☀️ 🌤 ⛅ 🌧 ⛈ ❄️ 🌊 🔮 🌍 🌙 ⭐ 🌟 💫 🐶 🐱 🦊 🐻 🐼 🐨 🦁 🐸 🐵 🦄".split(" "),
  },
];

export function randomCode(len = 8) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += chars[arr[i]! % chars.length];
  return out;
}

export function channelIcon(type: string) {
  return type;
}

export function extractMentions(content: string, members: { id: string; username: string }[]) {
  const ids: string[] = [];
  for (const m of members) {
    if (new RegExp(`@${m.username}\\b`, "i").test(content)) ids.push(m.id);
  }
  return ids;
}

export const SLOWMODE_OPTIONS = [0, 5, 10, 30, 60, 300, 900, 3600];
