import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/orbit";

export type UserSettings = {
  user_id: string;
  theme: string;
  accent: string;
  message_density: string;
  font_scale: number;
  reduced_motion: boolean;
  desktop_notifications: boolean;
  notification_sounds: boolean;
  dm_permission: string;
  friend_requests_open: boolean;
  show_presence: boolean;
  push_to_talk: boolean;
  noise_suppression: boolean;
  echo_cancellation: boolean;
  input_device: string | null;
  output_device: string | null;
  camera_device: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  settings: UserSettings | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEFAULT_SETTINGS: Omit<UserSettings, "user_id"> = {
  theme: "dark",
  accent: "aurora",
  message_density: "cozy",
  font_scale: 1,
  reduced_motion: false,
  desktop_notifications: true,
  notification_sounds: true,
  dm_permission: "friends",
  friend_requests_open: true,
  show_presence: true,
  push_to_talk: false,
  noise_suppression: true,
  echo_cancellation: true,
  input_device: null,
  output_device: null,
  camera_device: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (!active) return;
      setSession(next);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setSettings(null);
        queryClient.clear();
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      const [{ data: prof }, { data: setts }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId!).maybeSingle(),
        supabase.from("user_settings").select("*").eq("user_id", userId!).maybeSingle(),
      ]);
      if (cancelled) return;
      if (prof) setProfile(prof as Profile);
      if (setts) {
        setSettings(setts as UserSettings);
      } else {
        const { data: created } = await supabase
          .from("user_settings")
          .insert({ user_id: userId!, ...DEFAULT_SETTINGS })
          .select()
          .maybeSingle();
        if (!cancelled && created) setSettings(created as UserSettings);
      }
      // mark online
      await supabase
        .from("profiles")
        .update({ presence: "online", last_seen: new Date().toISOString() })
        .eq("id", userId!);
    }

    void load();

    const heartbeat = setInterval(() => {
      void supabase.from("profiles").update({ last_seen: new Date().toISOString() }).eq("id", userId);
    }, 60_000);

    const goOffline = () => {
      void supabase.from("profiles").update({ presence: "offline" }).eq("id", userId);
    };
    window.addEventListener("beforeunload", goOffline);

    return () => {
      cancelled = true;
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", goOffline);
    };
  }, [userId]);

  // live profile updates (presence, avatar, status)
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`self-profile-${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
        (payload) => setProfile(payload.new as Profile),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  // apply appearance
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("theme-light", settings?.theme === "light");
    root.classList.remove("accent-ember", "accent-forest", "accent-rose");
    if (settings?.accent && settings.accent !== "aurora") root.classList.add(`accent-${settings.accent}`);
    root.classList.toggle("density-compact", settings?.message_density === "compact");
    root.classList.toggle("reduce-motion", !!settings?.reduced_motion);
    root.style.setProperty("--font-scale", String(settings?.font_scale ?? 1));
  }, [settings]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      settings,
      loading,
      refreshProfile: async () => {
        if (!userId) return;
        const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
        if (data) setProfile(data as Profile);
      },
      updateSettings: async (patch) => {
        if (!userId) return;
        setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
        await supabase.from("user_settings").update(patch).eq("user_id", userId);
      },
      signOut: async () => {
        if (userId) await supabase.from("profiles").update({ presence: "offline" }).eq("id", userId);
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
      },
    }),
    [session, profile, settings, loading, userId, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
