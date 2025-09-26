"use client"

import { useState, useEffect } from 'react'
import { User, Delivery, Route } from '@/lib/types'
import { supabase, isSupabaseConfigured, offlineStorage } from '@/lib/supabase'
import { AuthComponent } from '@/components/auth-component'
import { ClickCounterComponent } from '@/components/click-counter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Truck, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Plus, 
  Route as RouteIcon, 
  Clock, 
  Package, 
  User as UserIcon,
  LogOut,
  Navigation,
  MousePointer,
  Send,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { openWhatsApp, generateWhatsAppMessage } from '@/lib/utils'

export default function DeliveryApp() {
  const [user, setUser] = useState<User | null>(null)
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Estados para novo delivery
  const [newDelivery, setNewDelivery] = useState({
    customer_name: '',
    customer_phone: '',
    address: '',
    spx_tracking_code: '',
    estimated_delivery: '',
    notes: ''
  })
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadDeliveries()
      loadRoutes()
    }
  }, [user])

  const checkUser = async () => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        // Modo offline - verificar localStorage
        const storedUser = offlineStorage.getItem('currentUser')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } else {
        // Modo online - verificar Supabase
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role,
              created_at: profile.created_at
            })
          }
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDeliveries = async () => {
    if (!user) return

    try {
      if (!isSupabaseConfigured() || !supabase) {
        // Modo offline - usar localStorage
        const storedDeliveries = offlineStorage.getItem(`deliveries_${user.id}`)
        setDeliveries(storedDeliveries ? JSON.parse(storedDeliveries) : [])
      } else {
        // Modo online - usar Supabase
        const { data, error } = await supabase
          .from('deliveries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setDeliveries(data || [])
      }
    } catch (error) {
      console.error('Error loading deliveries:', error)
    }
  }

  const loadRoutes = async () => {
    if (!user) return

    try {
      if (!isSupabaseConfigured() || !supabase) {
        // Modo offline - usar localStorage
        const storedRoutes = offlineStorage.getItem(`routes_${user.id}`)
        setRoutes(storedRoutes ? JSON.parse(storedRoutes) : [])
      } else {
        // Modo online - usar Supabase
        const { data, error } = await supabase
          .from('routes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setRoutes(data || [])
      }
    } catch (error) {
      console.error('Error loading routes:', error)
    }
  }

  const createDelivery = async () => {
    if (!user || !newDelivery.customer_name || !newDelivery.address) return

    try {
      const deliveryData = {
        id: Date.now().toString(),
        user_id: user.id,
        customer_name: newDelivery.customer_name,
        customer_phone: newDelivery.customer_phone,
        address: newDelivery.address,
        spx_tracking_code: newDelivery.spx_tracking_code,
        estimated_delivery: newDelivery.estimated_delivery,
        notes: newDelivery.notes,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (!isSupabaseConfigured() || !supabase) {
        // Modo offline - usar localStorage
        const updatedDeliveries = [deliveryData, ...deliveries]
        setDeliveries(updatedDeliveries)
        offlineStorage.setItem(`deliveries_${user.id}`, JSON.stringify(updatedDeliveries))
      } else {
        // Modo online - usar Supabase
        const { data, error } = await supabase
          .from('deliveries')
          .insert([deliveryData])
          .select()
          .single()

        if (error) throw error
        setDeliveries([data, ...deliveries])
      }

      setNewDelivery({
        customer_name: '',
        customer_phone: '',
        address: '',
        spx_tracking_code: '',
        estimated_delivery: '',
        notes: ''
      })
      setIsDeliveryDialogOpen(false)
    } catch (error) {
      console.error('Error creating delivery:', error)
    }
  }

  const updateDeliveryStatus = async (id: string, status: Delivery['status']) => {
    try {
      const updatedDeliveries = deliveries.map(delivery => 
        delivery.id === id ? { ...delivery, status, updated_at: new Date().toISOString() } : delivery
      )

      if (!isSupabaseConfigured() || !supabase) {
        // Modo offline - usar localStorage
        setDeliveries(updatedDeliveries)
        offlineStorage.setItem(`deliveries_${user.id}`, JSON.stringify(updatedDeliveries))
      } else {
        // Modo online - usar Supabase
        const { error } = await supabase
          .from('deliveries')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)

        if (error) throw error
        setDeliveries(updatedDeliveries)
      }

      // Se status for "in_progress", enviar mensagem WhatsApp
      if (status === 'in_progress') {
        const delivery = deliveries.find(d => d.id === id)
        if (delivery && delivery.customer_phone) {
          const message = generateWhatsAppMessage(
            'Olá {customer_name}! Estou a caminho da sua entrega. Tempo estimado: {estimated_time}. Obrigado por escolher a {company_name}!',
            delivery.customer_name,
            '15-30 minutos'
          )
          openWhatsApp(delivery.customer_phone, message)
        }
      }
    } catch (error) {
      console.error('Error updating delivery status:', error)
    }
  }

  const handleSignOut = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      // Modo offline - limpar localStorage
      offlineStorage.removeItem('currentUser')
    } else {
      // Modo online - usar Supabase
      await supabase.auth.signOut()
    }
    setUser(null)
  }

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: Delivery['status']) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthComponent onAuthSuccess={setUser} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Delivery Pro</h1>
                <p className="text-sm text-gray-600">Sistema de Roteirização</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600 capitalize">{user.role}</p>
              </div>
              <Button variant="ghost" onClick={handleSignOut} className="text-gray-600 hover:text-gray-900">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="deliveries" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Entregas
            </TabsTrigger>
            <TabsTrigger value="routes" className="flex items-center gap-2">
              <RouteIcon className="w-4 h-4" />
              Rotas
            </TabsTrigger>
            <TabsTrigger value="counters" className="flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              Contadores
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total de Entregas</p>
                      <p className="text-3xl font-bold">{deliveries.length}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Entregues</p>
                      <p className="text-3xl font-bold">
                        {deliveries.filter(d => d.status === 'delivered').length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">Pendentes</p>
                      <p className="text-3xl font-bold">
                        {deliveries.filter(d => d.status === 'pending').length}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-yellow-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Em Andamento</p>
                      <p className="text-3xl font-bold">
                        {deliveries.filter(d => d.status === 'in_progress').length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Entregas Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Entregas Recentes</CardTitle>
                <CardDescription>Suas últimas entregas cadastradas</CardDescription>
              </CardHeader>
              <CardContent>
                {deliveries.slice(0, 5).length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma entrega cadastrada</h3>
                    <p className="text-gray-600 mb-4">Comece cadastrando sua primeira entrega!</p>
                    <Button onClick={() => setActiveTab('deliveries')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Entrega
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deliveries.slice(0, 5).map((delivery) => (
                      <div key={delivery.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{delivery.customer_name}</p>
                            <p className="text-sm text-gray-600">{delivery.address}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(delivery.status)}>
                          {getStatusIcon(delivery.status)}
                          <span className="ml-1 capitalize">{delivery.status}</span>
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deliveries Tab */}
          <TabsContent value="deliveries" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gerenciar Entregas</h2>
                <p className="text-gray-600">Cadastre e acompanhe suas entregas</p>
              </div>
              <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Entrega
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Nova Entrega</DialogTitle>
                    <DialogDescription>
                      Preencha os dados da entrega
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer-name">Nome do Cliente *</Label>
                      <Input
                        id="customer-name"
                        placeholder="Nome completo"
                        value={newDelivery.customer_name}
                        onChange={(e) => setNewDelivery({...newDelivery, customer_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer-phone">Telefone</Label>
                      <Input
                        id="customer-phone"
                        placeholder="(11) 99999-9999"
                        value={newDelivery.customer_phone}
                        onChange={(e) => setNewDelivery({...newDelivery, customer_phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço *</Label>
                      <Textarea
                        id="address"
                        placeholder="Endereço completo com CEP"
                        value={newDelivery.address}
                        onChange={(e) => setNewDelivery({...newDelivery, address: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spx-code">Código SPX</Label>
                      <Input
                        id="spx-code"
                        placeholder="Código de rastreamento SPX"
                        value={newDelivery.spx_tracking_code}
                        onChange={(e) => setNewDelivery({...newDelivery, spx_tracking_code: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimated-delivery">Previsão de Entrega</Label>
                      <Input
                        id="estimated-delivery"
                        type="datetime-local"
                        value={newDelivery.estimated_delivery}
                        onChange={(e) => setNewDelivery({...newDelivery, estimated_delivery: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        placeholder="Observações adicionais"
                        value={newDelivery.notes}
                        onChange={(e) => setNewDelivery({...newDelivery, notes: e.target.value})}
                      />
                    </div>
                    <Button onClick={createDelivery} className="w-full">
                      Cadastrar Entrega
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {deliveries.map((delivery) => (
                <Card key={delivery.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{delivery.customer_name}</CardTitle>
                      <Badge className={getStatusColor(delivery.status)}>
                        {getStatusIcon(delivery.status)}
                        <span className="ml-1 capitalize">{delivery.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {delivery.address}
                      </div>
                      {delivery.customer_phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {delivery.customer_phone}
                        </div>
                      )}
                      {delivery.spx_tracking_code && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Package className="w-4 h-4 mr-2" />
                          SPX: {delivery.spx_tracking_code}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {delivery.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateDeliveryStatus(delivery.id, 'in_progress')}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {delivery.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Entregar
                        </Button>
                      )}
                      {delivery.customer_phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const message = generateWhatsAppMessage(
                              'Olá {customer_name}! Estou a caminho da sua entrega. Tempo estimado: {estimated_time}. Obrigado por escolher a {company_name}!',
                              delivery.customer_name,
                              '15-30 minutos'
                            )
                            openWhatsApp(delivery.customer_phone, message)
                          }}
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                      )}
                      {delivery.spx_tracking_code && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://www.spxexpress.com.br/track?trackingNumber=${delivery.spx_tracking_code}`, '_blank')}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          SPX
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes" className="space-y-6">
            <div className="text-center py-12">
              <RouteIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Otimização de Rotas</h3>
              <p className="text-gray-600 mb-4">
                Funcionalidade em desenvolvimento. Em breve você poderá otimizar suas rotas automaticamente!
              </p>
              <Badge variant="secondary">Em Breve</Badge>
            </div>
          </TabsContent>

          {/* Counters Tab */}
          <TabsContent value="counters">
            <ClickCounterComponent userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}