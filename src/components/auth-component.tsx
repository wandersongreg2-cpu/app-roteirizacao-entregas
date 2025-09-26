"use client"

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured, offlineStorage } from '@/lib/supabase'
import { User } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogIn, UserPlus, Truck, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AuthComponentProps {
  onAuthSuccess: (user: User) => void
}

export function AuthComponent({ onAuthSuccess }: AuthComponentProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showOfflineMode, setShowOfflineMode] = useState(false)

  useEffect(() => {
    setShowOfflineMode(!isSupabaseConfigured())
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!isSupabaseConfigured() || !supabase) {
        // Modo offline - usar localStorage
        const storedUsers = offlineStorage.getItem('users')
        const users = storedUsers ? JSON.parse(storedUsers) : []
        
        const user = users.find((u: any) => u.email === email && u.password === password)
        
        if (user) {
          const { password: _, ...userWithoutPassword } = user
          offlineStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
          onAuthSuccess(userWithoutPassword)
        } else {
          throw new Error('Email ou senha incorretos')
        }
      } else {
        // Modo online - usar Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profile) {
            onAuthSuccess({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role,
              created_at: profile.created_at
            })
          }
        }
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!isSupabaseConfigured() || !supabase) {
        // Modo offline - usar localStorage
        const storedUsers = offlineStorage.getItem('users')
        const users = storedUsers ? JSON.parse(storedUsers) : []
        
        // Verificar se email já existe
        if (users.find((u: any) => u.email === email)) {
          throw new Error('Email já cadastrado')
        }
        
        const newUser = {
          id: Date.now().toString(),
          email,
          name,
          password,
          role: 'entregador',
          created_at: new Date().toISOString()
        }
        
        users.push(newUser)
        offlineStorage.setItem('users', JSON.stringify(users))
        
        const { password: _, ...userWithoutPassword } = newUser
        offlineStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
        onAuthSuccess(userWithoutPassword)
      } else {
        // Modo online - usar Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role: 'entregador'
            }
          }
        })

        if (error) throw error

        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email,
                name,
                role: 'entregador'
              }
            ])

          if (profileError) throw profileError

          onAuthSuccess({
            id: data.user.id,
            email,
            name,
            role: 'entregador',
            created_at: new Date().toISOString()
          })
        }
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Delivery Pro
          </CardTitle>
          <CardDescription>
            Sistema profissional de roteirização para entregadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showOfflineMode && (
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Modo offline ativo. Para sincronização em nuvem, configure o Supabase.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Cadastrar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Senha</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  disabled={loading}
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}