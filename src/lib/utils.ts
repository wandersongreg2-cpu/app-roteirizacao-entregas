import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `+55${cleaned}`;
  }
  return phone;
}

export function formatAddress(address: string): string {
  return address.trim().replace(/\s+/g, ' ');
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function generateWhatsAppMessage(
  template: string,
  customerName: string,
  estimatedTime: string
): string {
  return template
    .replace('{customer_name}', customerName)
    .replace('{estimated_time}', estimatedTime)
    .replace('{company_name}', 'Delivery Pro');
}

export function openWhatsApp(phone: string, message: string): void {
  const formattedPhone = formatPhone(phone);
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  window.open(url, '_blank');
}