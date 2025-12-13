import type { Loan } from "../types";
import loansData from "../data/loans.json";

const LOANS_STORAGE_KEY = "library_loans";

// --- Helper Functions ---

const getLoansFromStorage = (): Loan[] => {
  const data = localStorage.getItem(LOANS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLoansToStorage = (loans: Loan[]) => {
  localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loans));
};

// --- Public API ---

/**
 * Initializes the loan data in localStorage if it's not already there.
 * Loads data from the static JSON file on first run.
 */
export const initLoans = () => {
  if (!localStorage.getItem(LOANS_STORAGE_KEY)) {
    saveLoansToStorage(loansData as Loan[]);
  }
};

interface GetLoansParams {
  searchQuery?: string;
  statusFilter?: "all" | Loan["status"];
  sortKey?: keyof Loan;
  sortOrder?: "asc" | "desc";
}

/**
 * Retrieves all loans, with optional filtering, searching, and sorting.
 */
export const getLoans = (params: GetLoansParams): Loan[] => {
  const {
    searchQuery = "",
    statusFilter = "all",
    sortKey = "loanDate",
    sortOrder = "desc",
  } = params;

  let loans = getLoansFromStorage();

  // Apply search filter
  if (searchQuery) {
    const lowerCaseQuery = searchQuery.toLowerCase();
    loans = loans.filter(
      (loan) =>
        loan.bookTitle.toLowerCase().includes(lowerCaseQuery) ||
        loan.memberName.toLowerCase().includes(lowerCaseQuery) ||
        loan.memberEmail.toLowerCase().includes(lowerCaseQuery)
    );
  }

  // Apply status filter
  if (statusFilter !== "all") {
    loans = loans.filter((loan) => loan.status === statusFilter);
  }

  // Apply sorting
  loans.sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];

    let comparison = 0;
    if (valA > valB) {
      comparison = 1;
    } else if (valA < valB) {
      comparison = -1;
    }

    return sortOrder === "desc" ? comparison * -1 : comparison;
  });

  return loans;
};

/**
 * Retrieves a single loan by its ID.
 */
export const getLoanById = (id: number): Loan | undefined => {
  const loans = getLoansFromStorage();
  return loans.find((loan) => loan.id === id);
};

/**
 * Creates a new loan and adds it to storage.
 */
export const createLoan = (newLoanData: Omit<Loan, "id">): Loan => {
  const loans = getLoansFromStorage();
  const newId = loans.length > 0 ? Math.max(...loans.map((l) => l.id)) + 1 : 1;
  const newLoan: Loan = { id: newId, ...newLoanData };

  // Also update the availability of the book
  // This is a side-effect that a real backend would handle transactionally
  // For mock purposes, we'll just log it.
  console.log(`SIDE EFFECT: Mark book with ID ${newLoanData.bookId} as unavailable.`);

  saveLoansToStorage([...loans, newLoan]);
  return newLoan;
};

/**
 * Updates an existing loan in storage.
 */
export const updateLoan = (id: number, updates: Partial<Omit<Loan, "id">>): Loan | undefined => {
  const loans = getLoansFromStorage();
  const loanIndex = loans.findIndex((loan) => loan.id === id);

  if (loanIndex === -1) {
    return undefined;
  }

  const originalLoan = loans[loanIndex];
  const updatedLoan = { ...originalLoan, ...updates };
  loans[loanIndex] = updatedLoan;

  // Handle side-effect of book availability on return
  if (originalLoan.status !== "RETURNED" && updatedLoan.status === "RETURNED") {
    console.log(`SIDE EFFECT: Mark book with ID ${updatedLoan.bookId} as available.`);
  }

  saveLoansToStorage(loans);

  return updatedLoan;
};

/**
 * Deletes a loan from storage.
 */
export const deleteLoan = (id: number): boolean => {
  const loans = getLoansFromStorage();
  const loanToDelete = loans.find(loan => loan.id === id);
  const newLoans = loans.filter((loan) => loan.id !== id);

  if (newLoans.length === loans.length) {
    return false; // Loan not found
  }

  if (loanToDelete && loanToDelete.status !== "RETURNED") {
     console.log(`SIDE EFFECT: Mark book with ID ${loanToDelete.bookId} as available upon loan deletion.`);
  }

  saveLoansToStorage(newLoans);
  return true;
};
