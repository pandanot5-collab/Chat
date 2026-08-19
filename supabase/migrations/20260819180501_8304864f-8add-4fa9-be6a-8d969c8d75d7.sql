
REVOKE ALL ON FUNCTION public.is_server_member(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.server_role(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.can_manage_server(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.can_moderate(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_dm_participant(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.can_access_channel(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_server() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.bump_channel_activity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.get_or_create_dm(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_group_dm(TEXT, UUID[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.join_server_by_invite(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.join_public_server(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.search_messages(TEXT, UUID, UUID, UUID, INT) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_or_create_dm(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_group_dm(TEXT, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_server_by_invite(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_public_server(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_messages(TEXT, UUID, UUID, UUID, INT) TO authenticated;
