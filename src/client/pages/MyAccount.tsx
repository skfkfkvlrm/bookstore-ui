import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, updateUser, logout } from "../utils/authStorage";
import { getUserLoans } from "../utils/loanStorage";
import { getUserOrders } from "../utils/orderStorage";
import type { Member } from "../../shared/types";

const MyAccount = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    membershipType: "REGULAR" as "REGULAR" | "PREMIUM",
  });
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    activeLoans: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/client/login");
      return;
    }
    setUser(currentUser);
    setFormData({
      name: currentUser.name,
      membershipType: currentUser.membershipType,
    });

    // Calculate stats
    const loans = getUserLoans();
    const orders = getUserOrders();
    setStats({
      activeLoans: loans.filter(l => l.status === "ACTIVE").length,
      totalOrders: orders.length,
    });
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("이름을 입력하세요.");
      return;
    }

    if (!user) return;

    try {
      const updatedUser = updateUser(user.id, {
        name: formData.name,
        membershipType: formData.membershipType,
      });
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("업데이트에 실패했습니다. 다시 시도하세요.");
      }
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm("로그아웃하시겠습니까?");
    if (confirmed) {
      logout();
      navigate("/client/login");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        membershipType: user.membershipType,
      });
    }
    setIsEditing(false);
    setError("");
  };

  if (!user) {
    return null;
  }

  const membershipBadgeColor = user.membershipType === "PREMIUM"
    ? "bg-[#2f9e5f] text-white"
    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300";

  const statusBadgeColor = user.status === "ACTIVE"
    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
    : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">내 계정</h1>
        <p className="text-gray-600 dark:text-gray-400">
          프로필을 관리하고 계정 정보를 확인하세요
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-[#2f9e5f] text-3xl">
              auto_stories
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeLoans}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">대여 중</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-[#2f9e5f] text-3xl">
              shopping_bag
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalOrders}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">총 주문</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-[#2f9e5f] text-3xl">
              {user.membershipType === "PREMIUM" ? "workspace_premium" : "book"}
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.membershipType === "PREMIUM" ? "5" : "3"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">대여 가능 권수</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            프로필 정보
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#2f9e5f] text-white text-sm font-medium hover:bg-[#2f9e5f]/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm mr-1">edit</span>
              프로필 수정
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이름
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#101922] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                이메일은 변경할 수 없습니다.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                회원 등급
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, membershipType: "REGULAR" })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.membershipType === "REGULAR"
                      ? "border-[#2f9e5f] bg-[#2f9e5f]/10"
                      : "border-gray-300 dark:border-gray-700 hover:border-[#2f9e5f]/50"
                  }`}
                >
                  <div className="text-center">
                    <span className="material-symbols-outlined text-3xl text-[#2f9e5f] mb-2">
                      book
                    </span>
                    <p className="font-bold text-gray-900 dark:text-white">일반</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      최대 3권 대출 가능
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, membershipType: "PREMIUM" })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.membershipType === "PREMIUM"
                      ? "border-[#2f9e5f] bg-[#2f9e5f]/10"
                      : "border-gray-300 dark:border-gray-700 hover:border-[#2f9e5f]/50"
                  }`}
                >
                  <div className="text-center">
                    <span className="material-symbols-outlined text-3xl text-[#2f9e5f] mb-2">
                      workspace_premium
                    </span>
                    <p className="font-bold text-gray-900 dark:text-white">프리미엄</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      최대 5권 대출 가능
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">
                    error
                  </span>
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#2f9e5f] text-white font-bold hover:bg-[#2f9e5f]/90 transition-colors"
              >
                <span className="material-symbols-outlined mr-2">save</span>
                변경 사항 저장
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined mr-2">close</span>
                취소
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  이름
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {user.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  이메일
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {user.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  회원 등급
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${membershipBadgeColor}`}>
                  <span className="material-symbols-outlined text-sm mr-1">
                    {user.membershipType === "PREMIUM" ? "workspace_premium" : "book"}
                  </span>
                  {user.membershipType === "PREMIUM" ? "프리미엄" : "일반"}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  계정 상태
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadgeColor}`}>
                  <span className="material-symbols-outlined text-sm mr-1">
                    {user.status === "ACTIVE" ? "check_circle" : "cancel"}
                  </span>
                  {user.status === "ACTIVE" ? "활성" : "일시중지"}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  가입일
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {new Date(user.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
            >
              <span className="material-symbols-outlined mr-2">logout</span>
              로그아웃
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
