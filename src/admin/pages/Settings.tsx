import { useState } from "react";
import Input from "../../shared/components/common/Input";
import Button from "../../shared/components/common/Button";
import Select from "../../shared/components/common/Select";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

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
                    ? "border-[#1173d4] text-[#1173d4]"
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
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1173d4] to-[#0d5aa7] flex items-center justify-center">
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
                          className="w-4 h-4 text-[#1173d4] bg-gray-100 border-gray-300 rounded focus:ring-[#1173d4] dark:bg-gray-700 dark:border-gray-600"
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
                          className="w-4 h-4 mt-1 text-[#1173d4] bg-gray-100 border-gray-300 rounded focus:ring-[#1173d4] dark:bg-gray-700 dark:border-gray-600"
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
                          className="w-4 h-4 mt-1 text-[#1173d4] bg-gray-100 border-gray-300 rounded focus:ring-[#1173d4] dark:bg-gray-700 dark:border-gray-600"
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
                          className="w-4 h-4 mt-1 text-[#1173d4] bg-gray-100 border-gray-300 rounded focus:ring-[#1173d4] dark:bg-gray-700 dark:border-gray-600"
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
                          className="w-4 h-4 mt-1 text-[#1173d4] bg-gray-100 border-gray-300 rounded focus:ring-[#1173d4] dark:bg-gray-700 dark:border-gray-600"
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
                          className="w-4 h-4 mt-1 text-[#1173d4] bg-gray-100 border-gray-300 rounded focus:ring-[#1173d4] dark:bg-gray-700 dark:border-gray-600"
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
                          className="w-4 h-4 mt-1 text-[#1173d4] bg-gray-100 border-gray-300 rounded focus:ring-[#1173d4] dark:bg-gray-700 dark:border-gray-600"
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
                          className="w-4 h-4 mt-1 text-[#1173d4] bg-gray-100 border-gray-300 rounded focus:ring-[#1173d4] dark:bg-gray-700 dark:border-gray-600"
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
                      <div className="border-2 border-[#1173d4] rounded-lg p-4 bg-white">
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
        </div>
      </div>
    </div>
  );
};

export default Settings;
