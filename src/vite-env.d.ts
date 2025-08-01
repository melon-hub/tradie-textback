/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_SUPABASE_PROJECT_ID: string
  VITE_SUPABASE_API_KEY: string
}

interface ImportMeta {
  env: ImportMetaEnv
}
