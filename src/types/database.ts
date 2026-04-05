export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Users 表
 */
export interface UserRow {
  id: string; // uuid
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  user_level: number;
  total_exp: number;
  career_direction: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  id?: string;
  email: string;
  display_name?: string | null;
  avatar_url?: string | null;
  user_level?: number;
  total_exp?: number;
  career_direction?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserUpdate {
  email?: string;
  display_name?: string | null;
  avatar_url?: string | null;
  user_level?: number;
  total_exp?: number;
  career_direction?: string | null;
  updated_at?: string;
}

/**
 * Progress 表
 */
export interface ProgressRow {
  id: string; // uuid
  user_id: string; // fk -> users.id
  skill_id: string;
  current_xp: number;
  is_finished: boolean;
  last_active: string;
  created_at: string;
}

export interface ProgressInsert {
  id?: string;
  user_id: string;
  skill_id: string;
  current_xp?: number;
  is_finished?: boolean;
  last_active?: string;
  created_at?: string;
}

export interface ProgressUpdate {
  skill_id?: string;
  current_xp?: number;
  is_finished?: boolean;
  last_active?: string;
}

/**
 * Roadmaps 表
 */
export interface RoadmapRow {
  id: string; // uuid
  user_id: string; // fk -> users.id
  roadmap_data: Json; // JSONB: AI 生成节点数组
  created_at: string;
  updated_at: string;
}

export interface RoadmapInsert {
  id?: string;
  user_id: string;
  roadmap_data: Json;
  created_at?: string;
  updated_at?: string;
}

export interface RoadmapUpdate {
  roadmap_data?: Json;
  updated_at?: string;
}

/**
 * Equipment 表
 */
export interface EquipmentRow {
  id: string; // uuid
  user_id: string; // fk -> users.id
  equipment_id: string;
  unlocked_at: string;
}

export interface EquipmentInsert {
  id?: string;
  user_id: string;
  equipment_id: string;
  unlocked_at?: string;
}

export interface EquipmentUpdate {
  equipment_id?: string;
  unlocked_at?: string;
}

/**
 * Supabase 数据库结构映射（可用于 createClient<Database>()）
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      progress: {
        Row: ProgressRow;
        Insert: ProgressInsert;
        Update: ProgressUpdate;
      };
      roadmaps: {
        Row: RoadmapRow;
        Insert: RoadmapInsert;
        Update: RoadmapUpdate;
      };
      equipment: {
        Row: EquipmentRow;
        Insert: EquipmentInsert;
        Update: EquipmentUpdate;
      };
    };
  };
}

export type Tables = Database['public']['Tables'];
