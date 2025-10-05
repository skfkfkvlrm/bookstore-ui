// Member Types
export interface Member {
  id: number;
  name: string;
  email: string;
  membershipType: 'REGULAR' | 'PREMIUM' | 'SUSPENDED';
  joinDate: string;
}

export interface MemberCreateRequest {
  name: string;
  email: string;
  membershipType: 'REGULAR' | 'PREMIUM';
}

// Book Types
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  price: number;
  available: boolean;
  createdDate: string;
}

export interface BookCreateRequest {
  title: string;
  author: string;
  isbn: string;
  price: number;
  available: boolean;
}

// Order Types
export interface Order {
  id: number;
  totalAmount: number;
  orderDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  customerEmail?: string;
}

export interface OrderItem {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  quantity: number;
  price: number;
}

export interface OrderCreateRequest {
  bookIds: number[];
  customerEmail: string;
}

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderAmount: number;
}

// Pagination Types
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

// Navigation Types
export interface NavItem {
  to: string;
  icon: string;
  label: string;
}

// Badge Variant Types
export type BadgeVariant = 'premium' | 'standard' | 'available' | 'unavailable' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

// Button Variant Types
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
