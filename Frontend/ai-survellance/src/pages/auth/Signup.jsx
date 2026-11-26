import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShield, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { signup } from "../../services/api";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await signup({
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
        password
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("user_name", user.name);
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", user.role);

      navigate("/organization");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-11 h-11 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-subtle">
            <FiShield className="text-2xl" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-[#252B36]">
          Create Operator Account
        </h2>
        <p className="mt-1 text-center text-sm text-[#697586]">
          Setup your enterprise credentials to manage surveillance feeds
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#E5E9F0] rounded-xl shadow-card">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#FDF2F2] border border-[#DC4545]/20 flex items-start gap-2.5 text-xs text-[#DC4545]">
              <FiAlertCircle className="text-sm shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#252B36] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-9"
                />
                <FiUser className="absolute left-3 top-3 text-[#9AA5B5] text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252B36] mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="alex@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-9"
                />
                <FiMail className="absolute left-3 top-3 text-[#9AA5B5] text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252B36] mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="alex_mercer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-9"
                />
                <FiUser className="absolute left-3 top-3 text-[#9AA5B5] text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252B36] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min. 6 characters"
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

            <div>
              <label className="block text-xs font-semibold text-[#252B36] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-9"
                />
                <FiLock className="absolute left-3 top-3 text-[#9AA5B5] text-sm" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 mt-2"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight className="text-sm" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E5E9F0] text-center text-xs text-[#697586]">
            <span>Already have an account? </span>
            <Link to="/" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
