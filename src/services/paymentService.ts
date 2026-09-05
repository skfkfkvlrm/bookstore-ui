import { apiClient } from './apiClient';
import type { PaymentConfirmRequest, PaymentResponse } from '../shared/types';

export const paymentService = {
  /**
   * 2단계 결제 최종 승인 요청 (위변조 검증 및 PG 승인)
   */
  confirmPayment: (data: PaymentConfirmRequest): Promise<PaymentResponse> =>
    apiClient.post<PaymentResponse>('/api/payments/confirm', data).then((r) => r.data),

  /**
   * 결제 ID로 조회
   */
  getPaymentById: (id: number): Promise<PaymentResponse> =>
    apiClient.get<PaymentResponse>(`/api/payments/${id}`).then((r) => r.data),

  /**
   * 주문 ID로 결제 조회
   */
  getPaymentByOrderId: (orderId: number): Promise<PaymentResponse> =>
    apiClient.get<PaymentResponse>(`/api/payments/order/${orderId}`).then((r) => r.data),

  /**
   * 결제 취소
   */
  cancelPayment: (id: number): Promise<PaymentResponse> =>
    apiClient.patch<PaymentResponse>(`/api/payments/${id}/cancel`).then((r) => r.data),

  /**
   * 결제 환불
   */
  refundPayment: (id: number, refundAmount: number): Promise<PaymentResponse> =>
    apiClient.patch<PaymentResponse>(`/api/payments/${id}/refund`, null, { params: { refundAmount } }).then((r) => r.data),
};
