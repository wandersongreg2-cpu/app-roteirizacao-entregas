import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase com fallbacks seguros
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Verificar se as variáveis estão configuradas
const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Criar cliente Supabase apenas se configurado
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Função para verificar se o Supabase está configurado
export function isSupabaseConfigured(): boolean {
  return isConfigured
}

// Função para inicializar as tabelas do banco
export async function initializeDatabase() {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase não configurado. Configure suas credenciais para usar o banco de dados.')
    return false
  }

  try {
    // Criar tabela de usuários se não existir
    const { error: usersError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    // Criar tabela de entregas se não existir
    const { error: deliveriesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS deliveries (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          recipient_name TEXT NOT NULL,
          recipient_phone TEXT NOT NULL,
          address TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          spx_tracking TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    // Criar tabela de rotas se não existir
    const { error: routesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS routes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          name TEXT NOT NULL,
          deliveries JSONB DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    // Criar tabela de contadores se não existir
    const { error: countersError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS counters (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          name TEXT NOT NULL,
          count INTEGER DEFAULT 0,
          increment_value INTEGER DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  }
}

// Função para operações offline (quando Supabase não está configurado)
export const offlineStorage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  }
}