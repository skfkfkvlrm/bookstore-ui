import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Loan } from "../../../shared/types";
import Button from "../../../shared/components/common/Button";
import Badge from "../../../shared/components/common/Badge";
import { getLoanById, updateLoan } from "../../../shared/utils/mockLoanApi";

const LoanDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [isExtending, setIsExtending] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");

  useEffect(() => {
    if (id) {
      const loanId = parseInt(id, 10);
      const foundLoan = getLoanById(loanId);
      setLoan(foundLoan || null);
      if (foundLoan) {
        setNewDueDate(new Date(foundLoan.dueDate).toISOString().split("T")[0]);
      }
    }
  }, [id]);

  const getStatusVariant = (status: Loan["status"]) => {
    const statusMap = {
      ACTIVE: "active" as const,
      RETURNED: "returned" as const,
      OVERDUE: "overdue" as const,
    };
    return statusMap[status];
  };

  const handleReturn = () => {
    if (loan && window.confirm("Are you sure you want to mark this loan as returned?")) {
      const updatedLoan = updateLoan(loan.id, {
        status: "RETURNED",
        returnDate: new Date().toISOString(),
      });
      setLoan(updatedLoan || null);
    }
  };

  const handleSendReminder = () => {
    if (!loan) return;
    // TODO: API call to send reminder email
    console.log("Send reminder email to:", loan.memberEmail);
    alert(`Reminder email sent to ${loan.memberEmail}`);
  };

  const handleStartExtending = () => {
    if (loan) {
      setNewDueDate(new Date(loan.dueDate).toISOString().split("T")[0]);
      setIsExtending(true);
    }
  };

  const handleCancelExtending = () => {
    setIsExtending(false);
  };

  const handleSaveExtension = () => {
    if (loan && newDueDate) {
      const newDueDateObj = new Date(newDueDate);
      newDueDateObj.setHours(23, 59, 59, 999); // Set to end of day

      const updatedLoan = updateLoan(loan.id, {
        dueDate: newDueDateObj.toISOString(),
        status: newDueDateObj > new Date() ? "ACTIVE" : "OVERDUE",
      });
      setLoan(updatedLoan || null);
      setIsExtending(false);
    }
  };

  const isOverdue = () => {
    if (!loan || loan.status === "RETURNED") return false;
    return new Date(loan.dueDate) < new Date();
  };

  const daysUntilDue = () => {
    if (!loan) return 0;
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!loan) {
    return (
      <div className="max-w-7xl mx-auto text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          The loan with ID <span className="font-mono">#{id}</span> could not be found.
        </p>
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/loans")}
          className="mt-6"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to List
        </Button>
      </div>
    );
  }

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

      {isOverdue() && loan.status !== "RETURNED" && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
            <div className="flex-1">
              <p className="font-semibold text-red-800 dark:text-red-300">Overdue Loan</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                This loan is {Math.abs(daysUntilDue())} day(s) overdue. Please take action.
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
        {isExtending ? (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="newDueDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                New Due Date
              </label>
              <input
                type="date"
                id="newDueDate"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="mt-1 block w-full md:w-1/3 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] shadow-sm focus:border-[#2f9e5f] focus:ring-[#2f9e5f] sm:text-sm"
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleSaveExtension}>
                <span className="material-symbols-outlined">save</span>
                Save Extension
              </Button>
              <Button variant="secondary" onClick={handleCancelExtending}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {loan.status === "ACTIVE" && (
              <Button variant="success" onClick={handleReturn}>
                <span className="material-symbols-outlined">check_circle</span>
                Mark as Returned
              </Button>
            )}
            {loan.status === "OVERDUE" && (
              <Button variant="success" onClick={handleReturn}>
                <span className="material-symbols-outlined">check_circle</span>
                Mark as Returned
              </Button>
            )}
            {(loan.status === "ACTIVE" || loan.status === "OVERDUE") && (
              <>
                <Button variant="secondary" onClick={handleSendReminder}>
                  <span className="material-symbols-outlined">mail</span>
                  Send Reminder Email
                </Button>
                <Button variant="secondary" onClick={handleStartExtending}>
                  <span className="material-symbols-outlined">edit_calendar</span>
                  Extend Due Date
                </Button>
              </>
            )}
            {loan.status === "RETURNED" && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This loan has been returned. No further actions are available.
              </p>
            )}
          </div>
        )}
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
