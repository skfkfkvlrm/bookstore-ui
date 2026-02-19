import { useState, useRef } from "react";
import Input from "../../shared/components/common/Input";
import Button from "../../shared/components/common/Button";
import Select from "../../shared/components/common/Select";
import { getToken } from "../../client/utils/authStorage";

// 네이버 도서 검색 키워드
const SEED_KEYWORDS = [
  '프로그래밍', '알고리즘', '자바', '파이썬', '리액트',
  '스프링', '데이터베이스', '인공지능', '클라우드', '네트워크',
  '운영체제', '보안', '자바스크립트', '타입스크립트', '도커',
  '머신러닝', '딥러닝', '소프트웨어공학', '컴퓨터과학', '데이터분석',
];

function stripHtml(str = '') {
  return str.replace(/<[^>]*>/g, '').trim();
}

interface NaverBookItem {
  title: string;
  author: string;
  isbn: string;
  discount: string;
  price: string;
  image: string;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  // 도서 시드 상태
  const [seedTarget, setSeedTarget] = useState("1000");
  const [seedRunning, setSeedRunning] = useState(false);
  const [seedLogs, setSeedLogs] = useState<string[]>([]);
  const [seedResult, setSeedResult] = useState<{ success: number; duplicate: number; fail: number } | null>(null);
  const abortRef = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setSeedLogs((prev) => {
      const next = [...prev, msg];
      setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      return next;
    });
  };

  const handleStartSeed = async () => {
    const target = parseInt(seedTarget, 10);
    if (!target || target <= 0) return;

    abortRef.current = false;
    setSeedRunning(true);
    setSeedLogs([]);
    setSeedResult(null);

    addLog(`🚀 도서 시드 시작 (목표: ${target}권)`);

    const token = getToken();
    const bookMap = new Map<string, object>();

    // 1. 네이버 API 수집
    for (const keyword of SEED_KEYWORDS) {
      if (abortRef.current || bookMap.size >= target) break;

      try {
        for (const start of [1, 101]) {
          if (abortRef.current || bookMap.size >= target) break;

          const res = await fetch(
            `/naver-api/v1/search/book.json?query=${encodeURIComponent(keyword)}&display=100&start=${start}`
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const items: NaverBookItem[] = data.items || [];

          for (const item of items) {
            if (bookMap.size >= target) break;
            const isbn = item.isbn?.split(' ').find((s: string) => s.length === 13)
              || item.isbn?.split(' ').find((s: string) => s.length >= 10) || '';
            if (!isbn || bookMap.has(isbn)) continue;
            const price = parseInt(item.discount || item.price || '0', 10);
            if (!price) continue;
            const title = stripHtml(item.title);
            const author = stripHtml(item.author);
            if (!title || !author) continue;
            bookMap.set(isbn, { title, author, isbn, price, available: true, coverImageUrl: item.image || '' });
          }

          await new Promise((r) => setTimeout(r, 150));
        }
        addLog(`  ✔ "${keyword}" → 누적 ${bookMap.size}권`);
      } catch (e) {
        addLog(`  ✘ "${keyword}" 실패: ${(e as Error).message}`);
      }
    }

    addLog(`\n📦 수집 완료 ${bookMap.size}권 → 백엔드 등록 시작`);

    // 2. 백엔드 등록
    let success = 0, duplicate = 0, fail = 0;
    const books = [...bookMap.values()];

    for (const book of books) {
      if (abortRef.current) break;

      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(book),
      });

      if (res.ok) success++;
      else if (res.status === 409) duplicate++;
      else fail++;

      const done = success + duplicate + fail;
      if (done % 100 === 0) addLog(`  📖 진행: 등록 ${success} / 중복 ${duplicate} / 실패 ${fail}`);

      await new Promise((r) => setTimeout(r, 80));
    }

    setSeedResult({ success, duplicate, fail });
    addLog(`\n✅ 완료 — 등록 ${success}권 / 중복 스킵 ${duplicate}권 / 실패 ${fail}권`);
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
                    네이버 도서 API를 이용해 초기 도서 데이터를 등록합니다.
                  </p>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-2xl text-[#2f9e5f]">library_books</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">도서 초기 데이터 등록</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        네이버 책 검색 API로 IT/개발 도서를 검색해 백엔드에 자동 등록합니다. ISBN 중복은 자동 스킵됩니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-40">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        목표 권수
                      </label>
                      <input
                        type="number"
                        value={seedTarget}
                        onChange={(e) => setSeedTarget(e.target.value)}
                        min="1"
                        max="2000"
                        disabled={seedRunning}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#101922] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2f9e5f] disabled:opacity-50"
                      />
                    </div>
                    <div className="flex gap-2 mt-5">
                      <Button
                        onClick={handleStartSeed}
                        disabled={seedRunning}
                      >
                        {seedRunning ? (
                          <>
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            진행 중...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined">download</span>
                            데이터 등록 시작
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
