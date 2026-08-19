
-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  accent_color TEXT,
  custom_status TEXT,
  presence TEXT NOT NULL DEFAULT 'online',
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE base TEXT; final TEXT; n INT := 0;
BEGIN
  base := lower(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1),'user'), '[^a-z0-9_.]', '', 'g'));
  IF base = '' THEN base := 'user'; END IF;
  final := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final) LOOP
    n := n + 1; final := base || n::text;
  END LOOP;
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, final, COALESCE(NEW.raw_user_meta_data->>'display_name', final));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- FRIENDSHIPS / BLOCKS
-- =========================
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);
CREATE INDEX friendships_addressee_idx ON public.friendships(addressee_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "friendship visible to parties" ON public.friendships FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());
CREATE POLICY "friendship create" ON public.friendships FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid() AND addressee_id <> auth.uid());
CREATE POLICY "friendship update by parties" ON public.friendships FOR UPDATE TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());
CREATE POLICY "friendship delete by parties" ON public.friendships FOR DELETE TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());
CREATE TRIGGER friendships_touch BEFORE UPDATE ON public.friendships
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- SERVERS
-- =========================
CREATE TABLE public.servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT,
  icon_url TEXT,
  banner_url TEXT,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servers TO authenticated;
GRANT ALL ON public.servers TO service_role;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.server_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nickname TEXT,
  member_role TEXT NOT NULL DEFAULT 'member',
  timeout_until TIMESTAMPTZ,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (server_id, user_id)
);
CREATE INDEX server_members_user_idx ON public.server_members(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.server_members TO authenticated;
GRANT ALL ON public.server_members TO service_role;
ALTER TABLE public.server_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_server_member(_server UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.server_members WHERE server_id = _server AND user_id = _user);
$$;

CREATE OR REPLACE FUNCTION public.server_role(_server UUID, _user UUID)
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT member_role FROM public.server_members WHERE server_id = _server AND user_id = _user;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_server(_server UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.server_members
    WHERE server_id = _server AND user_id = _user AND member_role IN ('owner','admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_moderate(_server UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.server_members
    WHERE server_id = _server AND user_id = _user AND member_role IN ('owner','admin','moderator')
  );
$$;

CREATE POLICY "servers visible to members or public" ON public.servers FOR SELECT TO authenticated
  USING (is_public OR public.is_server_member(id, auth.uid()));
CREATE POLICY "servers insert own" ON public.servers FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "servers update by admins" ON public.servers FOR UPDATE TO authenticated
  USING (public.can_manage_server(id, auth.uid()));
CREATE POLICY "servers delete by owner" ON public.servers FOR DELETE TO authenticated
  USING (owner_id = auth.uid());
CREATE TRIGGER servers_touch BEFORE UPDATE ON public.servers
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "members visible to server members" ON public.server_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_server_member(server_id, auth.uid()));
CREATE POLICY "members can join self" ON public.server_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "members update self or by mods" ON public.server_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.can_moderate(server_id, auth.uid()));
CREATE POLICY "members leave or kicked" ON public.server_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.can_moderate(server_id, auth.uid()));

-- owner membership on server create
CREATE OR REPLACE FUNCTION public.handle_new_server() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cat_id UUID;
BEGIN
  INSERT INTO public.server_members (server_id, user_id, member_role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  INSERT INTO public.categories (server_id, name, position) VALUES (NEW.id, 'Text Channels', 0) RETURNING id INTO cat_id;
  INSERT INTO public.channels (server_id, category_id, name, type, position, topic)
  VALUES (NEW.id, cat_id, 'general', 'text', 0, 'Welcome to ' || NEW.name);
  INSERT INTO public.categories (server_id, name, position) VALUES (NEW.id, 'Voice Channels', 1) RETURNING id INTO cat_id;
  INSERT INTO public.channels (server_id, category_id, name, type, position)
  VALUES (NEW.id, cat_id, 'General Voice', 'voice', 0);
  RETURN NEW;
END; $$;

-- =========================
-- CATEGORIES / CHANNELS
-- =========================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories visible to members" ON public.categories FOR SELECT TO authenticated
  USING (public.is_server_member(server_id, auth.uid()));
CREATE POLICY "categories managed by admins" ON public.categories FOR ALL TO authenticated
  USING (public.can_manage_server(server_id, auth.uid()))
  WITH CHECK (public.can_manage_server(server_id, auth.uid()));

CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT,
  type TEXT NOT NULL DEFAULT 'text',
  topic TEXT,
  position INT NOT NULL DEFAULT 0,
  slowmode_seconds INT NOT NULL DEFAULT 0,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  nsfw BOOLEAN NOT NULL DEFAULT false,
  user_limit INT,
  parent_message_id UUID,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX channels_server_idx ON public.channels(server_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channels TO authenticated;
GRANT ALL ON public.channels TO service_role;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notification_level TEXT NOT NULL DEFAULT 'all',
  UNIQUE (channel_id, user_id)
);
CREATE INDEX channel_members_user_idx ON public.channel_members(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channel_members TO authenticated;
GRANT ALL ON public.channel_members TO service_role;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_dm_participant(_channel UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.channel_members WHERE channel_id = _channel AND user_id = _user);
$$;

CREATE OR REPLACE FUNCTION public.can_access_channel(_channel UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channels c
    WHERE c.id = _channel
      AND (
        (c.server_id IS NOT NULL AND public.is_server_member(c.server_id, _user))
        OR public.is_dm_participant(c.id, _user)
      )
  );
$$;

CREATE POLICY "channels visible to participants" ON public.channels FOR SELECT TO authenticated
  USING (
    (server_id IS NOT NULL AND public.is_server_member(server_id, auth.uid()))
    OR public.is_dm_participant(id, auth.uid())
  );
CREATE POLICY "channels insert" ON public.channels FOR INSERT TO authenticated
  WITH CHECK (
    (server_id IS NOT NULL AND public.can_manage_server(server_id, auth.uid()))
    OR (server_id IS NULL AND created_by = auth.uid())
  );
CREATE POLICY "channels update by admins" ON public.channels FOR UPDATE TO authenticated
  USING (
    (server_id IS NOT NULL AND public.can_manage_server(server_id, auth.uid()))
    OR (server_id IS NULL AND public.is_dm_participant(id, auth.uid()))
  );
CREATE POLICY "channels delete by admins" ON public.channels FOR DELETE TO authenticated
  USING (server_id IS NOT NULL AND public.can_manage_server(server_id, auth.uid()));

CREATE POLICY "channel members visible" ON public.channel_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_dm_participant(channel_id, auth.uid()));
CREATE POLICY "channel members insert" ON public.channel_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.channels c WHERE c.id = channel_id AND c.created_by = auth.uid())
    OR public.is_dm_participant(channel_id, auth.uid())
  );
CREATE POLICY "channel members update self" ON public.channel_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "channel members delete self" ON public.channel_members FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER servers_bootstrap AFTER INSERT ON public.servers
FOR EACH ROW EXECUTE FUNCTION public.handle_new_server();

-- =========================
-- ROLES
-- =========================
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8b93ff',
  position INT NOT NULL DEFAULT 0,
  hoisted BOOLEAN NOT NULL DEFAULT false,
  mentionable BOOLEAN NOT NULL DEFAULT true,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles visible to members" ON public.roles FOR SELECT TO authenticated
  USING (public.is_server_member(server_id, auth.uid()));
CREATE POLICY "roles managed by admins" ON public.roles FOR ALL TO authenticated
  USING (public.can_manage_server(server_id, auth.uid()))
  WITH CHECK (public.can_manage_server(server_id, auth.uid()));

CREATE TABLE public.member_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE (role_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_roles TO authenticated;
GRANT ALL ON public.member_roles TO service_role;
ALTER TABLE public.member_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "member roles visible to members" ON public.member_roles FOR SELECT TO authenticated
  USING (public.is_server_member(server_id, auth.uid()));
CREATE POLICY "member roles managed by admins" ON public.member_roles FOR ALL TO authenticated
  USING (public.can_manage_server(server_id, auth.uid()))
  WITH CHECK (public.can_manage_server(server_id, auth.uid()));

-- =========================
-- MESSAGES
-- =========================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL DEFAULT '',
  reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  mentions UUID[] NOT NULL DEFAULT '{}',
  pinned BOOLEAN NOT NULL DEFAULT false,
  is_system BOOLEAN NOT NULL DEFAULT false,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX messages_channel_created_idx ON public.messages(channel_id, created_at DESC);
CREATE INDEX messages_content_idx ON public.messages USING gin (to_tsvector('english', content));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages visible to channel participants" ON public.messages FOR SELECT TO authenticated
  USING (public.can_access_channel(channel_id, auth.uid()));
CREATE POLICY "messages insert by participants" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND public.can_access_channel(channel_id, auth.uid()));
CREATE POLICY "messages update by author" ON public.messages FOR UPDATE TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.channels c WHERE c.id = channel_id AND c.server_id IS NOT NULL AND public.can_moderate(c.server_id, auth.uid()))
  );
CREATE POLICY "messages delete by author or mods" ON public.messages FOR DELETE TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.channels c WHERE c.id = channel_id AND c.server_id IS NOT NULL AND public.can_moderate(c.server_id, auth.uid()))
  );

CREATE OR REPLACE FUNCTION public.bump_channel_activity() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.channels SET last_message_at = NEW.created_at WHERE id = NEW.channel_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER messages_bump AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.bump_channel_activity();

CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);
CREATE INDEX reactions_message_idx ON public.message_reactions(message_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_reactions TO authenticated;
GRANT ALL ON public.message_reactions TO service_role;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions visible" ON public.message_reactions FOR SELECT TO authenticated
  USING (public.can_access_channel(channel_id, auth.uid()));
CREATE POLICY "reactions insert own" ON public.message_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.can_access_channel(channel_id, auth.uid()));
CREATE POLICY "reactions delete own" ON public.message_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- =========================
-- INVITES / MODERATION
-- =========================
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_uses INT,
  uses INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invites TO authenticated;
GRANT ALL ON public.invites TO service_role;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invites readable by authenticated" ON public.invites FOR SELECT TO authenticated USING (true);
CREATE POLICY "invites create by members" ON public.invites FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND public.is_server_member(server_id, auth.uid()));
CREATE POLICY "invites delete by mods" ON public.invites FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.can_moderate(server_id, auth.uid()));

CREATE TABLE public.bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (server_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bans TO authenticated;
GRANT ALL ON public.bans TO service_role;
ALTER TABLE public.bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bans visible to members" ON public.bans FOR SELECT TO authenticated
  USING (public.is_server_member(server_id, auth.uid()) OR user_id = auth.uid());
CREATE POLICY "bans managed by mods" ON public.bans FOR ALL TO authenticated
  USING (public.can_moderate(server_id, auth.uid()))
  WITH CHECK (public.can_moderate(server_id, auth.uid()));

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_server_idx ON public.audit_logs(server_id, created_at DESC);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit visible to mods" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.can_moderate(server_id, auth.uid()));
CREATE POLICY "audit insert by members" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() AND public.is_server_member(server_id, auth.uid()));

-- =========================
-- VOICE STATES
-- =========================
CREATE TABLE public.voice_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE,
  self_mute BOOLEAN NOT NULL DEFAULT false,
  self_deaf BOOLEAN NOT NULL DEFAULT false,
  video BOOLEAN NOT NULL DEFAULT false,
  screen_share BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_states TO authenticated;
GRANT ALL ON public.voice_states TO service_role;
ALTER TABLE public.voice_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "voice states visible" ON public.voice_states FOR SELECT TO authenticated
  USING (public.can_access_channel(channel_id, auth.uid()));
CREATE POLICY "voice states own" ON public.voice_states FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.can_access_channel(channel_id, auth.uid()));
CREATE POLICY "voice states update own" ON public.voice_states FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "voice states delete own" ON public.voice_states FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR (server_id IS NOT NULL AND public.can_moderate(server_id, auth.uid())));

-- =========================
-- CUSTOM EMOJIS / WEBHOOKS
-- =========================
CREATE TABLE public.custom_emojis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (server_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_emojis TO authenticated;
GRANT ALL ON public.custom_emojis TO service_role;
ALTER TABLE public.custom_emojis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emojis visible to members" ON public.custom_emojis FOR SELECT TO authenticated
  USING (public.is_server_member(server_id, auth.uid()));
CREATE POLICY "emojis managed by admins" ON public.custom_emojis FOR ALL TO authenticated
  USING (public.can_manage_server(server_id, auth.uid()))
  WITH CHECK (public.can_manage_server(server_id, auth.uid()));

CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhooks TO authenticated;
GRANT ALL ON public.webhooks TO service_role;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhooks managed by admins" ON public.webhooks FOR ALL TO authenticated
  USING (public.can_manage_server(server_id, auth.uid()))
  WITH CHECK (public.can_manage_server(server_id, auth.uid()));

-- =========================
-- NOTIFICATION / USER SETTINGS
-- =========================
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark',
  accent TEXT NOT NULL DEFAULT 'aurora',
  message_density TEXT NOT NULL DEFAULT 'cozy',
  font_scale NUMERIC NOT NULL DEFAULT 1,
  reduced_motion BOOLEAN NOT NULL DEFAULT false,
  desktop_notifications BOOLEAN NOT NULL DEFAULT true,
  notification_sounds BOOLEAN NOT NULL DEFAULT true,
  dm_permission TEXT NOT NULL DEFAULT 'friends',
  friend_requests_open BOOLEAN NOT NULL DEFAULT true,
  show_presence BOOLEAN NOT NULL DEFAULT true,
  push_to_talk BOOLEAN NOT NULL DEFAULT false,
  noise_suppression BOOLEAN NOT NULL DEFAULT true,
  echo_cancellation BOOLEAN NOT NULL DEFAULT true,
  input_device TEXT,
  output_device TEXT,
  camera_device TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings own" ON public.user_settings FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========================
-- REALTIME
-- =========================
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.voice_states REPLICA IDENTITY FULL;
ALTER TABLE public.friendships REPLICA IDENTITY FULL;
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.server_members REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_states;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.server_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- =========================
-- RPCs
-- =========================
CREATE OR REPLACE FUNCTION public.get_or_create_dm(_other UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me UUID := auth.uid(); found UUID; new_id UUID;
BEGIN
  IF me IS NULL OR _other = me THEN RAISE EXCEPTION 'invalid'; END IF;
  SELECT c.id INTO found FROM public.channels c
  WHERE c.type = 'dm'
    AND EXISTS (SELECT 1 FROM public.channel_members m WHERE m.channel_id = c.id AND m.user_id = me)
    AND EXISTS (SELECT 1 FROM public.channel_members m WHERE m.channel_id = c.id AND m.user_id = _other)
    AND (SELECT count(*) FROM public.channel_members m WHERE m.channel_id = c.id) = 2
  LIMIT 1;
  IF found IS NOT NULL THEN RETURN found; END IF;
  INSERT INTO public.channels (type, created_by) VALUES ('dm', me) RETURNING id INTO new_id;
  INSERT INTO public.channel_members (channel_id, user_id) VALUES (new_id, me), (new_id, _other);
  RETURN new_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.get_or_create_dm(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_group_dm(_name TEXT, _members UUID[])
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me UUID := auth.uid(); new_id UUID; m UUID;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  INSERT INTO public.channels (type, name, created_by) VALUES ('group_dm', _name, me) RETURNING id INTO new_id;
  INSERT INTO public.channel_members (channel_id, user_id) VALUES (new_id, me);
  FOREACH m IN ARRAY _members LOOP
    IF m <> me THEN
      INSERT INTO public.channel_members (channel_id, user_id) VALUES (new_id, m) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  RETURN new_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.create_group_dm(TEXT, UUID[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.join_server_by_invite(_code TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me UUID := auth.uid(); inv public.invites%ROWTYPE;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  SELECT * INTO inv FROM public.invites WHERE code = _code;
  IF inv.id IS NULL THEN RAISE EXCEPTION 'Invite not found'; END IF;
  IF inv.expires_at IS NOT NULL AND inv.expires_at < now() THEN RAISE EXCEPTION 'Invite expired'; END IF;
  IF inv.max_uses IS NOT NULL AND inv.uses >= inv.max_uses THEN RAISE EXCEPTION 'Invite exhausted'; END IF;
  IF EXISTS (SELECT 1 FROM public.bans WHERE server_id = inv.server_id AND user_id = me) THEN
    RAISE EXCEPTION 'You are banned from this community';
  END IF;
  INSERT INTO public.server_members (server_id, user_id) VALUES (inv.server_id, me) ON CONFLICT DO NOTHING;
  UPDATE public.invites SET uses = uses + 1 WHERE id = inv.id;
  RETURN inv.server_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.join_server_by_invite(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.join_public_server(_server UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me UUID := auth.uid();
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.servers WHERE id = _server AND is_public) THEN
    RAISE EXCEPTION 'Community is not open to join';
  END IF;
  IF EXISTS (SELECT 1 FROM public.bans WHERE server_id = _server AND user_id = me) THEN
    RAISE EXCEPTION 'You are banned from this community';
  END IF;
  INSERT INTO public.server_members (server_id, user_id) VALUES (_server, me) ON CONFLICT DO NOTHING;
  RETURN _server;
END; $$;
GRANT EXECUTE ON FUNCTION public.join_public_server(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.search_messages(_query TEXT, _server UUID DEFAULT NULL, _channel UUID DEFAULT NULL, _author UUID DEFAULT NULL, _limit INT DEFAULT 50)
RETURNS SETOF public.messages LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT m.* FROM public.messages m
  JOIN public.channels c ON c.id = m.channel_id
  WHERE m.deleted_at IS NULL
    AND (_query IS NULL OR _query = '' OR m.content ILIKE '%' || _query || '%')
    AND (_server IS NULL OR c.server_id = _server)
    AND (_channel IS NULL OR m.channel_id = _channel)
    AND (_author IS NULL OR m.author_id = _author)
  ORDER BY m.created_at DESC
  LIMIT COALESCE(_limit, 50);
$$;
GRANT EXECUTE ON FUNCTION public.search_messages(TEXT, UUID, UUID, UUID, INT) TO authenticated;
