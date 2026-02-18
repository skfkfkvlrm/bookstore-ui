import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { Member, Book, Loan } from "../../../shared/types";
import Button from "../../../shared/components/common/Button";
import membersData from "../../../shared/data/members.json";
import booksData from "../../../shared/data/books.json";
import { addDays, format, parseISO } from "date-fns";
import { createLoan } from "../../../shared/utils/mockLoanApi";

const LoanAdd = () => {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isMemberModalOpen, setMemberModalOpen] = useState(false);
  const [isBookModalOpen, setBookModalOpen] = useState(false);

  const [loanDate, setLoanDate] = useState(() => new Date());
  const [dueDate, setDueDate] = useState(() => addDays(new Date(), 14));

  useEffect(() => {
    // When loan date changes, update due date to be 14 days after
    setDueDate(addDays(loanDate, 14));
  }, [loanDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !selectedBook) {
      alert("Please select a member and a book.");
      return;
    }
    if (!selectedBook.available) {
      alert("This book is not available for loan.");
      return;
    }

    const newLoanData: Omit<Loan, "id"> = {
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      bookAuthor: selectedBook.author,
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      memberEmail: selectedMember.email,
      loanDate: loanDate.toISOString(),
      dueDate: dueDate.toISOString(),
      status: "ACTIVE",
    };

    createLoan(newLoanData);
    alert(`Loan created successfully for ${selectedMember.name} - "${selectedBook.title}"`);
    navigate("/admin/loans");
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">New Loan</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Select a member and a book to register a new loan.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Member Selection */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Member</h3>
                {selectedMember ? (
                  <InfoCard
                    title={selectedMember.name}
                    subtitle={selectedMember.email}
                    onchange={() => setMemberModalOpen(true)}
                  />
                ) : (
                  <SelectionPlaceholder
                    text="No member selected"
                    buttonText="Select Member"
                    onClick={() => setMemberModalOpen(true)}
                  />
                )}
              </div>

              {/* Book Selection */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Book</h3>
                {selectedBook ? (
                  <InfoCard
                    title={selectedBook.title}
                    subtitle={`by ${selectedBook.author}`}
                    onchange={() => setBookModalOpen(true)}
                    badge={
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          selectedBook.available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedBook.available ? "Available" : "On Loan"}
                      </span>
                    }
                  />
                ) : (
                  <SelectionPlaceholder
                    text="No book selected"
                    buttonText="Select Book"
                    onClick={() => setBookModalOpen(true)}
                  />
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Loan Confirmation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="loanDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loan Date
                  </label>
                  <input
                    type="date"
                    id="loanDate"
                    value={format(loanDate, "yyyy-MM-dd")}
                    onChange={(e) => setLoanDate(parseISO(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] shadow-sm focus:border-[#2f9e5f] focus:ring-[#2f9e5f] sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={format(dueDate, "yyyy-MM-dd")}
                    onChange={(e) => setDueDate(parseISO(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] shadow-sm focus:border-[#2f9e5f] focus:ring-[#2f9e5f] sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
              <Button variant="secondary" type="button" onClick={() => navigate("/admin/loans")}>
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedMember || !selectedBook}>
                <span className="material-symbols-outlined">add</span>
                Create Loan
              </Button>
            </div>
          </div>
        </form>
      </div>

      <SearchModal
        isOpen={isMemberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        onSelect={(member) => {
          setSelectedMember(member);
          setMemberModalOpen(false);
        }}
        data={membersData as Member[]}
        searchKeys={["name", "email"]}
        title="Select a Member"
        addNewLink="/admin/members/add"
        addNewLinkText="Register New Member"
        renderItem={(member: Member) => (
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
          </div>
        )}
      />

      <SearchModal
        isOpen={isBookModalOpen}
        onClose={() => setBookModalOpen(false)}
        onSelect={(book) => {
          setSelectedBook(book);
          setBookModalOpen(false);
        }}
        data={(booksData as Book[]).filter(b => b.available)}
        searchKeys={["title", "author", "isbn"]}
        title="Select an Available Book"
        addNewLink="/admin/books/add"
        addNewLinkText="Register New Book"
        renderItem={(book: Book) => (
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{book.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">by {book.author}</p>
          </div>
        )}
      />
    </>
  );
};

const SelectionPlaceholder = ({ text, buttonText, onClick }: { text: string; buttonText: string; onClick: () => void; }) => (
  <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{text}</p>
    <Button variant="secondary" type="button" onClick={onClick}>
      <span className="material-symbols-outlined">search</span>
      {buttonText}
    </Button>
  </div>
);

const InfoCard = ({ title, subtitle, onchange, badge }: { title: string; subtitle: string; onchange: () => void; badge?: React.ReactNode; }) => (
  <div className="h-full p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-start">
        <p className="font-bold text-lg text-gray-900 dark:text-white">{title}</p>
        {badge}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
    </div>
    <div className="mt-4">
      <Button variant="secondary" size="sm" type="button" onClick={onchange}>
        <span className="material-symbols-outlined">change_circle</span>
        Change
      </Button>
    </div>
  </div>
);

interface SearchModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  data: T[];
  searchKeys: (keyof T)[];
  title: string;
  addNewLink: string;
  addNewLinkText: string;
  renderItem: (item: T) => React.ReactNode;
}

const SearchModal = <T extends { id: number }>({
  isOpen,
  onClose,
  onSelect,
  data,
  searchKeys,
  title,
  addNewLink,
  addNewLinkText,
  renderItem,
}: SearchModalProps<T>) => {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter((item) =>
      searchKeys.some((key) =>
        String(item[key]).toLowerCase().includes(lowerQuery)
      )
    );
  }, [query, data, searchKeys]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] py-2 pl-4 pr-10 text-base focus:border-[#2f9e5f] focus:ring-[#2f9e5f]"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
          {results.length > 0 ? (
            <ul>
              {results.map((item) => (
                <li
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                >
                  {renderItem(item)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-8 text-center text-gray-600 dark:text-gray-400">No results found.</p>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <Link to={addNewLink} className="text-sm text-[#2f9e5f] hover:underline">
            {addNewLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoanAdd;
