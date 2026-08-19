export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          server_id: string
          target: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          server_id: string
          target?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          server_id?: string
          target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      bans: {
        Row: {
          created_at: string
          id: string
          moderator_id: string | null
          reason: string | null
          server_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          moderator_id?: string | null
          reason?: string | null
          server_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          moderator_id?: string | null
          reason?: string | null
          server_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bans_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bans_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          server_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: number
          server_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          server_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_members: {
        Row: {
          channel_id: string
          id: string
          last_read_at: string
          notification_level: string
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          last_read_at?: string
          notification_level?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          last_read_at?: string
          notification_level?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_locked: boolean
          last_message_at: string
          name: string | null
          nsfw: boolean
          parent_message_id: string | null
          position: number
          server_id: string | null
          slowmode_seconds: number
          topic: string | null
          type: string
          user_limit: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_locked?: boolean
          last_message_at?: string
          name?: string | null
          nsfw?: boolean
          parent_message_id?: string | null
          position?: number
          server_id?: string | null
          slowmode_seconds?: number
          topic?: string | null
          type?: string
          user_limit?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_locked?: boolean
          last_message_at?: string
          name?: string | null
          nsfw?: boolean
          parent_message_id?: string | null
          position?: number
          server_id?: string | null
          slowmode_seconds?: number
          topic?: string | null
          type?: string
          user_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "channels_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channels_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channels_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_emojis: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          image_url: string
          name: string
          server_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          image_url: string
          name: string
          server_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string
          name?: string
          server_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_emojis_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_emojis_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          channel_id: string | null
          code: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          max_uses: number | null
          server_id: string
          uses: number
        }
        Insert: {
          channel_id?: string | null
          code: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          server_id: string
          uses?: number
        }
        Update: {
          channel_id?: string | null
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          server_id?: string
          uses?: number
        }
        Relationships: [
          {
            foreignKeyName: "invites_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      member_roles: {
        Row: {
          id: string
          role_id: string
          server_id: string
          user_id: string
        }
        Insert: {
          id?: string
          role_id: string
          server_id: string
          user_id: string
        }
        Update: {
          id?: string
          role_id?: string
          server_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_roles_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          channel_id: string
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json
          author_id: string | null
          channel_id: string
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_system: boolean
          mentions: string[]
          pinned: boolean
          reply_to_id: string | null
        }
        Insert: {
          attachments?: Json
          author_id?: string | null
          channel_id: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_system?: boolean
          mentions?: string[]
          pinned?: boolean
          reply_to_id?: string | null
        }
        Update: {
          attachments?: Json
          author_id?: string | null
          channel_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_system?: boolean
          mentions?: string[]
          pinned?: boolean
          reply_to_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accent_color: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string
          custom_status: string | null
          display_name: string
          id: string
          last_seen: string
          presence: string
          updated_at: string
          username: string
        }
        Insert: {
          accent_color?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          custom_status?: string | null
          display_name: string
          id: string
          last_seen?: string
          presence?: string
          updated_at?: string
          username: string
        }
        Update: {
          accent_color?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          custom_status?: string | null
          display_name?: string
          id?: string
          last_seen?: string
          presence?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          color: string
          created_at: string
          hoisted: boolean
          id: string
          mentionable: boolean
          name: string
          permissions: Json
          position: number
          server_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          hoisted?: boolean
          id?: string
          mentionable?: boolean
          name: string
          permissions?: Json
          position?: number
          server_id: string
        }
        Update: {
          color?: string
          created_at?: string
          hoisted?: boolean
          id?: string
          mentionable?: boolean
          name?: string
          permissions?: Json
          position?: number
          server_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      server_members: {
        Row: {
          id: string
          joined_at: string
          member_role: string
          nickname: string | null
          server_id: string
          timeout_until: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          member_role?: string
          nickname?: string | null
          server_id: string
          timeout_until?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          member_role?: string
          nickname?: string | null
          server_id?: string
          timeout_until?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_members_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      servers: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          is_public: boolean
          name: string
          owner_id: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_public?: boolean
          name: string
          owner_id: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_public?: boolean
          name?: string
          owner_id?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "servers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          accent: string
          camera_device: string | null
          desktop_notifications: boolean
          dm_permission: string
          echo_cancellation: boolean
          font_scale: number
          friend_requests_open: boolean
          input_device: string | null
          message_density: string
          noise_suppression: boolean
          notification_sounds: boolean
          output_device: string | null
          push_to_talk: boolean
          reduced_motion: boolean
          show_presence: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent?: string
          camera_device?: string | null
          desktop_notifications?: boolean
          dm_permission?: string
          echo_cancellation?: boolean
          font_scale?: number
          friend_requests_open?: boolean
          input_device?: string | null
          message_density?: string
          noise_suppression?: boolean
          notification_sounds?: boolean
          output_device?: string | null
          push_to_talk?: boolean
          reduced_motion?: boolean
          show_presence?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent?: string
          camera_device?: string | null
          desktop_notifications?: boolean
          dm_permission?: string
          echo_cancellation?: boolean
          font_scale?: number
          friend_requests_open?: boolean
          input_device?: string | null
          message_density?: string
          noise_suppression?: boolean
          notification_sounds?: boolean
          output_device?: string | null
          push_to_talk?: boolean
          reduced_motion?: boolean
          show_presence?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_states: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          screen_share: boolean
          self_deaf: boolean
          self_mute: boolean
          server_id: string | null
          user_id: string
          video: boolean
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          screen_share?: boolean
          self_deaf?: boolean
          self_mute?: boolean
          server_id?: string | null
          user_id: string
          video?: boolean
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          screen_share?: boolean
          self_deaf?: boolean
          self_mute?: boolean
          server_id?: string | null
          user_id?: string
          video?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "voice_states_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_states_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_states_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          avatar_url: string | null
          channel_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          server_id: string
          token: string
        }
        Insert: {
          avatar_url?: string | null
          channel_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          server_id: string
          token?: string
        }
        Update: {
          avatar_url?: string | null
          channel_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          server_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhooks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhooks_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_channel: {
        Args: { _channel: string; _user: string }
        Returns: boolean
      }
      can_manage_server: {
        Args: { _server: string; _user: string }
        Returns: boolean
      }
      can_moderate: {
        Args: { _server: string; _user: string }
        Returns: boolean
      }
      create_group_dm: {
        Args: { _members: string[]; _name: string }
        Returns: string
      }
      get_or_create_dm: { Args: { _other: string }; Returns: string }
      is_dm_participant: {
        Args: { _channel: string; _user: string }
        Returns: boolean
      }
      is_server_member: {
        Args: { _server: string; _user: string }
        Returns: boolean
      }
      join_public_server: { Args: { _server: string }; Returns: string }
      join_server_by_invite: { Args: { _code: string }; Returns: string }
      search_messages: {
        Args: {
          _author?: string
          _channel?: string
          _limit?: number
          _query: string
          _server?: string
        }
        Returns: {
          attachments: Json
          author_id: string | null
          channel_id: string
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_system: boolean
          mentions: string[]
          pinned: boolean
          reply_to_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "messages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      server_role: { Args: { _server: string; _user: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
