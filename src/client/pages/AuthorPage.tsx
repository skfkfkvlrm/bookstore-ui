import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import type { Book } from "../../shared/types";
import booksData from "../../shared/data/books.json";

const authorProfiles: Record<string, { tagline: string; bio: string; themes: string[] }> = {
  "James Clear": {
    tagline: "행동 변화를 과학적으로 해석하는 자기계발 작가",
    bio: "미국 오하이오 출신 작가이자 연설가로, 습관 설계와 성과 개선에 관한 연구를 바탕으로 글로벌 베스트셀러를 집필했습니다.",
    themes: ["습관 형성", "성과 개선", "행동 디자인"],
  },
  "Yuval Noah Harari": {
    tagline: "인류학적 시선을 통해 미래를 읽는 역사학자",
    bio: "히브리대 역사학 교수로, 방대한 사료와 통찰력 있는 비평을 바탕으로 과거·현재·미래를 잇는 서사를 제시합니다.",
    themes: ["인류 역사", "문명", "기술과 윤리"],
  },
  "Delia Owens": {
    tagline: "자연과 인간의 고독을 섬세하게 그려내는 작가",
    bio: "동물학자 출신 소설가로 남부 습지대의 풍경과 성장 서사를 감각적으로 엮어 세계적인 사랑을 받았습니다.",
    themes: ["성장", "자연주의", "미스터리"],
  },
};

const AuthorPage = () => {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name ?? "");

  const authorBooks = useMemo(() => {
    if (!decodedName) return [];
    return (booksData as Book[]).filter(
      (book) => book.author.toLowerCase() === decodedName.toLowerCase()
    );
  }, [decodedName]);

  const profile = authorProfiles[decodedName] ?? {
    tagline: `${decodedName} 작가의 대표작을 만나보세요`,
    bio: `스프링 도서관은 ${decodedName}의 다양한 작품과 인터뷰, 추천 자료를 꾸준히 확장하고 있습니다.`,
    themes: ["대표작", "문학 세계", "추천 자료"],
  };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#1a2332]">
        <p className="text-sm text-[#1173d4]">Featured Author</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{decodedName || "작가 정보"}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{profile.tagline}</p>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{profile.bio}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {profile.themes.map((theme) => (
            <span
              key={theme}
              className="rounded-full bg-[#1173d4]/10 px-4 py-1 text-xs font-medium text-[#0d5aa7] dark:bg-[#1173d4]/20 dark:text-white"
            >
              {theme}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#1a2332]">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">대표 도서</h2>
          <Link to="/client/books" className="text-sm text-[#1173d4] underline">
            다른 도서 살펴보기
          </Link>
        </div>
        {authorBooks.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            아직 등록된 도서가 없습니다. 곧 새로운 자료를 추가할 예정입니다.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {authorBooks.map((book) => (
              <Link
                key={book.id}
                to={`/client/books/${book.id}`}
                className="flex gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-[#1173d4] dark:border-gray-700 dark:bg-[#101922]"
              >
                <div className="h-24 w-24 overflow-hidden rounded-lg bg-gray-200">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={`${book.title} 표지 이미지`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined">book</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm uppercase text-gray-500">{decodedName}</p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{book.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">ISBN {book.isbn}</p>
                  <p className="mt-1 text-sm font-semibold text-[#1173d4]">${book.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-[#1a2332] dark:text-gray-300">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">연구 노트 & 참고 자료</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>저자 인터뷰, 강연 영상, 관련 논문 링크는 큐레이션 팀이 꾸준히 업데이트합니다.</li>
          <li>작가와의 만남, 온라인 북클럽 일정은 events@springlibrary.kr 로 문의해주세요.</li>
          <li>
            새로운 자료를 제안하고 싶다면 <Link to="/client/contact" className="text-[#1173d4] underline">문의 페이지</Link>로 제안서를 보내주세요.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default AuthorPage;
