import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../utils/authStorage";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    membershipType: "REGULAR" as "REGULAR" | "PREMIUM",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("이름을 입력하세요.");
      return;
    }

    if (!formData.email.trim()) {
      setError("이메일을 입력하세요.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("올바른 이메일 형식을 입력하세요.");
      return;
    }

    try {
      register(formData);
      navigate("/client", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("회원가입에 실패했습니다. 다시 시도하세요.");
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-6xl text-[#2f9e5f] mb-4">
            person_add
          </span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            회원가입
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            스프링 도서관 커뮤니티에 합류하세요
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-8">
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
                placeholder="이름을 입력하세요"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#101922] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent"
                placeholder="이메일을 입력하세요"
                autoComplete="email"
              />
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
                      기본 이용 혜택
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
                      확대된 혜택 제공
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

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#2f9e5f] text-white font-bold text-base hover:bg-[#2f9e5f]/90 transition-all shadow-md"
            >
              <span className="material-symbols-outlined mr-2">person_add</span>
              회원가입
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              이미 계정이 있으신가요?{" "}
              <Link
                to="/client/login"
                className="text-[#2f9e5f] font-medium hover:underline"
              >
                로그인
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <p>일반 회원은 한 번에 최대 3권까지 대출할 수 있습니다.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <p>프리미엄 회원은 한 번에 최대 5권까지 대출할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
