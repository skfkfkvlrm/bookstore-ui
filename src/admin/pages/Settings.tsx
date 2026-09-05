import { useState, useRef } from "react";
import Input from "../../shared/components/common/Input";
import Button from "../../shared/components/common/Button";
import Select from "../../shared/components/common/Select";
import { getToken } from "../../client/utils/authStorage";
import booksData from "../../shared/data/books.json";
import migratedBooksData from "../../shared/data/migratedBooks.json";

// 한국어 개발/IT 대표 도서
const KOREAN_BOOKS = [
  {
    title: "자바 ORM 표준 JPA 프로그래밍",
    author: "김영한",
    isbn: "978-8960777330",
    price: 43000,
    available: true,
    coverImageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
  },
  {
    title: "스프링 부트 실전 활용 가이드",
    author: "이동욱",
    isbn: "978-8965402602",
    price: 32000,
    available: true,
    coverImageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765",
  },
  {
    title: "클린 코드 (Clean Code)",
    author: "로버트 C. 마틴",
    isbn: "978-8966260959",
    price: 33000,
    available: true,
    coverImageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
  },
  {
    title: "가상 면접 사례로 배우는 대규모 시스템 설계 기초",
    author: "알렉스 슈",
    isbn: "979-1169210027",
    price: 38000,
    available: true,
    coverImageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
  },
  {
    title: "도메인 주도 설계 철저 입문",
    author: "나루세 마사노부",
    isbn: "979-1162243404",
    price: 28000,
    available: true,
    coverImageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
  },
  {
    title: "HTTP 완벽 가이드",
    author: "데이빗 구를리",
    isbn: "978-8966261208",
    price: 45000,
    available: true,
    coverImageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d",
  },
  {
    title: "모던 자바스크립트 Deep Dive",
    author: "이웅모",
    isbn: "979-1158392239",
    price: 45000,
    available: true,
    coverImageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73",
  },
  {
    title: "리팩터링 2판",
    author: "마틴 파울러",
    isbn: "979-1162242742",
    price: 35000,
    available: true,
    coverImageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e",
  },
  {
    title: "오브젝트 (코드로 이해하는 객체지향 설계)",
    author: "조영호",
    isbn: "979-1158391409",
    price: 38000,
    available: true,
    coverImageUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6",
  },
  {
    title: "대용량 데이터 처리를 위한 자바 프로그래밍",
    author: "백기선",
    isbn: "978-8960779999",
    price: 30000,
    available: true,
    coverImageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
  },
];

interface SeedBookItem {
  title: string;
  author: string;
  isbn: string;
  price: number;
  available: boolean;
  coverImageUrl: string;
}

// 1. 초기 추천 도서 (60권: 한국어 10권 + 글로벌 베스트셀러 50권)
const RECOMMENDED_60_BOOKS: SeedBookItem[] = [
  ...KOREAN_BOOKS,
  ...(booksData as any[]).map((b) => ({
    title: b.title,
    author: b.author,
    isbn: b.isbn ? b.isbn.replace(/\s+/g, "") : "",
    price: b.price ? (b.price < 100 ? Math.round(b.price * 1000) : b.price) : 20000,
    available: b.available !== false,
    coverImageUrl: b.coverImage || b.coverImageUrl || "",
  })),
];

// 2. 이관 도서 데이터 (1,010권: DB에서 정합성 검증 완료된 도서 전체)
const MIGRATED_1010_BOOKS: SeedBookItem[] = (migratedBooksData as any[]).map((b) => ({
  title: b.title,
  author: b.author,
  isbn: b.isbn ? b.isbn.replace(/\s+/g, "") : "",
  price: b.price || 20000,
  available: b.available !== false,
  coverImageUrl: b.coverImageUrl || "",
}));

// 3. 통합 전체 도서 (중복 제거된 1,060권)
const buildCombinedBooks = (): SeedBookItem[] => {
  const map = new Map<string, SeedBookItem>();
  for (const b of MIGRATED_1010_BOOKS) {
    if (b.isbn) map.set(b.isbn, b);
  }
  for (const b of RECOMMENDED_60_BOOKS) {
    if (b.isbn && !map.has(b.isbn)) map.set(b.isbn, b);
  }
  return Array.from(map.values());
};

const COMBINED_ALL_BOOKS: SeedBookItem[] = buildCombinedBooks();

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  // 도서 시드 상태
  const [datasetType, setDatasetType] = useState<"migrated" | "combined" | "recommended">("migrated");
  const [seedTarget, setSeedTarget] = useState("1010");
  const [seedRunning, setSeedRunning] = useState(false);
  const [seedProgress, setSeedProgress] = useState<{ current: number; total: number } | null>(null);
  const [seedLogs, setSeedLogs] = useState<string[]>([]);
  const [seedResult, setSeedResult] = useState<{ success: number; duplicate: number; fail: number } | null>(null);
  const abortRef = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const getActiveDataset = (): SeedBookItem[] => {
    switch (datasetType) {
      case "migrated":
        return MIGRATED_1010_BOOKS;
      case "combined":
        return COMBINED_ALL_BOOKS;
      case "recommended":
        return RECOMMENDED_60_BOOKS;
      default:
        return MIGRATED_1010_BOOKS;
    }
  };

  const handleDatasetChange = (type: "migrated" | "combined" | "recommended") => {
    setDatasetType(type);
    if (type === "migrated") {
      setSeedTarget("1010");
    } else if (type === "combined") {
      setSeedTarget(String(COMBINED_ALL_BOOKS.length));
    } else {
      setSeedTarget("60");
    }
  };

  const addLog = (msg: string) => {
    setSeedLogs((prev) => {
      const next = prev.length > 250 ? [...prev.slice(prev.length - 150), msg] : [...prev, msg];
      setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      return next;
    });
  };

  const handleStartSeed = async () => {
    const activeBooks = getActiveDataset();
    const target = parseInt(seedTarget, 10);
    if (!target || target <= 0) return;

    abortRef.current = false;
    setSeedRunning(true);
    setSeedLogs([]);
    setSeedResult(null);

    const booksToRegister = activeBooks.slice(0, Math.min(target, activeBooks.length));
    setSeedProgress({ current: 0, total: booksToRegister.length });
    const datasetName = datasetType === 'migrated' ? '이관 도서 1,010권' : datasetType === 'combined' ? '통합 도서 1,060권' : '추천 도서 60권';
    addLog(`🚀 도서 데이터 시드 시작 (요청: ${target}권 / 가용: ${booksToRegister.length}권 / 선택: ${datasetName})`);

    const token = getToken();
    let success = 0, duplicate = 0, fail = 0;

    for (let i = 0; i < booksToRegister.length; i++) {
      if (abortRef.current) {
        addLog("⛔ 사용자에 의해 작업이 중단되었습니다.");
        break;
      }

      const book = booksToRegister[i];
      setSeedProgress({ current: i + 1, total: booksToRegister.length });

      try {
        const res = await fetch('/api/books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(book),
        });

        if (res.ok) {
          success++;
          addLog(`  ✔ [${i + 1}/${booksToRegister.length}] 등록: "${book.title}" (${book.author})`);
        } else {
          const resData = await res.json().catch(() => null);
          if (res.status === 400 || res.status === 409 || resData?.code === 'DUPLICATE_ISBN') {
            duplicate++;
            addLog(`  ↷ [${i + 1}/${booksToRegister.length}] 중복 스킵: "${book.title}"`);
          } else {
            fail++;
            addLog(`  ✘ [${i + 1}/${booksToRegister.length}] 실패: "${book.title}" (HTTP ${res.status})`);
          }
        }
      } catch (err) {
        fail++;
        addLog(`  ✘ [${i + 1}/${booksToRegister.length}] 통신 오류: ${(err as Error).message}`);
      }

      await new Promise((r) => setTimeout(r, 15));
    }

    setSeedResult({ success, duplicate, fail });
    setSeedProgress(null);
    addLog(`\n✅ 완료 — 신규 등록 ${success}권 / 중복 스킵 ${duplicate}권 / 실패 ${fail}권`);
    setSeedRunning(false);
  };

  // Profile Settings State
  const [profileData, setProfileData] = useState({
    name: "관리자",
    email: "admin@library.com",
    phone: "010-1234-5678",
    department: "도서관리부",
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    loanPeriod: "14",
    maxLoanBooks: "5",
    overdueFinePerDay: "1000",
    autoEmailReminder: true,
    reminderDaysBefore: "3",
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNewMember: true,
    emailNewOrder: true,
    emailOverdueLoan: true,
    emailLowStock: true,
    pushNewMember: false,
    pushNewOrder: true,
    pushOverdueLoan: true,
  });

  // Appearance Settings State
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "system",
    language: "ko",
    dateFormat: "YYYY-MM-DD",
    timezone: "Asia/Seoul",
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Save profile:", profileData);
    alert("프로필이 저장되었습니다.");
  };

  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Save system settings:", systemSettings);
    alert("시스템 설정이 저장되었습니다.");
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Save notifications:", notificationSettings);
    alert("알림 설정이 저장되었습니다.");
  };

  const handleSaveAppearance = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Save appearance:", appearanceSettings);
    alert("테마 설정이 저장되었습니다.");
  };

  const tabs = [
    { id: "profile", label: "프로필", icon: "person" },
    { id: "system", label: "시스템 설정", icon: "settings" },
    { id: "notifications", label: "알림 설정", icon: "notifications" },
    { id: "appearance", label: "테마 설정", icon: "palette" },
    { id: "data", label: "데이터 관리", icon: "database" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">설정</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          시스템 및 개인 설정을 관리합니다.
        </p>
      </div>

      {/* Top Tabs */}
      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#2f9e5f] text-[#2f9e5f]"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div>
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    프로필 설정
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    개인 정보를 관리합니다.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2f9e5f] to-[#1f7d57] flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-5xl">
                        person
                      </span>
                    </div>
                    <div>
                      <Button variant="secondary" size="sm">
                        <span className="material-symbols-outlined">upload</span>
                        프로필 사진 변경
                      </Button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        JPG, PNG 형식, 최대 2MB
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="이름"
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="이메일"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="전화번호"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                    />
                    <Input
                      label="부서"
                      type="text"
                      value={profileData.department}
                      onChange={(e) =>
                        setProfileData({ ...profileData, department: e.target.value })
                      }
                    />
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      비밀번호 변경
                    </h3>
                    <div className="space-y-4">
                      <Input label="현재 비밀번호" type="password" />
                      <Input label="새 비밀번호" type="password" />
                      <Input label="새 비밀번호 확인" type="password" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" type="button">
                      취소
                    </Button>
                    <Button type="submit">
                      <span className="material-symbols-outlined">save</span>
                      저장
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* System Settings */}
            {activeTab === "system" && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    시스템 설정
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    도서관 시스템 운영 규칙을 설정합니다.
                  </p>
                </div>

                <form onSubmit={handleSaveSystemSettings} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      대여 설정
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          대여 기간 (일)
                        </label>
                        <Select
                          value={systemSettings.loanPeriod}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              loanPeriod: e.target.value,
                            })
                          }
                          options={[
                            { value: "7", label: "7일" },
                            { value: "14", label: "14일" },
                            { value: "21", label: "21일" },
                            { value: "30", label: "30일" },
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          최대 대여 권수
                        </label>
                        <Select
                          value={systemSettings.maxLoanBooks}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              maxLoanBooks: e.target.value,
                            })
                          }
                          options={[
                            { value: "3", label: "3권" },
                            { value: "5", label: "5권" },
                            { value: "10", label: "10권" },
                          ]}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      연체 설정
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="연체료 (원/일)"
                        type="number"
                        value={systemSettings.overdueFinePerDay}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            overdueFinePerDay: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      자동 알림 설정
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.autoEmailReminder}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              autoEmailReminder: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-[#2f9e5f] bg-gray-100 border-gray-300 rounded focus:ring-[#2f9e5f] dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          반납일 이전 자동 알림 발송
                        </span>
                      </label>
                      {systemSettings.autoEmailReminder && (
                        <div className="ml-7">
                          <Select
                            value={systemSettings.reminderDaysBefore}
                            onChange={(e) =>
                              setSystemSettings({
                                ...systemSettings,
                                reminderDaysBefore: e.target.value,
                              })
                            }
                            options={[
                              { value: "1", label: "1일 전" },
                              { value: "3", label: "3일 전" },
                              { value: "7", label: "7일 전" },
                            ]}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" type="button">
                      초기화
                    </Button>
                    <Button type="submit">
                      <span className="material-symbols-outlined">save</span>
                      저장
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    알림 설정
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    받을 알림 유형을 설정합니다.
                  </p>
                </div>

                <form onSubmit={handleSaveNotifications} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      이메일 알림
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNewMember}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNewMember: e.target.checked,
                            })
                          }
                          className="w-4 h-4 mt-1 text-[#2f9e5f] bg-gray-100 border-gray-300 rounded focus:ring-[#2f9e5f] dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            신규 회원 가입
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            새로운 회원이 가입하면 알림을 받습니다.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNewOrder}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNewOrder: e.target.checked,
                            })
                          }
                          className="w-4 h-4 mt-1 text-[#2f9e5f] bg-gray-100 border-gray-300 rounded focus:ring-[#2f9e5f] dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            신규 주문
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            새로운 주문이 접수되면 알림을 받습니다.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailOverdueLoan}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailOverdueLoan: e.target.checked,
                            })
                          }
                          className="w-4 h-4 mt-1 text-[#2f9e5f] bg-gray-100 border-gray-300 rounded focus:ring-[#2f9e5f] dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            연체 대여
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            대여 도서 연체 발생 시 알림을 받습니다.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailLowStock}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailLowStock: e.target.checked,
                            })
                          }
                          className="w-4 h-4 mt-1 text-[#2f9e5f] bg-gray-100 border-gray-300 rounded focus:ring-[#2f9e5f] dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            재고 부족
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            도서 재고가 부족할 때 알림을 받습니다.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      푸시 알림
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.pushNewMember}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              pushNewMember: e.target.checked,
                            })
                          }
                          className="w-4 h-4 mt-1 text-[#2f9e5f] bg-gray-100 border-gray-300 rounded focus:ring-[#2f9e5f] dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            신규 회원 가입
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            브라우저 푸시 알림으로 받습니다.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.pushNewOrder}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              pushNewOrder: e.target.checked,
                            })
                          }
                          className="w-4 h-4 mt-1 text-[#2f9e5f] bg-gray-100 border-gray-300 rounded focus:ring-[#2f9e5f] dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            신규 주문
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            브라우저 푸시 알림으로 받습니다.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.pushOverdueLoan}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              pushOverdueLoan: e.target.checked,
                            })
                          }
                          className="w-4 h-4 mt-1 text-[#2f9e5f] bg-gray-100 border-gray-300 rounded focus:ring-[#2f9e5f] dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            연체 대여
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            브라우저 푸시 알림으로 받습니다.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" type="button">
                      모두 해제
                    </Button>
                    <Button type="submit">
                      <span className="material-symbols-outlined">save</span>
                      저장
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    테마 설정
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    화면 표시 및 언어를 설정합니다.
                  </p>
                </div>

                <form onSubmit={handleSaveAppearance} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        테마
                      </label>
                      <Select
                        value={appearanceSettings.theme}
                        onChange={(e) =>
                          setAppearanceSettings({
                            ...appearanceSettings,
                            theme: e.target.value,
                          })
                        }
                        options={[
                          { value: "light", label: "라이트 모드" },
                          { value: "dark", label: "다크 모드" },
                          { value: "system", label: "시스템 설정 따르기" },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        언어
                      </label>
                      <Select
                        value={appearanceSettings.language}
                        onChange={(e) =>
                          setAppearanceSettings({
                            ...appearanceSettings,
                            language: e.target.value,
                          })
                        }
                        options={[
                          { value: "ko", label: "한국어" },
                          { value: "en", label: "English" },
                          { value: "ja", label: "日本語" },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        날짜 형식
                      </label>
                      <Select
                        value={appearanceSettings.dateFormat}
                        onChange={(e) =>
                          setAppearanceSettings({
                            ...appearanceSettings,
                            dateFormat: e.target.value,
                          })
                        }
                        options={[
                          { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                          { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                          { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        시간대
                      </label>
                      <Select
                        value={appearanceSettings.timezone}
                        onChange={(e) =>
                          setAppearanceSettings({
                            ...appearanceSettings,
                            timezone: e.target.value,
                          })
                        }
                        options={[
                          { value: "Asia/Seoul", label: "서울 (GMT+9)" },
                          { value: "America/New_York", label: "뉴욕 (GMT-5)" },
                          { value: "Europe/London", label: "런던 (GMT+0)" },
                          { value: "Asia/Tokyo", label: "도쿄 (GMT+9)" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      미리보기
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border-2 border-[#2f9e5f] rounded-lg p-4 bg-white">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <p className="text-xs text-center mt-3 font-medium text-gray-700">
                          라이트 모드
                        </p>
                      </div>

                      <div className="border-2 border-gray-600 rounded-lg p-4 bg-[#1a2632]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-700 rounded"></div>
                          <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                        </div>
                        <p className="text-xs text-center mt-3 font-medium text-gray-300">
                          다크 모드
                        </p>
                      </div>

                      <div className="border-2 border-gray-400 rounded-lg p-4 bg-gradient-to-br from-white to-[#1a2632]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-400 rounded"></div>
                          <div className="h-3 bg-gray-400 rounded w-3/4"></div>
                        </div>
                        <p className="text-xs text-center mt-3 font-medium text-gray-600">
                          시스템 설정
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" type="button">
                      초기화
                    </Button>
                    <Button type="submit">
                      <span className="material-symbols-outlined">save</span>
                      저장
                    </Button>
                  </div>
                </form>
              </div>
            )}
            {/* Data Management */}
            {activeTab === "data" && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">데이터 관리</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    이관 완료된 대량 도서 데이터(1,010권) 및 추천 도서를 이용해 백엔드에 도서 데이터를 원클릭 자동 등록합니다.
                  </p>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl text-[#2f9e5f]">library_books</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">도서 대량 데이터 등록 (Seeding)</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        데이터베이스에 보존된 1,010권의 전문 도서 및 글로벌 도서를 백엔드에 자동 등록합니다. 이미 등록된 ISBN은 안전하게 스킵됩니다.
                      </p>
                    </div>
                  </div>

                  {/* 데이터셋 선택 영역 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      등록 대상 데이터셋 선택
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div
                        onClick={() => !seedRunning && handleDatasetChange("migrated")}
                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                          datasetType === "migrated"
                            ? "border-[#2f9e5f] bg-[#2f9e5f]/10 dark:bg-[#2f9e5f]/20 text-[#2f9e5f]"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#101922] text-gray-700 dark:text-gray-300"
                        } ${seedRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">📚 이관 도서 (1,010권)</span>
                          {datasetType === "migrated" && (
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PostgreSQL에서 완벽 이관된 한국어 IT/프로그래밍/자료구조 전문 도서
                        </p>
                      </div>

                      <div
                        onClick={() => !seedRunning && handleDatasetChange("combined")}
                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                          datasetType === "combined"
                            ? "border-[#2f9e5f] bg-[#2f9e5f]/10 dark:bg-[#2f9e5f]/20 text-[#2f9e5f]"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#101922] text-gray-700 dark:text-gray-300"
                        } ${seedRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">🌐 통합 전체 도서 (1,060권)</span>
                          {datasetType === "combined" && (
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          이관 도서 1,010권 + 글로벌 베스트셀러 50권 통합 패키지
                        </p>
                      </div>

                      <div
                        onClick={() => !seedRunning && handleDatasetChange("recommended")}
                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                          datasetType === "recommended"
                            ? "border-[#2f9e5f] bg-[#2f9e5f]/10 dark:bg-[#2f9e5f]/20 text-[#2f9e5f]"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#101922] text-gray-700 dark:text-gray-300"
                        } ${seedRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">⭐ 초기 추천 도서 (60권)</span>
                          {datasetType === "recommended" && (
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          한국어 핵심 개발서 10권 + 글로벌 50권 경량 데이터셋
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 등록 수량 입력 및 프리셋 버튼 */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="w-48">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          등록 권수 (최대 {getActiveDataset().length}권)
                        </label>
                        <input
                          type="number"
                          value={seedTarget}
                          onChange={(e) => setSeedTarget(e.target.value)}
                          min="1"
                          max={getActiveDataset().length}
                          disabled={seedRunning}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f9e5f] disabled:opacity-50 font-bold"
                        />
                      </div>

                      {/* 빠른 수량 프리셋 */}
                      <div className="flex items-center gap-2 pb-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">빠른 설정:</span>
                        <button
                          type="button"
                          onClick={() => !seedRunning && setSeedTarget("60")}
                          disabled={seedRunning}
                          className="px-2.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                        >
                          60권
                        </button>
                        <button
                          type="button"
                          onClick={() => !seedRunning && setSeedTarget("100")}
                          disabled={seedRunning}
                          className="px-2.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                        >
                          100권
                        </button>
                        <button
                          type="button"
                          onClick={() => !seedRunning && setSeedTarget("500")}
                          disabled={seedRunning}
                          className="px-2.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                        >
                          500권
                        </button>
                        <button
                          type="button"
                          onClick={() => !seedRunning && setSeedTarget(String(getActiveDataset().length))}
                          disabled={seedRunning}
                          className="px-2.5 py-1 text-xs font-semibold rounded border border-[#2f9e5f] text-[#2f9e5f] bg-[#2f9e5f]/10 hover:bg-[#2f9e5f]/20 disabled:opacity-50"
                        >
                          전체 ({getActiveDataset().length}권)
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleStartSeed}
                          disabled={seedRunning}
                        >
                          {seedRunning ? (
                            <>
                              <span className="material-symbols-outlined animate-spin">progress_activity</span>
                              등록 진행 중...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined">download</span>
                              도서 데이터 등록 시작
                            </>
                          )}
                        </Button>
                        {seedRunning && (
                          <Button variant="danger" onClick={() => { abortRef.current = true; }}>
                            <span className="material-symbols-outlined">stop</span>
                            중단
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 실시간 진행 바 */}
                  {seedProgress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <span>진행률 ({seedProgress.current} / {seedProgress.total} 권)</span>
                        <span>{Math.round((seedProgress.current / seedProgress.total) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-[#2f9e5f] h-3 rounded-full transition-all duration-150"
                          style={{ width: `${Math.round((seedProgress.current / seedProgress.total) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ※ 등록된 도서는 백엔드 데이터베이스에 영구 저장되며 즉시 도서 목록 및 대여/구매 화면에 반영됩니다.
                  </p>

                  {/* 진행 로그 */}
                  {seedLogs.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">진행 로그</p>
                      <div className="bg-gray-900 rounded-lg p-4 h-56 overflow-y-auto font-mono text-xs text-green-400 space-y-0.5">
                        {seedLogs.map((log, i) => (
                          <p key={i} className="whitespace-pre-wrap">{log}</p>
                        ))}
                        <div ref={logEndRef} />
                      </div>
                    </div>
                  )}

                  {/* 완료 결과 */}
                  {seedResult && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{seedResult.success}</p>
                        <p className="text-sm text-green-700 dark:text-green-300">등록 성공</p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{seedResult.duplicate}</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">중복 스킵</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{seedResult.fail}</p>
                        <p className="text-sm text-red-700 dark:text-red-300">실패</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
