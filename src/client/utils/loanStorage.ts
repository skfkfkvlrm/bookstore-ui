import type { Loan } from "../../shared/types";

const LOANS_STORAGE_KEY = "library_user_loans";
const CURRENT_MEMBER_ID = 1; // TODO: Replace with actual authenticated user ID

export const getCurrentMemberId = () => CURRENT_MEMBER_ID;

export const getUserLoans = (): Loan[] => {
  const stored = localStorage.getItem(LOANS_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const addLoan = (loan: Omit<Loan, "id">): Loan => {
  const existingLoans = getUserLoans();
  const newId = Math.max(0, ...existingLoans.map(l => l.id)) + 1;
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
