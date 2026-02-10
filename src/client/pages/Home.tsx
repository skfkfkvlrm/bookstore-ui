import { Link } from "react-router-dom";
import type { Book } from "../../shared/types";
import booksData from "../../shared/data/books.json";

// Get first 6 books as featured
const featuredBooks: Book[] = (booksData as Book[]).slice(0, 6);

const Home = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden text-center py-16 rounded-2xl bg-cover bg-center"
        style={{ backgroundImage: "url('/pexels-element5-1370296.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#052813]/90 via-[#0b4d35]/70 to-[#052813]/70" />
        <div className="relative z-10">
          <span className="material-symbols-outlined text-7xl text-white mb-4">local_library</span>
          <h1 className="text-5xl font-bold text-white mb-4">
          스프링 도서관에 오신 것을 환영합니다
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          방대한 소장 도서를 살펴보고, 손쉽게 대출하거나 구매해 보세요.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/client/books"
              className="inline-flex items-center px-8 py-3 rounded-lg bg-white/90 text-[#0b2f53] font-bold text-base hover:bg-white transition-all shadow-md"
            >
              <span className="material-symbols-outlined mr-2">search</span>
              도서 둘러보기
            </Link>
            <Link
              to="/client/my-loans"
              className="inline-flex items-center px-8 py-3 rounded-lg bg-white/20 text-white font-bold text-base hover:bg-white/30 transition-all"
            >
              <span className="material-symbols-outlined mr-2">book</span>
              내 대출 확인
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">추천 도서</h2>
          <Link
            to="/client/books"
            className="text-[#2f9e5f] hover:underline font-medium flex items-center gap-1"
          >
            전체 보기
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {featuredBooks.map((book) => (
            <Link
              key={book.id}
              to={`/client/books/${book.id}`}
              className="group flex flex-col gap-2"
            >
              <div className="w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 transition-shadow duration-300 group-hover:shadow-xl">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={`${book.title} 표지 이미지`}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`aspect-[3/4] w-full bg-gradient-to-br from-[#2f9e5f]/20 to-[#2f9e5f]/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${book.coverImage ? 'hidden' : ''}`}>
                  <span className="material-symbols-outlined text-6xl text-[#2f9e5f]/40">
                    book
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">저자 {book.author}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm font-bold text-[#2f9e5f]">${book.price}</p>
                  {book.available ? (
                    <span className="text-xs text-green-600 dark:text-green-400">재고 있음</span>
                  ) : (
                    <span className="text-xs text-red-600 dark:text-red-400">재고 없음</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 py-8">
        <div className="text-center p-6 bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl text-[#2f9e5f] mb-4">
            library_books
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            방대한 소장 도서
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            다양한 장르와 주제의 도서를 수천 권 이상 제공해요
          </p>
        </div>

        <div className="text-center p-6 bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl text-[#2f9e5f] mb-4">
            schedule
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">간편한 대출</h3>
          <p className="text-gray-600 dark:text-gray-400">
            유연한 대출 기간과 쉬운 반납 절차를 지원합니다
          </p>
        </div>

        <div className="text-center p-6 bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl text-[#2f9e5f] mb-4">
            shopping_cart
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">구매 서비스</h3>
          <p className="text-gray-600 dark:text-gray-400">
            마음에 드는 도서를 합리적인 가격으로 구매하세요
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
