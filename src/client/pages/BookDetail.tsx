import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Book } from "../../shared/types";
import booksData from "../../shared/data/books.json";

const BookDetail = () => {
  const { id } = useParams();
  const initialBook = (booksData as Book[]).find((b) => b.id === Number(id)) || (booksData[0] as Book);
  const [book] = useState<Book>(initialBook);
  const [quantity, setQuantity] = useState(1);
  const [loanPeriod, setLoanPeriod] = useState("14");

  const handleAddToCart = () => {
    console.log("Add to cart:", { bookId: id, quantity });
    alert(`Added ${quantity} ${quantity === 1 ? "copy" : "copies"} of "${book.title}" to cart`);
  };

  const handleAddToWishlist = () => {
    console.log("Add to wishlist:", id);
    alert(`Added "${book.title}" to your wishlist`);
  };

  const handleBorrowBook = () => {
    console.log("Borrow book:", { bookId: id, loanPeriod });
    alert(`Request to borrow "${book.title}" for ${loanPeriod} days has been submitted`);
  };

  return (
    <div className="mx-auto">
      <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/client/books" className="hover:text-[#1173d4]">
          Books
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">{book.title}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              className="w-full rounded-lg shadow-lg aspect-[3/4] object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full rounded-lg shadow-lg bg-gradient-to-br from-[#1173d4]/20 to-[#1173d4]/5 aspect-[3/4] flex items-center justify-center ${book.coverImage ? 'hidden' : ''}`}>
            <span className="material-symbols-outlined text-[8rem] text-[#1173d4]/40">book</span>
          </div>
        </div>

        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{book.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            by{" "}
            <Link to={`/client/authors/${book.author}`} className="text-[#1173d4] hover:underline">
              {book.author}
            </Link>
          </p>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ISBN</p>
                <p className="text-base font-medium text-gray-800 dark:text-gray-200">{book.isbn}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                <p className="text-2xl font-bold text-[#1173d4]">${book.price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Availability</p>
                {book.available ? (
                  <p className="inline-flex items-center text-base font-medium text-green-600 dark:text-green-400">
                    <span className="material-symbols-outlined mr-1 text-lg">check_circle</span>
                    In Stock
                  </p>
                ) : (
                  <p className="inline-flex items-center text-base font-medium text-red-600 dark:text-red-400">
                    <span className="material-symbols-outlined mr-1 text-lg">cancel</span>
                    Out of Stock
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                    disabled={!book.available}
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-[#101922] py-1 focus:border-[#1173d4] focus:ring-[#1173d4]"
                    disabled={!book.available}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                    disabled={!book.available}
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {/* Borrow Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1173d4]">library_books</span>
                Borrow this Book
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loan Period
                  </label>
                  <select
                    value={loanPeriod}
                    onChange={(e) => setLoanPeriod(e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-[#101922] py-2 px-3 focus:border-[#1173d4] focus:ring-[#1173d4] text-gray-900 dark:text-gray-100"
                    disabled={!book.available}
                  >
                    <option value="7">7 days</option>
                    <option value="14">14 days (Standard)</option>
                    <option value="21">21 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleBorrowBook}
                    disabled={!book.available}
                    className="w-full inline-flex items-center justify-center px-6 py-2 rounded-lg bg-green-600 text-white font-bold text-base hover:bg-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined mr-2">book</span>
                    Borrow Book
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                Free borrowing. Return before due date to avoid late fees.
              </p>
            </div>

            {/* Purchase Section */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!book.available}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#1173d4] text-white font-bold text-base hover:bg-[#1173d4]/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined mr-2">add_shopping_cart</span>
                Add to Cart
              </button>
              <button
                onClick={handleAddToWishlist}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#1173d4]/20 dark:bg-[#1173d4]/20 text-[#1173d4] font-bold text-base hover:bg-[#1173d4]/30 dark:hover:bg-[#1173d4]/30 transition-all"
              >
                <span className="material-symbols-outlined mr-2">favorite</span>
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Book Details</h2>
        <div className="prose prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          <p>
            In the quaint town of Willow Creek, a series of unsettling events has the community on
            edge. A reclusive artist, known only as 'The Silent Observer,' becomes the focus of
            suspicion when cryptic clues are discovered in their artwork, hinting at a deeper
            mystery. As the town's detective, Sarah Walker, delves into the case, she uncovers a web
            of secrets and hidden connections, leading her to question everything she thought she
            knew about her neighbors and the peaceful facade of Willow Creek. This gripping thriller
            will keep you guessing until the final page, as Sarah races against time to unravel the
            truth before it's too late.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
