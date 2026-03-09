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
    }
    Enums: {
      app_role: 'admin' | 'provider'
    }
  }
}
