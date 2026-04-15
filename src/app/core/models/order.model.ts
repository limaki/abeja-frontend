export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string;
  category: string;
}

export interface Order {
  _id: string;
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  address: string;
  notes: string;
  items: OrderItem[];
  total: number;
  alias: string;
  status: 'pending' | 'sent_whatsapp' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}