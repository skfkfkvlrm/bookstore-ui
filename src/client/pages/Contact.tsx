import { useState } from "react";

const supportChannels = [
  { label: "대표 전화", value: "02-123-4567", icon: "call" },
  { label: "이메일", value: "hello@springlibrary.kr", icon: "alternate_email" },
  { label: "운영 시간", value: "평일 09:00~20:00 / 주말 10:00~18:00", icon: "schedule" },
  { label: "오프라인 라운지", value: "서울시 강남구 도산대로 123, 5층", icon: "location_on" },
];

const faqItems = [
  {
    question: "대출 연장은 어떻게 신청하나요?",
    answer: "내 대출 페이지에서 연장 가능한 도서에 대해 최대 1회, 7일 단위로 연장할 수 있습니다.",
  },
  {
    question: "기업/기관 단위 협업도 가능한가요?",
    answer: "맞춤형 서가 구축, API 연동, 큐레이터 파견 등 B2B 프로그램을 운영 중입니다. 문의 양식으로 연락 주세요.",
  },
  {
    question: "오프라인 공간 예약이 필요한가요?",
    answer: "스터디룸과 이벤트홀은 예약이 필요하며, 로그인 후 마이페이지에서 원하는 시간대를 선택할 수 있습니다.",
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "제휴/협업 문의",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", topic: "제휴/협업 문의", message: "" });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#1a2332]">
        <p className="text-sm text-[#1173d4]">Contact</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">궁금한 내용을 알려주세요</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          프로그램 제안, 자료 기증, 파트너십, 서비스 문의 등 모든 질문을 환영합니다. 1영업일 이내 회신을 드립니다.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {supportChannels.map((channel) => (
            <div key={channel.label} className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
              <span className="material-symbols-outlined text-3xl text-[#1173d4]">{channel.icon}</span>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{channel.label}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{channel.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#1a2332]"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">문의 양식</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">아래 내용을 작성하면 담당자가 빠르게 답변드립니다.</p>
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="contact-name" className="text-sm text-gray-600 dark:text-gray-400">이름</label>
              <input
                type="text"
                id="contact-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#1173d4] dark:border-gray-600 dark:bg-[#101922] dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="text-sm text-gray-600 dark:text-gray-400">이메일</label>
              <input
                type="email"
                id="contact-email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#1173d4] dark:border-gray-600 dark:bg-[#101922] dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="contact-topic" className="text-sm text-gray-600 dark:text-gray-400">문의 유형</label>
              <select
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                id="contact-topic"
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#1173d4] dark:border-gray-600 dark:bg-[#101922] dark:text-white"
              >
                <option>제휴/협업 문의</option>
                <option>프로그램 제안</option>
                <option>서비스 이용 문의</option>
                <option>기타</option>
              </select>
            </div>
            <div>
              <label htmlFor="contact-message" className="text-sm text-gray-600 dark:text-gray-400">문의 내용</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={5}
                id="contact-message"
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#1173d4] dark:border-gray-600 dark:bg-[#101922] dark:text-white"
                placeholder="필요한 지원이나 궁금한 점을 자세히 남겨 주세요"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-[#1173d4] py-3 text-sm font-semibold text-white shadow hover:bg-[#1173d4]/90"
          >
            문의 전송
          </button>
          {submitted && (
            <p className="mt-4 rounded-xl bg-green-50 p-4 text-center text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
              접수되었습니다! 담당자가 확인 후 연락드릴게요.
            </p>
          )}
        </form>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#1a2332]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">자주 묻는 질문</h2>
          <div className="mt-6 space-y-5">
            {faqItems.map((item) => (
              <div key={item.question}>
                <p className="font-semibold text-gray-900 dark:text-white">{item.question}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.answer}</p>
                <div className="mt-3 h-px bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <p>긴급 장애나 신고가 필요한 경우, 위의 대표 전화 혹은 Slack #spring-library 채널(파트너 전용)로 연락 주세요.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
