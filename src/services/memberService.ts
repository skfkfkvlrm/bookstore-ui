import { apiClient } from './apiClient';
import type { Member, MemberCreateRequest, PageResponse, MembershipType } from '../shared/types';

export interface MemberLoanLimitInfo {
  memberId: number;
  memberName: string;
  membershipType: MembershipType;
  maxLoanCount: number;
  currentLoanCount: number;
  remainingLoanCount: number;
  canLoan: boolean;
}

export const memberService = {
  getMembers: (page = 0, size = 10): Promise<PageResponse<Member>> =>
    apiClient.get<PageResponse<Member>>('/api/members', { params: { page, size } })
      .then((r) => r.data),

  getMember: (id: number): Promise<Member> =>
    apiClient.get<Member>(`/api/members/${id}`).then((r) => r.data),

  createMember: (data: MemberCreateRequest): Promise<Member> =>
    apiClient.post<Member>('/api/members', data).then((r) => r.data),

  updateMember: (id: number, data: Partial<MemberCreateRequest>): Promise<Member> =>
    apiClient.put<Member>(`/api/members/${id}`, data).then((r) => r.data),

  deleteMember: (id: number): Promise<void> =>
    apiClient.delete(`/api/members/${id}`).then(() => undefined),

  search: (name: string, page = 0, size = 10): Promise<PageResponse<Member>> =>
    apiClient.get<PageResponse<Member>>('/api/members/search', { params: { name, page, size } })
      .then((r) => r.data),

  getByMembershipType: (type: MembershipType): Promise<Member[]> =>
    apiClient.get<Member[]>(`/api/members/membership/${type}`).then((r) => r.data),

  updateMembership: (id: number, membershipType: MembershipType): Promise<Member> =>
    apiClient.put<Member>(`/api/members/${id}/membership`, null, { params: { membershipType } })
      .then((r) => r.data),

  validateEmail: (email: string): Promise<boolean> =>
    apiClient.get<boolean>('/api/members/email/validate', { params: { email } })
      .then((r) => r.data),

  getLoanLimit: (id: number): Promise<MemberLoanLimitInfo> =>
    apiClient.get<MemberLoanLimitInfo>(`/api/members/${id}/loan-limit`).then((r) => r.data),
};
