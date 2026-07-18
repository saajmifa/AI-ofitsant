export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number; // in Uzbek Soum (UZS)
  category: string;
  image: string;
  tags: string[];
  rating: number;
  prepareTime: number; // in minutes
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'received' | 'preparing' | 'on_way' | 'delivered';

export interface Order {
  id: string;
  tableNumber: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  timestamp: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[]; // Dish IDs
  action?: {
    type: 'ADD_TO_CART' | 'CLEAR_CART' | 'REMOVE_FROM_CART';
    payload?: {
      dishId: string;
      quantity?: number;
    };
  };
}

export interface CallRequest {
  id: string;
  tableNumber: string;
  type: 'waiter' | 'water' | 'cutlery' | 'clean';
  status: 'pending' | 'resolved';
  timestamp: string;
}

export interface Bill {
  tableNumber: string;
  subtotal: number;
  serviceCharge: number; // 10%
  tip: number;
  total: number;
  paymentMethod: 'click' | 'payme' | 'uzcard' | 'cash';
  isPaid: boolean;
}
