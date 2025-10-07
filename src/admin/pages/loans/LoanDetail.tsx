import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Loan } from "../../../shared/types";
import Button from "../../../shared/components/common/Button";
import Badge from "../../../shared/components/common/Badge";

// Mock data - replace with API call
const mockLoan: Loan = {
  id: 2,
  bookId: 2,
  bookTitle: "1984",
  bookAuthor: "George Orwell",
  memberId: 2,
  memberName: "Ethan Bennett",
  memberEmail: "ethan.bennett@email.com",
  loanDate: "2025-09-15T11:00:00",
  dueDate: "2025-09-29T11:00:00",
  status: "ACTIVE",
};

const LoanDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loan, setLoan] = useState<Loan>(mockLoan);

  const getStatusVariant = (status: Loan["status"]) => {
    const statusMap = {
      ACTIVE: "active" as const,
      RETURNED: "returned" as const,
      OVERDUE: "overdue" as const,
    };
    return statusMap[status];
  };

  const handleReturn = () => {
    if (window.confirm("Are you sure you want to mark this loan as returned?")) {
      // TODO: API call to return loan
      const returnDate = new Date().toISOString();
      console.log("Return loan:", id, "at", returnDate);
      setLoan({
        ...loan,
        returnDate,
        status: "RETURNED",
      });
    }
  };

  const handleSendReminder = () => {
    // TODO: API call to send reminder email
    console.log("Send reminder email to:", loan.memberEmail);
    alert(`Reminder email sent to ${loan.memberEmail}`);
  };

  const isOverdue = () => {
    if (loan.status === "RETURNED") return false;
    return new Date(loan.dueDate) < new Date();
  };

  const daysUntilDue = () => {
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Loan Details</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Loan ID: <span className="font-mono">#{String(loan.id).padStart(6, "0")}</span>
          </p>
        </div>
      </div>

      {isOverdue() && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
            <div className="flex-1">
              <p className="font-semibold text-red-800 dark:text-red-300">Overdue Loan</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                This loan is {Math.abs(daysUntilDue())} day(s) overdue. Please return the book as
                soon as possible.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Loan Information
              </h3>
              <div className="mt-2">
                <Badge variant={getStatusVariant(loan.status)}>{loan.status}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
              Book Information
            </h4>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Title</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{loan.bookTitle}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Author</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{loan.bookAuthor}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Book ID</dt>
                <dd className="font-mono text-gray-900 dark:text-white">{loan.bookId}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
              Member Information
            </h4>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Name</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{loan.memberName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Email</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{loan.memberEmail}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Member ID</dt>
                <dd className="font-mono text-gray-900 dark:text-white">{loan.memberId}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Loan Dates</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Loan Date</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {new Date(loan.loanDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Due Date</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {new Date(loan.dueDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Return Date</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : "-"}
              </dd>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Loan Actions</h4>
        <div className="flex gap-4">
          {loan.status === "ACTIVE" && (
            <Button variant="success" onClick={handleReturn}>
              <span className="material-symbols-outlined">check_circle</span>
              Mark as Returned
            </Button>
          )}
          {(loan.status === "ACTIVE" || loan.status === "OVERDUE") && (
            <Button variant="secondary" onClick={handleSendReminder}>
              <span className="material-symbols-outlined">mail</span>
              Send Reminder Email
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button variant="secondary" onClick={() => navigate("/admin/loans")}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to List
        </Button>
      </div>
    </div>
  );
};

export default LoanDetail;
