// Member Types
export type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'DORMANT' | 'WITHDRAWN';
export type MemberGrade = 'BASIC' | 'SILVER' | 'GOLD' | 'VIP';

export interface Member {
  id: number;
  name: string;
  email: string;
  membershipType: 'REGULAR' | 'PREMIUM';
  memberGrade?: MemberGrade;    // 회원 등급 (대출 권수 제한 기준)
  status: MemberStatus;
  joinDate: string;
}

export interface MemberCreateRequest {
  name: string;
  email: string;
  membershipType: 'REGULAR' | 'PREMIUM';
  status?: MemberStatus;
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
  coverImage?: string;
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
  paymentMethod?: 'CREDIT_CARD' | 'BANK_TRANSFER';
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED';
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
  items: Array<{ bookId: number; quantity: number }>;
  customerEmail: string;
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER';
}

export interface OrderUpdateStatusRequest {
  orderId: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
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

// Loan Types
export interface Loan {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  memberId: number;
  memberName: string;
  memberEmail: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  extensionCount?: number;     // 연장 횟수 (기본값: 0)
  overdueFee?: number;          // 연체료 (원 단위)
  overdueDays?: number;         // 연체 일수
}

export interface LoanCreateRequest {
  bookId: number;
  memberId: number;
}

export interface LoanReturnRequest {
  loanId: number;
  returnDate: string;
}

// Badge Variant Types
export type BadgeVariant = 'premium' | 'standard' | 'available' | 'unavailable' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'active' | 'returned' | 'overdue' | 'suspended' | 'dormant' | 'withdrawn';

// Button Variant Types
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
