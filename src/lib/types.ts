export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'entregador';
  created_at: string;
}

export interface Delivery {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'in_progress' | 'delivered' | 'cancelled';
  spx_tracking_code?: string;
  estimated_delivery: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  user_id: string;
  name: string;
  deliveries: Delivery[];
  total_distance: number;
  estimated_time: number;
  status: 'planned' | 'active' | 'completed';
  created_at: string;
}

export interface ClickCounter {
  id: string;
  user_id: string;
  name: string;
  count: number;
  increment_value: 1 | 5 | 10;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  message: string;
  variables: string[];
}