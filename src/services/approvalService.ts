import { apiClient } from './apiClient';
import type { Approval, ApprovalStatus, CreateApprovalRequest, PageResponse } from '../shared/types';

export const approvalService = {
  /**
   * 도서 구매 품의 상신 (신청)
   */
  createApproval: (data: CreateApprovalRequest): Promise<Approval> =>
    apiClient.post<Approval>('/api/approvals', data).then((r) => r.data),

  /**
   * 내 품의 내역 조회
   */
  getMyApprovals: (memberId: number, page = 0, size = 10): Promise<PageResponse<Approval>> =>
    apiClient.get<PageResponse<Approval>>('/api/approvals/my', { params: { memberId, page, size } }).then((r) => r.data),

  /**
   * 전체 결재함 조회 (관리자용)
   */
  getAllApprovals: (status?: ApprovalStatus, page = 0, size = 10): Promise<PageResponse<Approval>> =>
    apiClient.get<PageResponse<Approval>>('/api/approvals', { params: { status, page, size } }).then((r) => r.data),

  /**
   * 품의 상세 조회
   */
  getApprovalById: (id: number): Promise<Approval> =>
    apiClient.get<Approval>(`/api/approvals/${id}`).then((r) => r.data),

  /**
   * 품의 승인 처리 (관리자)
   */
  approve: (id: number, approverId?: number): Promise<Approval> =>
    apiClient.patch<Approval>(`/api/approvals/${id}/approve`, null, { params: { approverId } }).then((r) => r.data),

  /**
   * 품의 반려 처리 (관리자)
   */
  reject: (id: number, reason: string, approverId?: number): Promise<Approval> =>
    apiClient.patch<Approval>(`/api/approvals/${id}/reject`, { reason }, { params: { approverId } }).then((r) => r.data),
};