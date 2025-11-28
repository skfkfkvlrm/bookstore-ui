import type { Loan } from "../../shared/types";
import { getCurrentUser } from "./authStorage";

const LOANS_STORAGE_KEY = "library_user_loans";

export const getCurrentMemberId = () => {
  const user = getCurrentUser();
  return user?.id || 1; // Fallback to 1 if not logged in
};

export const getUserLoans = (): Loan[] => {
  const stored = localStorage.getItem(LOANS_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

// localStorage 대출은 10000부터 시작하여 JSON 대출 ID와 충돌 방지
const LOCAL_STORAGE_ID_START = 10000;

export const addLoan = (loan: Omit<Loan, "id">): Loan => {
  const existingLoans = getUserLoans();
  const maxLocalId = existingLoans.length > 0
    ? Math.max(...existingLoans.map(l => l.id))
    : LOCAL_STORAGE_ID_START - 1;
  const newId = Math.max(maxLocalId, LOCAL_STORAGE_ID_START - 1) + 1;

  const newLoan: Loan = {
    ...loan,
    id: newId,
  };
  const updatedLoans = [newLoan, ...existingLoans];
  localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(updatedLoans));
  return newLoan;
};

export const updateLoan = (loanId: number, updates: Partial<Loan>): void => {
  const loans = getUserLoans();
  const updatedLoans = loans.map(loan =>
    loan.id === loanId ? { ...loan, ...updates } : loan
  );
  localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(updatedLoans));
};

export const returnBook = (loanId: number): void => {
  const returnDate = new Date().toISOString();
  updateLoan(loanId, {
    status: "RETURNED",
    returnDate,
  });
};

export const deleteLoan = (loanId: number): void => {
  const loans = getUserLoans();
  const updatedLoans = loans.filter(loan => loan.id !== loanId);
  localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(updatedLoans));
};
