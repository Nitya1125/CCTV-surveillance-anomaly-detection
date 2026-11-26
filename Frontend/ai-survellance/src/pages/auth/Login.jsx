import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShield, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { login } from "../../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please provide both username and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await login({ username: username.trim(), password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("user_name", user.name);
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", user.role);
      if (user.organization_id) {
        localStorage.setItem("org_id", user.organization_id);
      }
      if (user.organization_name) {
        localStorage.setItem("org_name", user.organization_name);
      }

      // Seamless route resolution
      if (user.organization_id) {
        navigate("/dashboard");
      } else {
        navigate("/organization");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon & Heading */}
        <div className="flex justify-center">
          <div className="w-11 h-11 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-subtle">
            <FiShield className="text-2xl" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-[#252B36]">
          Surveillance System
        </h2>
        <p className="mt-1 text-center text-sm text-[#697586]">
          Enterprise CCTV Surveillance & Anomaly Detection
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#E5E9F0] rounded-xl shadow-card">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-[#252B36]">Sign in to your account</h3>
            <p className="text-xs text-[#697586] mt-0.5">Enter your operator credentials to access the console</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#FDF2F2] border border-[#DC4545]/20 flex items-start gap-2.5 text-xs text-[#DC4545]">
              <FiAlertCircle className="text-sm shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#252B36] mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="operator@vigilai.internal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-9"
                />
                <FiUser className="absolute left-3 top-3 text-[#9AA5B5] text-sm" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#252B36]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-9 pr-9"
                />
                <FiLock className="absolute left-3 top-3 text-[#9AA5B5] text-sm" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#9AA5B5] hover:text-[#252B36] text-sm p-0.5"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <FiArrowRight className="text-sm" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E5E9F0] text-center text-xs text-[#697586]">
            <span>Need an enterprise account? </span>
            <Link to="/signup" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
              Register organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
