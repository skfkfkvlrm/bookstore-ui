import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Book } from "../../shared/types";
import { bookService } from "../../services/bookService";

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [newBooks, setNewBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [newRes, popularRes, statsRes] = await Promise.all([
          bookService.getBooks(0, 6),
          bookService.getBooks(1, 6),
          bookService.getStatistics(),
        ]);
        setNewBooks(newRes.content);
        setPopularBooks(popularRes.content);
        setTotalBooks(statsRes.totalBooks);
      } catch {
        // 조용히 실패
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/client/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16">

      {/* Hero */}
      <section
        className="relative overflow-hidden text-center py-24 rounded-2xl bg-cover bg-center"
        style={{ backgroundImage: "url('/pexels-element5-1370296.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#052813]/90 via-[#0b4d35]/70 to-[#052813]/70" />
        <div className="relative z-10 px-4">
          <h1 className="text-5xl font-bold text-white mb-4">
            스프링 도서관에 오신 것을 환영합니다
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            방대한 소장 도서를 살펴보고, 손쉽게 대출하거나 구매해 보세요.
          </p>

          {/* 검색창 */}
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto mb-8 gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="도서를 검색하세요 (제목·저자·ISBN)"
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/95 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f9e5f] text-base"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-[#2f9e5f] text-white font-bold hover:bg-[#2f9e5f]/90 transition-colors"
            >
              검색
            </button>
          </form>

          <div className="flex gap-4 justify-center">
            <Link
              to="/client/books"
              className="inline-flex items-center px-8 py-3 rounded-lg bg-white/90 text-[#0b2f53] font-bold text-base hover:bg-white transition-all shadow-md"
            >
              <span className="material-symbols-outlined mr-2">auto_stories</span>
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

      {/* 통계 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: "library_books", label: "총 소장 도서", value: loading ? "..." : `${totalBooks.toLocaleString()}권` },
          { icon: "schedule", label: "대출 기간", value: "14일" },
          { icon: "autorenew", label: "연장 가능", value: "최대 1회" },
          { icon: "local_shipping", label: "배송 서비스", value: "전국 가능" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#1a2632] rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col items-center text-center gap-2"
          >
            <span className="material-symbols-outlined text-4xl text-[#2f9e5f]">{stat.icon}</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* 신규 도서 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">신규 입고 도서</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">최근 등록된 도서를 확인하세요</p>
          </div>
          <Link to="/client/books" className="text-[#2f9e5f] hover:underline font-medium flex items-center gap-1 text-sm">
            전체 보기 <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        <BookGrid books={newBooks} loading={loading} />
      </section>

      {/* 추천 도서 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">추천 도서</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">다양한 분야의 인기 도서를 만나보세요</p>
          </div>
          <Link to="/client/books" className="text-[#2f9e5f] hover:underline font-medium flex items-center gap-1 text-sm">
            전체 보기 <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        <BookGrid books={popularBooks} loading={loading} />
      </section>

      {/* 서비스 소개 */}
      <section className="grid md:grid-cols-3 gap-6 py-4">
        {[
          {
            icon: "library_books",
            title: "방대한 소장 도서",
            desc: "IT·개발·인문 등 다양한 분야의 도서를 수천 권 이상 보유하고 있습니다.",
          },
          {
            icon: "schedule",
            title: "간편한 대출",
            desc: "온라인으로 간편하게 대출 신청하고 유연한 반납 일정을 관리하세요.",
          },
          {
            icon: "shopping_cart",
            title: "구매 서비스",
            desc: "마음에 드는 도서를 합리적인 가격으로 바로 구매할 수 있습니다.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="text-center p-6 bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-5xl text-[#2f9e5f] mb-4">{feature.icon}</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>

    </div>
  );
};

// 도서 그리드 서브 컴포넌트
const BookGrid = ({ books, loading }: { books: Book[]; loading: boolean }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] w-full rounded-lg bg-gray-200 dark:bg-gray-700 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-gray-600">
        <span className="material-symbols-outlined text-5xl">menu_book</span>
        <p className="mt-2 text-sm">도서 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {books.map((book) => (
        <Link key={book.id} to={`/client/books/${book.id}`} className="group flex flex-col gap-2">
          <div className="w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 transition-shadow duration-300 group-hover:shadow-xl">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`aspect-[3/4] w-full bg-gradient-to-br from-[#2f9e5f]/20 to-[#2f9e5f]/5 flex items-center justify-center ${book.coverImageUrl ? 'hidden' : ''}`}>
              <span className="material-symbols-outlined text-6xl text-[#2f9e5f]/40">book</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2">{book.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{book.author}</p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm font-bold text-[#2f9e5f]">{book.price.toLocaleString()}원</p>
              <span className={`text-xs ${book.available ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {book.available ? '재고 있음' : '재고 없음'}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Home;
