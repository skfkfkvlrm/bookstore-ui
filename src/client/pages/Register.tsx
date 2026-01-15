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
      setError("Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      register(formData);
      navigate("/client", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-6xl text-[#1173d4] mb-4">
            person_add
          </span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join our library community
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#101922] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1173d4] focus:border-transparent"
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#101922] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1173d4] focus:border-transparent"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Membership Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, membershipType: "REGULAR" })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.membershipType === "REGULAR"
                      ? "border-[#1173d4] bg-[#1173d4]/10"
                      : "border-gray-300 dark:border-gray-700 hover:border-[#1173d4]/50"
                  }`}
                >
                  <div className="text-center">
                    <span className="material-symbols-outlined text-3xl text-[#1173d4] mb-2">
                      book
                    </span>
                    <p className="font-bold text-gray-900 dark:text-white">Regular</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Standard access
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, membershipType: "PREMIUM" })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.membershipType === "PREMIUM"
                      ? "border-[#1173d4] bg-[#1173d4]/10"
                      : "border-gray-300 dark:border-gray-700 hover:border-[#1173d4]/50"
                  }`}
                >
                  <div className="text-center">
                    <span className="material-symbols-outlined text-3xl text-[#1173d4] mb-2">
                      workspace_premium
                    </span>
                    <p className="font-bold text-gray-900 dark:text-white">Premium</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Extended benefits
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
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#1173d4] text-white font-bold text-base hover:bg-[#1173d4]/90 transition-all shadow-md"
            >
              <span className="material-symbols-outlined mr-2">person_add</span>
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/client/login"
                className="text-[#1173d4] font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <p>Regular members can borrow up to 3 books at a time</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <p>Premium members can borrow up to 5 books at a time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
