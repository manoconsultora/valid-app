/**
 * Tipos mínimos del esquema Supabase para clientes (createServerClient / createBrowserClient).
 * Rol en public.users es nullable (auth-rbac).
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'provider' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'admin' | 'provider' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'provider' | null
          created_at?: string
          updated_at?: string
        }
      }
      provider_categories: {
        Row: {
          id: string
          slug: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      providers: {
        Row: {
          id: string
          user_id: string
          category_id: string
          razon_social: string
          cuit: string
          email: string
          phone: string | null
          contact_name: string | null
          contact_role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          razon_social: string
          cuit: string
          email: string
          phone?: string | null
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          razon_social?: string
          cuit?: string
          email?: string
          phone?: string | null
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Enums: {
      app_role: 'admin' | 'provider'
    }
    Functions: {
      assign_user_role: {
        Args: { target_user_id: string; new_role: 'admin' | 'provider' }
        Returns: undefined
      }
    }
  }
}
