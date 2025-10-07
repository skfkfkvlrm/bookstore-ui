import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../shared/components/common/Input";
import Button from "../../../shared/components/common/Button";

const LoanAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    memberId: "",
    bookId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to create loan
    // - Check if book is available
    // - Check member's loan limit
    // - Create loan with dueDate = loanDate + 14 days
    console.log("Create loan:", formData);
    navigate("/admin/loans");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">New Loan</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Register a new book loan. Due date will be set to 2 weeks from today.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Loan Information</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Please enter the member and book details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Member ID"
              type="number"
              placeholder="e.g., 1"
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              required
            />
            <Input
              label="Book ID"
              type="number"
              placeholder="e.g., 1"
              value={formData.bookId}
              onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
              required
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                info
              </span>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-1">Loan Policy</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Due date is automatically set to 2 weeks from today</li>
                  <li>Members can borrow up to their membership limit</li>
                  <li>Books must be available (not currently on loan)</li>
                  <li>Members with overdue loans cannot borrow new books</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate("/admin/loans")}>
              Cancel
            </Button>
            <Button type="submit">
              <span className="material-symbols-outlined">add</span>
              Create Loan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanAdd;
