import { apiClient } from './apiClient';
import type { Loan, ClientLoanRequest, PageResponse } from '../shared/types';

export const loanService = {
  // 클라이언트 API
  getMyLoans: (): Promise<Loan[]> =>
    apiClient.get<Loan[]>('/api/client/loans').then((r) => r.data),

  requestLoan: (data: ClientLoanRequest): Promise<Loan> =>
    apiClient.post<Loan>('/api/client/loans/request', data).then((r) => r.data),

  returnLoan: (loanId: number): Promise<Loan> =>
    apiClient.post<Loan>(`/api/client/loans/${loanId}/return`).then((r) => r.data),

  cancelLoan: (loanId: number): Promise<void> =>
    apiClient.delete(`/api/client/loans/${loanId}`).then(() => undefined),

  // 관리자 API
  getAllLoans: async (size = 500): Promise<Loan[]> => {
    const r = await apiClient.get<PageResponse<Loan> | Loan[]>('/api/admin/loans', { params: { page: 0, size } });
    const data = r.data;
    return Array.isArray(data) ? data : data.content;
  },

  getLoan: (id: number): Promise<Loan> =>
    apiClient.get<Loan>(`/api/admin/loans/${id}`).then((r) => r.data),

  createLoan: (data: { memberId: number; bookId: number }): Promise<Loan> =>
    apiClient.post<Loan>('/api/admin/loans', data).then((r) => r.data),

  updateLoan: (id: number, data: { status?: string; dueDate?: string }): Promise<Loan> =>
    apiClient.patch<Loan>(`/api/admin/loans/${id}`, data).then((r) => r.data),

  deleteLoan: (id: number): Promise<void> =>
    apiClient.delete(`/api/admin/loans/${id}`).then(() => undefined),

  getOverdueLoans: (): Promise<Loan[]> =>
    apiClient.get<Loan[]>('/api/admin/loans/overdue').then((r) => r.data),

  getActiveLoans: (): Promise<Loan[]> =>
    apiClient.get<Loan[]>('/api/admin/loans/active').then((r) => r.data),

  getLoansByMember: (memberId: number): Promise<Loan[]> =>
    apiClient.get<Loan[]>(`/api/admin/loans/member/${memberId}`).then((r) => r.data),

  getLoansByBook: (bookId: number): Promise<Loan[]> =>
    apiClient.get<Loan[]>(`/api/admin/loans/book/${bookId}`).then((r) => r.data),

  searchByMemberName: (name: string): Promise<Loan[]> =>
    apiClient.get<Loan[]>('/api/admin/loans/search/by-member-name', { params: { name } })
      .then((r) => r.data),

  searchByBookTitle: (title: string): Promise<Loan[]> =>
    apiClient.get<Loan[]>('/api/admin/loans/search/by-book-title', { params: { title } })
      .then((r) => r.data),

  getOverdueWithMemberInfo: (): Promise<Loan[]> =>
    apiClient.get<Loan[]>('/api/admin/loans/overdue/with-member-info').then((r) => r.data),
};
