import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { setCurrentUserFromToken, isAdmin } from "../../client/utils/authStorage";
import axios from "axios";
import type { ApiError } from "../../shared/types";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("이메일을 입력하세요."); return; }
    if (!password.trim()) { setError("비밀번호를 입력하세요."); return; }

    setLoading(true);
    try {
      const token = await authService.login({ email, password });
      setCurrentUserFromToken(token.accessToken);

      if (!isAdmin()) {
        setError("관리자 권한이 없습니다.");
        return;
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        if (err.response?.status === 401) {
          setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          setError(apiError?.message ?? "로그인에 실패했습니다.");
        }
      } else {
        setError("서버에 연결할 수 없습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101922] px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-6xl text-[#2f9e5f] mb-4">
            admin_panel_settings
          </span>
          <h1 className="text-3xl font-bold text-white mb-2">관리자 로그인</h1>
          <p className="text-gray-400">관리자 계정으로 로그인하세요</p>
        </div>

        <div className="bg-[#1a2632] border border-gray-700 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-[#101922] text-gray-100 focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent"
                placeholder="관리자 이메일"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-[#101922] text-gray-100 focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent"
                placeholder="비밀번호"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start gap-2">
                <span className="material-symbols-outlined text-red-400 text-xl">error</span>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#2f9e5f] text-white font-bold text-base hover:bg-[#2f9e5f]/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
