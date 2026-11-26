import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiShield, FiMail, FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { forgotPassword } from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await forgotPassword({ email: email.trim() });
      setMessage(res.data.message || "Password recovery instructions have been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate password reset.");
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
          Reset Your Password
        </h2>
        <p className="mt-1 text-center text-sm text-[#697586]">
          Enter your operator email to receive access credentials recovery
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

          {message && (
            <div className="mb-5 p-3 rounded-lg bg-[#E8F7F0] border border-[#16A36A]/20 flex items-start gap-2.5 text-xs text-[#16A36A]">
              <FiCheckCircle className="text-sm shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#252B36] mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="operator@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-9"
                />
                <FiMail className="absolute left-3 top-3 text-[#9AA5B5] text-sm" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5"
            >
              {loading ? "Sending Instructions..." : "Send Reset Instructions"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E5E9F0] text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              <FiArrowLeft className="text-xs" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
