const sections = [
  {
    title: "1. 수집하는 정보",
    body: [
      "회원 가입 시 필수로 이름, 이메일, 회원 유형을 받으며 선택 항목으로 연락처와 관심 장르를 받을 수 있습니다.",
      "도서 대출, 장바구니, 결제 서비스 이용 시 거래 기록과 기기 정보, 접속 로그가 수집될 수 있습니다.",
      "오프라인 프로그램 참여 등록 시 현장 출입 및 안전을 위해 생년월일과 긴급 연락처를 요청할 수 있습니다.",
    ],
  },
  {
    title: "2. 정보 이용 목적",
    body: [
      "회원 식별, 대출/반납 관리, 결제 처리, 선호 기반 추천 등 필수 운영 목적에 사용합니다.",
      "프로그램 안내, 서비스 개선 설문 등 마케팅 목적 활용 시 사전 동의를 구하며, 거부 시 불이익이 없습니다.",
      "비식별 통계 데이터를 생성해 도서 큐레이션 품질과 자료 확보 전략을 고도화합니다.",
    ],
  },
  {
    title: "3. 보관 및 파기",
    body: [
      "관련 법령이 정한 기간(전자상거래법, 통신비밀보호법 등) 동안 데이터를 보관하며, 기간 종료 후 즉시 안전하게 파기합니다.",
      "장비 폐기 또는 시스템 이전 시 개인정보가 복원되지 않도록 암호화·삭제 절차를 준수합니다.",
    ],
  },
  {
    title: "4. 제3자 제공 및 위탁",
    body: [
      "배송, 결제, 고객 지원 등 불가피하게 외부 업체에 처리를 위탁하는 경우 최소한의 정보만 제공합니다.",
      "협력사는 정보 보호 책임 조항이 포함된 계약을 체결하며, 정기적인 보안 점검을 수행합니다.",
    ],
  },
  {
    title: "5. 이용자 권리",
    body: [
      "언제든지 정보 조회·수정·삭제 및 처리 정지를 요청할 수 있으며, 고객센터를 통해 신속히 처리합니다.",
      "만 14세 미만 아동은 보호자 동의가 필요하며, 법정 대리인은 아동 정보 열람·정정·삭제를 요구할 수 있습니다.",
    ],
  },
];

const Privacy = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#1a2332]">
        <p className="text-sm text-[#2f9e5f]">Privacy Policy</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">개인정보 처리방침</h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          스프링 도서관은 이용자의 개인정보를 소중히 여기며, 안전하게 보호하기 위해 아래와 같은 기준을 따릅니다.
        </p>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">최종 업데이트: 2025년 1월 5일</p>
      </section>

      {sections.map((section) => (
        <section
          key={section.title}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#1a2332]"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{section.title}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-400">
            {section.body.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <section className="rounded-2xl border border-[#2f9e5f]/30 bg-[#2f9e5f]/5 p-6 text-sm text-gray-700 dark:border-[#2f9e5f]/40 dark:bg-[#2f9e5f]/10 dark:text-gray-100">
        <h3 className="font-semibold text-[#1f7d57] dark:text-white">문의 및 신고</h3>
        <p className="mt-2">
          개인정보 보호 책임자: 김봄 책임사서 (privacy@springlibrary.kr, 02-123-4567 내선 2)
        </p>
        <p className="mt-1">침해 사고가 의심되면 즉시 신고해 주세요. 24시간 내에 초기 조치를 완료합니다.</p>
      </section>
    </div>
  );
};

export default Privacy;
