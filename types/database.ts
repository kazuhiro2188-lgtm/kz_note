export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          content_type: string;
          is_draft: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          content_type?: string;
          is_draft?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          content_type?: string;
          is_draft?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      note_ai_generations: {
        Row: {
          id: string;
          note_id: string;
          generation_type: "summary" | "flowchart" | "mindmap";
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          generation_type: "summary" | "flowchart" | "mindmap";
          content: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["note_ai_generations"]["Insert"]>;
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
      };
      note_tags: {
        Row: {
          note_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          note_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: never;
      };
    };
  };
}

export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type NoteInsert = Database["public"]["Tables"]["notes"]["Insert"];
export type NoteUpdate = Database["public"]["Tables"]["notes"]["Update"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type NoteWithTags = Note & { tags: Tag[] };

// Daily Topics
export type DailyTopic = {
  id: string;
  title: string;
  description: string | null;
  source_url: string | null;
  source: string;
  source_id: string | null;
  score: number;
  tags: string[];
  fetched_at: string;
  created_at: string;
};

export type UserTopicInteraction = {
  id: string;
  user_id: string;
  topic_id: string;
  action: "viewed" | "saved" | "skipped";
  created_at: string;
};
