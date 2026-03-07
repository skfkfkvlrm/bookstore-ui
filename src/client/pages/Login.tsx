import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import { setCurrentUserFromToken } from "../utils/authStorage";
import axios from "axios";
import type { ApiError } from "../../shared/types";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/client";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("이메일을 입력하세요.");
      return;
    }
    if (!password.trim()) {
      setError("비밀번호를 입력하세요.");
      return;
    }

    setLoading(true);
    try {
      const token = await authService.login({ email, password });
      setCurrentUserFromToken(token.accessToken);
      navigate(from, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        if (err.response?.status === 401) {
          setError(apiError?.message ?? "이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          setError(apiError?.message ?? "로그인에 실패했습니다. 다시 시도하세요.");
        }
      } else {
        setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도하세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-6xl text-[#2f9e5f] mb-4">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#101922] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent"
                placeholder="이메일을 입력하세요"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#101922] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent"
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                disabled={loading}
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
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#2f9e5f] text-white font-bold text-base hover:bg-[#2f9e5f]/90 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined mr-2 animate-spin">progress_activity</span>
                  로그인 중...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined mr-2">login</span>
                  로그인
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              아직 계정이 없으신가요?{" "}
              <Link
                to="/client/register"
                className="text-[#2f9e5f] font-medium hover:underline"
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
