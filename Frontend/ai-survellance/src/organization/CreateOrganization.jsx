import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBriefcase, FiShield, FiArrowRight, FiArrowLeft, FiAlertCircle, FiPhone } from "react-icons/fi";
import { createOrganization } from "../services/api";

const CreateOrganization = () => {
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("Company");
  const [adminPhone, setAdminPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!orgName.trim()) {
      setError("Please specify an organization or company name.");
      return;
    }

    setLoading(true);

    try {
      const res = await createOrganization({
        orgName: orgName.trim(),
        orgType,
        adminPhone
      });

      const { token, organization, user } = res.data;

      // Update storage with updated token containing new role and organization_id
      localStorage.setItem("token", token);
      localStorage.setItem("org_id", organization._id);
      localStorage.setItem("org_name", organization.organization_name);
      localStorage.setItem("role", user.role);
      localStorage.setItem("join_code", organization.join_code);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create organization. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-11 h-11 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-subtle">
            <FiBriefcase className="text-2xl" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-[#252B36]">
          Register Organization
        </h2>
        <p className="mt-1 text-center text-sm text-[#697586]">
          Configure your enterprise security workspace
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

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#252B36] mb-1.5">
                Organization / Facility Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Logistics HQ"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="input-field pl-9"
                />
                <FiBriefcase className="absolute left-3 top-3 text-[#9AA5B5] text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252B36] mb-1.5">
                Facility Category
              </label>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="input-field cursor-pointer"
              >
                <option value="Company">Corporate Office / Commercial</option>
                <option value="Enterprise">Industrial / Manufacturing Plant</option>
                <option value="College">Educational Campus / University</option>
                <option value="Startup">Tech Hub / Innovation Center</option>
                <option value="Other">Public Infrastructure / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252B36] mb-1.5">
                Security Desk Contact Phone (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="+1 (555) 019-2834"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="input-field pl-9"
                />
                <FiPhone className="absolute left-3 top-3 text-[#9AA5B5] text-sm" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5"
              >
                {loading ? (
                  <span>Initializing Workspace...</span>
                ) : (
                  <>
                    <span>Create & Launch Console</span>
                    <FiArrowRight className="text-sm" />
                  </>
                )}
              </button>
            </div>
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

export default CreateOrganization;
