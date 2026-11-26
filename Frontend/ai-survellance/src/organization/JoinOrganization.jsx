import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUserPlus, FiArrowLeft, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { joinOrganization } from "../services/api";

const JoinOrganization = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setCode(digits);
      inputs.current[5].focus();
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");

    const finalCode = code.join("");
    if (finalCode.length !== 6) {
      setError("Please provide all 6 numeric digits of your organization code.");
      return;
    }

    setLoading(true);

    try {
      const res = await joinOrganization({ joinCode: finalCode });
      const { token, organization, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("org_id", organization._id);
      localStorage.setItem("org_name", organization.organization_name);
      localStorage.setItem("role", user.role);
      localStorage.setItem("join_code", organization.join_code);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid organization join code. Please contact your workspace administrator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-11 h-11 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-subtle">
            <FiUserPlus className="text-2xl" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-[#252B36]">
          Join Security Workspace
        </h2>
        <p className="mt-1 text-center text-sm text-[#697586]">
          Enter the 6-digit access code provided by your organization owner
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#E5E9F0] rounded-xl shadow-card">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#FDF2F2] border border-[#DC4545]/20 flex items-start gap-2.5 text-xs text-[#DC4545]">
              <FiAlertCircle className="text-sm shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#252B36] text-center mb-3">
                6-Digit Access Code
              </label>
              <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputs.current[index] = el)}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-11 h-12 text-center text-lg font-mono font-bold text-[#252B36] bg-white border border-[#E5E9F0] rounded-lg focus:border-[#2563EB] focus:ring-2 focus:ring-brand-500/10 outline-none transition"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.join("").length !== 6}
              className="w-full btn-primary py-2.5"
            >
              {loading ? (
                <span>Validating Code...</span>
              ) : (
                <>
                  <span>Connect to Workspace</span>
                  <FiArrowRight className="text-sm" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E5E9F0] text-center">
            <Link
              to="/organization"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              <FiArrowLeft className="text-xs" />
              <span>Back to options</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinOrganization;
