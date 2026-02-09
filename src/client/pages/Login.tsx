import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login } from "../utils/authStorage";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const from = (location.state as any)?.from?.pathname || "/client";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("이메일을 입력하세요.");
      return;
    }

    const user = login(email);

    if (user) {
      navigate(from, { replace: true });
    } else {
      setError("해당 이메일로 등록된 계정이 없습니다. 이메일을 확인하거나 회원가입을 진행하세요.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-6xl text-[#1173d4] mb-4">
            account_circle
          </span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            다시 만나서 반가워요
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            로그인하고 계정 기능을 이용하세요
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#101922] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1173d4] focus:border-transparent"
                placeholder="이메일을 입력하세요"
                autoComplete="email"
              />
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
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#1173d4] text-white font-bold text-base hover:bg-[#1173d4]/90 transition-all shadow-md"
            >
              <span className="material-symbols-outlined mr-2">login</span>
              로그인
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              아직 계정이 없으신가요?{" "}
              <Link
                to="/client/register"
                className="text-[#1173d4] font-medium hover:underline"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
