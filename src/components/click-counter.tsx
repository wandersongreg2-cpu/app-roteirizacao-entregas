"use client"

import { useState, useEffect } from 'react'
import { ClickCounter } from '@/lib/types'
import { supabase, isSupabaseConfigured, offlineStorage } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Minus, RotateCcw, Trash2, Edit, MousePointer } from 'lucide-react'

interface ClickCounterComponentProps {
  userId: string
}

export function ClickCounterComponent({ userId }: ClickCounterComponentProps) {
  const [counters, setCounters] = useState<ClickCounter[]>([])
  const [loading, setLoading] = useState(true)
  const [newCounterName, setNewCounterName] = useState('')
  const [newCounterIncrement, setNewCounterIncrement] = useState<1 | 5 | 10>(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadCounters()
  }, [userId])

  const loadCounters = async () => {
    try {
      if (!isSupabaseConfigured()) {
        // Modo offline - usar localStorage
        const storedCounters = offlineStorage.getItem(`counters_${userId}`)
        setCounters(storedCounters ? JSON.parse(storedCounters) : [])
      } else {
        // Modo online - usar Supabase
        const { data, error } = await supabase
          .from('click_counters')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setCounters(data || [])
      }
    } catch (error) {
      console.error('Error loading counters:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCounter = async () => {
    if (!newCounterName.trim()) return

    try {
      const counterData = {
        id: Date.now().toString(),
        user_id: userId,
        name: newCounterName,
        count: 0,
        increment_value: newCounterIncrement,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (!isSupabaseConfigured()) {
        // Modo offline - usar localStorage
        const updatedCounters = [counterData, ...counters]
        setCounters(updatedCounters)
        offlineStorage.setItem(`counters_${userId}`, JSON.stringify(updatedCounters))
      } else {
        // Modo online - usar Supabase
        const { data, error } = await supabase
          .from('click_counters')
          .insert([counterData])
          .select()
          .single()

        if (error) throw error
        setCounters([data, ...counters])
      }

      setNewCounterName('')
      setNewCounterIncrement(1)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error creating counter:', error)
    }
  }

  const updateCounter = async (id: string, newCount: number) => {
    try {
      const finalCount = Math.max(0, newCount)
      const updatedCounters = counters.map(counter => 
        counter.id === id ? { ...counter, count: finalCount, updated_at: new Date().toISOString() } : counter
      )

      if (!isSupabaseConfigured()) {
        // Modo offline - usar localStorage
        setCounters(updatedCounters)
        offlineStorage.setItem(`counters_${userId}`, JSON.stringify(updatedCounters))
      } else {
        // Modo online - usar Supabase
        const { error } = await supabase
          .from('click_counters')
          .update({ count: finalCount, updated_at: new Date().toISOString() })
          .eq('id', id)

        if (error) throw error
        setCounters(updatedCounters)
      }
    } catch (error) {
      console.error('Error updating counter:', error)
    }
  }

  const resetCounter = async (id: string) => {
    await updateCounter(id, 0)
  }

  const deleteCounter = async (id: string) => {
    try {
      const updatedCounters = counters.filter(counter => counter.id !== id)

      if (!isSupabaseConfigured()) {
        // Modo offline - usar localStorage
        setCounters(updatedCounters)
        offlineStorage.setItem(`counters_${userId}`, JSON.stringify(updatedCounters))
      } else {
        // Modo online - usar Supabase
        const { error } = await supabase
          .from('click_counters')
          .delete()
          .eq('id', id)

        if (error) throw error
        setCounters(updatedCounters)
      }
    } catch (error) {
      console.error('Error deleting counter:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contadores de Clicks</h2>
          <p className="text-gray-600">Gerencie seus contadores personalizados</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Contador</DialogTitle>
              <DialogDescription>
                Configure um novo contador de clicks personalizado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="counter-name">Nome do Contador</Label>
                <Input
                  id="counter-name"
                  placeholder="Ex: Entregas do dia"
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="increment">Incremento por Click</Label>
                <Select value={newCounterIncrement.toString()} onValueChange={(value) => setNewCounterIncrement(parseInt(value) as 1 | 5 | 10)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">+1 por click</SelectItem>
                    <SelectItem value="5">+5 por click</SelectItem>
                    <SelectItem value="10">+10 por click</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createCounter} className="w-full">
                Criar Contador
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {counters.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MousePointer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum contador criado</h3>
            <p className="text-gray-600 mb-4">Crie seu primeiro contador para começar a contar!</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Contador
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counters.map((counter) => (
            <Card key={counter.id} className="bg-gradient-to-br from-white to-gray-50 border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900 flex items-center justify-between">
                  {counter.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCounter(counter.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Incremento: +{counter.increment_value} por click
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {counter.count.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">clicks totais</div>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCounter(counter.id, counter.count - counter.increment_value)}
                    className="hover:bg-red-50 hover:border-red-300"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={() => updateCounter(counter.id, counter.count + counter.increment_value)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8"
                  >
                    +{counter.increment_value}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetCounter(counter.id)}
                    className="hover:bg-orange-50 hover:border-orange-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}