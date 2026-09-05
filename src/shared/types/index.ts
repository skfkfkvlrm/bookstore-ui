// Member Types
export type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'DORMANT' | 'WITHDRAWN';
export type MembershipType = 'REGULAR' | 'PREMIUM' | 'SUSPENDED';
export type UserRole = 'USER' | 'ADMIN';

export interface Member {
  id: number;
  name: string;
  email: string;
  membershipType: MembershipType;
  role?: UserRole;
  status?: MemberStatus;  // 로컬 전용 (API 응답에는 없음)
  joinDate: string;
}

export interface MemberCreateRequest {
  name: string;
  email: string;
  membershipType?: MembershipType;
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
  coverImageUrl?: string;
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
  memberId: number;
  memberName: string;
  memberEmail: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  orderItems: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  orderDate: string;
  payment?: OrderPayment;
  delivery?: OrderDelivery;
}

export interface OrderItem {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface OrderPayment {
  method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'KAKAO_PAY' | 'NAVER_PAY' | 'TOSS_PAY';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: number;
}

export interface OrderDelivery {
  recipientName: string;
  phoneNumber: string;
  address: string;
  addressDetail?: string;
  zipCode?: string;
  deliveryMemo?: string;
  status: string;
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
export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'CANCELLED';

export interface Loan {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn?: string;
  memberId: number;
  memberName: string;
  memberEmail: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
  extensionCount?: number;
  overdueFee?: number;
  overdueDays?: number;
  daysUntilDue?: number;
  isOverdue?: boolean;
  canExtendNow?: boolean;
}

export interface LoanCreateRequest {
  bookId: number;
  memberId: number;
}

export interface ClientLoanRequest {
  bookId: number;
  loanPeriod?: number;
}

// Auth Types
export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// API Error Type
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  errorCode: string;
  message: string;
  path: string;
  fieldErrors?: { field: string; rejectedValue: string; message: string }[];
}

// Badge Variant Types
export type BadgeVariant = 'premium' | 'standard' | 'available' | 'unavailable' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'active' | 'returned' | 'overdue' | 'suspended' | 'dormant' | 'withdrawn';

// Button Variant Types
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

// Payment Types
export interface PaymentConfirmRequest {
  orderId: number;
  paymentKey: string;
  amount: number;
  pgProvider?: string;
  cardCompany?: string;
  cardNumber?: string;
  installmentMonths?: number;
}

export interface PaymentResponse {
  id: number;
  orderId: number;
  method: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIAL_REFUNDED';
  amount: number;
  paymentDate?: string;
  transactionId?: string;
  paymentKey?: string;
  pgProvider?: string;
  receiptUrl?: string;
  cardCompany?: string;
  cardNumber?: string;
  installmentMonths?: number;
  failureReason?: string;
}

// Approval (전자결재/품의) Types
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ORDERED';

export interface ApprovalItem {
  id: number;
  bookId?: number;
  bookTitle: string;
  bookAuthor?: string;
  isbn?: string;
  quantity: number;
  estimatedPrice: number;
  totalPrice: number;
}

export interface Approval {
  id: number;
  applicantId: number;
  applicantName: string;
  applicantEmail: string;
  approverId?: number;
  approverName?: string;
  title: string;
  purpose?: string;
  department?: string;
  totalAmount: number;
  status: ApprovalStatus;
  statusDescription: string;
  rejectionReason?: string;
  orderId?: number;
  submittedDate: string;
  reviewedDate?: string;
  items: ApprovalItem[];
}

export interface CreateApprovalRequest {
  memberId?: number;
  title: string;
  purpose?: string;
  department?: string;
  items: Array<{
    bookId?: number;
    bookTitle: string;
    bookAuthor?: string;
    isbn?: string;
    quantity: number;
    estimatedPrice: number;
  }>;
}
