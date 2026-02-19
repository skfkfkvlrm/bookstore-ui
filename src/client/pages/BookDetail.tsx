import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Book } from "../../shared/types";
import { bookService } from "../../services/bookService";
import { loanService } from "../../services/loanService";
import { addToCart } from "../utils/cartStorage";
import { getCurrentUser } from "../utils/authStorage";
import axios from "axios";
import type { ApiError } from "../../shared/types";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loanPeriod, setLoanPeriod] = useState(14);
  const [loanLoading, setLoanLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    bookService.getBook(Number(id))
      .then(setBook)
      .catch(() => setError("도서 정보를 불러오는 데 실패했습니다."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!book) return;
    addToCart(book, quantity);
    const confirmNavigate = window.confirm(
      `"${book.title}" ${quantity}권을 장바구니에 담았습니다.\n\n장바구니로 이동할까요?`
    );
    if (confirmNavigate) navigate("/client/cart");
  };

  const handleAddToWishlist = () => {
    if (!book) return;
    alert(`"${book.title}"을(를) 위시리스트에 담았습니다.`);
  };

  const handleBorrowBook = async () => {
    if (!book) return;

    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("로그인 후 대출할 수 있습니다.");
      navigate("/client/login");
      return;
    }

    setLoanLoading(true);
    try {
      await loanService.requestLoan({ bookId: book.id, loanPeriod });
      const confirmNavigate = window.confirm(
        `"${book.title}"을(를) ${loanPeriod}일 동안 대출했습니다!\n\n내 대출 내역을 확인할까요?`
      );
      if (confirmNavigate) navigate("/client/my-loans");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        if (err.response?.status === 409) {
          alert("이미 대출 중인 도서입니다.");
        } else if (err.response?.status === 400) {
          alert(apiError?.message ?? "대출 한도를 초과했습니다.");
        } else {
          alert(apiError?.message ?? "대출 처리 중 오류가 발생했습니다.");
        }
      } else {
        alert("서버에 연결할 수 없습니다. 잠시 후 다시 시도하세요.");
      }
    } finally {
      setLoanLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-symbols-outlined text-4xl text-[#2f9e5f] animate-spin">progress_activity</span>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">error</span>
        <p className="text-lg text-gray-600 dark:text-gray-400">{error ?? "도서를 찾을 수 없습니다."}</p>
        <Link to="/client/books" className="mt-4 inline-block text-[#2f9e5f] hover:underline">
          도서 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/client/books" className="hover:text-[#2f9e5f]">
          도서 목록
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">{book.title}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={`${book.title} 표지 이미지`}
              className="w-full rounded-lg shadow-lg aspect-[3/4] object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div className={`w-full rounded-lg shadow-lg bg-gradient-to-br from-[#2f9e5f]/20 to-[#2f9e5f]/5 aspect-[3/4] flex items-center justify-center ${book.coverImageUrl ? "hidden" : ""}`}>
            <span className="material-symbols-outlined text-[8rem] text-[#2f9e5f]/40">book</span>
          </div>
        </div>

        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{book.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            저자{" "}
            <Link to={`/client/authors/${book.author}`} className="text-[#2f9e5f] hover:underline">
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
                <p className="text-sm text-gray-500 dark:text-gray-400">가격</p>
                <p className="text-2xl font-bold text-[#2f9e5f]">{book.price.toLocaleString()}원</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">재고 상태</p>
                {book.available ? (
                  <p className="inline-flex items-center text-base font-medium text-green-600 dark:text-green-400">
                    <span className="material-symbols-outlined mr-1 text-lg">check_circle</span>
                    재고 있음
                  </p>
                ) : (
                  <p className="inline-flex items-center text-base font-medium text-red-600 dark:text-red-400">
                    <span className="material-symbols-outlined mr-1 text-lg">cancel</span>
                    재고 없음
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">수량</p>
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
                    className="w-16 text-center rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-[#101922] py-1 focus:border-[#2f9e5f] focus:ring-[#2f9e5f]"
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
                <span className="material-symbols-outlined text-[#2f9e5f]">library_books</span>
                도서 대출
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    대출 기간
                  </label>
                  <select
                    value={loanPeriod}
                    onChange={(e) => setLoanPeriod(Number(e.target.value))}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-[#101922] py-2 px-3 focus:border-[#2f9e5f] focus:ring-[#2f9e5f] text-gray-900 dark:text-gray-100"
                    disabled={!book.available || loanLoading}
                  >
                    <option value={7}>7일</option>
                    <option value={14}>14일 (기본)</option>
                    <option value={21}>21일</option>
                    <option value={30}>30일</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleBorrowBook}
                    disabled={!book.available || loanLoading}
                    className="w-full inline-flex items-center justify-center px-6 py-2 rounded-lg bg-green-600 text-white font-bold text-base hover:bg-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loanLoading ? (
                      <>
                        <span className="material-symbols-outlined mr-2 animate-spin">progress_activity</span>
                        처리 중...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined mr-2">book</span>
                        대출하기
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                대출은 무료이며, 연체료를 피하려면 반납 기한을 지켜주세요.
              </p>
            </div>

            {/* Purchase Section */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!book.available}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#2f9e5f] text-white font-bold text-base hover:bg-[#2f9e5f]/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined mr-2">add_shopping_cart</span>
                장바구니 담기
              </button>
              <button
                onClick={handleAddToWishlist}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#2f9e5f]/20 dark:bg-[#2f9e5f]/20 text-[#2f9e5f] font-bold text-base hover:bg-[#2f9e5f]/30 dark:hover:bg-[#2f9e5f]/30 transition-all"
              >
                <span className="material-symbols-outlined mr-2">favorite</span>
                위시리스트 추가
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">도서 상세 소개</h2>
        <div className="prose prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          <p>
            고즈넉한 마을 윌로우 크리크에서 의문의 사건이 잇달아 발생하며 주민들이 불안에 빠집니다.
            '침묵하는 관찰자'라 불리는 은둔 화가의 작품 속에서 암호 같은 단서가 발견되자, 사건은 새로운 국면을 맞이합니다.
            마을 형사 사라 워커가 수사에 나서면서, 평온해 보이던 일상 뒤에 숨겨진 비밀과 연결 고리가 하나둘 드러나고,
            그녀는 이웃들에 대해 알고 있던 모든 것을 의심하게 됩니다. 진실을 밝혀내기 위한 사라의 시간과의 싸움이
            마지막 페이지까지 긴장감을 놓지 못하게 만드는 서스펜스를 선사합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
