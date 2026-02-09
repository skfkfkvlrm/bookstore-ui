import { Link } from "react-router-dom";

const missionHighlights = [
  {
    title: "지식 접근성 확대",
    description: "온·오프라인을 아우르는 대출, 구매, 연구 지원 기능을 갖춘 하이브리드 도서관을 지향합니다.",
    icon: "diversity_3",
  },
  {
    title: "데이터 기반 큐레이션",
    description: "이용자의 선호와 대출 이력을 분석해 맞춤형 추천과 큐레이션 컬렉션을 구성합니다.",
    icon: "monitoring",
  },
  {
    title: "커뮤니티 허브",
    description: "저자와의 만남, 독서 모임, 청소년 프로그램 등 지역 커뮤니티의 배움 공간을 제공합니다.",
    icon: "groups",
  },
];

const milestones = [
  { year: "2021", detail: "스프링 도서관 베타 오픈 및 첫 1,000명 회원 확보" },
  { year: "2022", detail: "프리미엄 멤버십, 작가 초청 시리즈 런칭" },
  { year: "2023", detail: "디지털 보존실과 전문 사서 매칭 서비스 도입" },
  { year: "2024", detail: "전자책+실물 연동 대출, 국내 50개 학교/기업 파트너십 체결" },
];

const stats = [
  { label: "추가된 신규 도서", value: "3,200+", caption: "지난 12개월" },
  { label: "월간 방문자", value: "180K", caption: "웹 · 모바일 합산" },
  { label: "커뮤니티 세션", value: "85회", caption: "연간 기준" },
  { label: "API 연동 파트너", value: "24곳", caption: "대학·기업·출판사" },
];

const About = () => {
  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-br from-[#1173d4] to-[#0d5aa7] px-8 py-12 text-white shadow-lg">
        <p className="text-sm uppercase tracking-widest text-white/80">About Spring Library</p>
        <h1 className="mt-4 text-4xl font-bold">지식과 사람을 연결하는 차세대 도서관</h1>
        <p className="mt-4 max-w-3xl text-lg text-white/90">
          스프링 도서관은 이용자 데이터와 큐레이션 역량을 결합해, 필요한 정보를 가장 빠르고 깊이 있게 제공하는
          것을 목표로 합니다. 단순한 자료실이 아닌, 지식 네트워크 플랫폼이 되기 위해 끊임없이 실험합니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/client/books"
            className="inline-flex items-center rounded-xl bg-white/20 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-white/30"
          >
            <span className="material-symbols-outlined mr-2">auto_stories</span>
            도서 둘러보기
          </Link>
          <Link
            to="/client/contact"
            className="inline-flex items-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0d5aa7] shadow hover:shadow-md"
          >
            <span className="material-symbols-outlined mr-2">handshake</span>
            협업 문의하기
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {missionHighlights.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#1a2332]"
          >
            <span className="material-symbols-outlined text-4xl text-[#1173d4]">{item.icon}</span>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{item.title}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#1a2332]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">성장 지표</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          디지털 전환 이후 스프링 도서관이 만든 주요 변화를 수치로 정리했습니다.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-xl bg-gray-50 p-5 text-gray-900 dark:bg-gray-800 dark:text-white">
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
              <p className="mt-2 text-3xl font-bold">{item.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#1a2332]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">연혁 & 향후 계획</h2>
          <div className="mt-6 space-y-5">
            {milestones.map((item) => (
              <div key={item.year} className="flex items-start gap-4">
                <div className="text-sm font-bold text-[#1173d4]">{item.year}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-[#1173d4]/10 p-4 text-sm text-[#0d5aa7] dark:bg-[#1173d4]/20 dark:text-white">
            2025년에는 AI 기반 서가 추천과 지역 대학과의 연구자료 상호 대차 프로그램을 순차적으로 열 계획입니다.
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#1a2332]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">사람과 문화</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            15명의 사서와 8명의 데이터 스페셜리스트, 그리고 30여 명의 커뮤니티 호스트가 함께 도서관을 운영합니다.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#1173d4]">workspace_premium</span>
              전문 사서가 장르별·연구 주제별 상담을 제공합니다.
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#1173d4]">devices</span>
              디지털 히스토리 라운지에서 희귀 자료를 고해상도 스캔본으로 열람할 수 있습니다.
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#1173d4]">local_activity</span>
              매월 북토크, 번역 워크숍, 메이커 세션 등 다채로운 프로그램을 운영합니다.
            </li>
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-sm text-gray-600 dark:border-gray-700 dark:bg-[#1a2332] dark:text-gray-300">
        <p>
          스프링 도서관은 공공기관, 학교, 문화예술 단체와의 협업을 언제나 환영합니다. 새로운 프로그램이나
          기술 파트너십을 제안하고 싶다면 <Link to="/client/contact" className="text-[#1173d4] underline">문의 페이지</Link>로 연락 주세요.
        </p>
      </section>
    </div>
  );
};

export default About;
