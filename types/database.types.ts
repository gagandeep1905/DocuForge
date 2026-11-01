export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Table<Row, Insert, Update, Relationships extends Relationship[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      documents: Table<
        {
          content: Json;
          doc_type: string;
          id: string;
          model_version: number;
          project_id: string;
          status: string;
          updated_at: string;
        },
        {
          content?: Json;
          doc_type: string;
          id?: string;
          model_version?: number;
          project_id: string;
          status?: string;
          updated_at?: string;
        },
        {
          content?: Json;
          doc_type?: string;
          id?: string;
          model_version?: number;
          project_id?: string;
          status?: string;
          updated_at?: string;
        },
        [{
          foreignKeyName: "documents_project_id_fkey";
          columns: ["project_id"];
          isOneToOne: false;
          referencedRelation: "projects";
          referencedColumns: ["id"];
        }]
      >;
      exports: Table<
        {
          created_at: string;
          document_id: string;
          format: string;
          id: string;
          storage_key: string;
        },
        {
          created_at?: string;
          document_id: string;
          format: string;
          id?: string;
          storage_key: string;
        },
        {
          created_at?: string;
          document_id?: string;
          format?: string;
          id?: string;
          storage_key?: string;
        },
        [{
          foreignKeyName: "exports_document_id_fkey";
          columns: ["document_id"];
          isOneToOne: false;
          referencedRelation: "documents";
          referencedColumns: ["id"];
        }]
      >;
      payments: Table<
        {
          amount_paise: number;
          created_at: string;
          id: string;
          kind: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          status: string;
          user_id: string;
        },
        {
          amount_paise: number;
          created_at?: string;
          id?: string;
          kind: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          status?: string;
          user_id: string;
        },
        {
          amount_paise?: number;
          created_at?: string;
          id?: string;
          kind?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          status?: string;
          user_id?: string;
        },
        [{
          foreignKeyName: "payments_user_id_fkey";
          columns: ["user_id"];
          isOneToOne: false;
          referencedRelation: "profiles";
          referencedColumns: ["id"];
        }]
      >;
      profiles: Table<
        {
          college: string | null;
          created_at: string;
          credits: number;
          full_name: string | null;
          id: string;
          plan: string;
        },
        {
          college?: string | null;
          created_at?: string;
          credits?: number;
          full_name?: string | null;
          id: string;
          plan?: string;
        },
        {
          college?: string | null;
          created_at?: string;
          credits?: number;
          full_name?: string | null;
          id?: string;
          plan?: string;
        }
      >;
      project_files: Table<
        {
          analyze: boolean;
          content: string;
          id: string;
          language: string | null;
          path: string;
          project_id: string;
          role: string | null;
          score: number;
          size_bytes: number;
          summary: string | null;
        },
        {
          analyze?: boolean;
          content: string;
          id?: string;
          language?: string | null;
          path: string;
          project_id: string;
          role?: string | null;
          score?: number;
          size_bytes: number;
          summary?: string | null;
        },
        {
          analyze?: boolean;
          content?: string;
          id?: string;
          language?: string | null;
          path?: string;
          project_id?: string;
          role?: string | null;
          score?: number;
          size_bytes?: number;
          summary?: string | null;
        },
        [{
          foreignKeyName: "project_files_project_id_fkey";
          columns: ["project_id"];
          isOneToOne: false;
          referencedRelation: "projects";
          referencedColumns: ["id"];
        }]
      >;
      project_models: Table<
        {
          created_at: string;
          id: string;
          missing_fields: Json;
          model: Json;
          project_id: string;
          version: number;
        },
        {
          created_at?: string;
          id?: string;
          missing_fields?: Json;
          model: Json;
          project_id: string;
          version?: number;
        },
        {
          created_at?: string;
          id?: string;
          missing_fields?: Json;
          model?: Json;
          project_id?: string;
          version?: number;
        },
        [{
          foreignKeyName: "project_models_project_id_fkey";
          columns: ["project_id"];
          isOneToOne: false;
          referencedRelation: "projects";
          referencedColumns: ["id"];
        }]
      >;
      projects: Table<
        {
          coverage: Json | null;
          created_at: string;
          error: string | null;
          id: string;
          source_ref: string;
          source_type: string;
          status: string;
          template_id: string | null;
          title: string;
          user_id: string;
          user_notes: string | null;
        },
        {
          coverage?: Json | null;
          created_at?: string;
          error?: string | null;
          id?: string;
          source_ref: string;
          source_type: string;
          status?: string;
          template_id?: string | null;
          title: string;
          user_id: string;
          user_notes?: string | null;
        },
        {
          coverage?: Json | null;
          created_at?: string;
          error?: string | null;
          id?: string;
          source_ref?: string;
          source_type?: string;
          status?: string;
          template_id?: string | null;
          title?: string;
          user_id?: string;
          user_notes?: string | null;
        },
        [
          {
            foreignKeyName: "projects_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "university_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      >;
      university_templates: Table<
        {
          config: Json;
          id: string;
          is_public: boolean;
          name: string;
        },
        {
          config: Json;
          id?: string;
          is_public?: boolean;
          name: string;
        },
        {
          config?: Json;
          id?: string;
          is_public?: boolean;
          name?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
