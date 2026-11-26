import React, { useState, useEffect } from "react";
import {
  FiSettings,
  FiBriefcase,
  FiShield,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertTriangle,
  FiCopy,
  FiCheck
} from "react-icons/fi";
import { getOrgProfile, updateOrgSettings, regenerateJoinCode } from "../services/api";

const OrganizationSettings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("Company");
  const [retentionDays, setRetentionDays] = useState(30);
  const [autoAlerts, setAutoAlerts] = useState(true);
  const [sensitivity, setSensitivity] = useState("standard");

  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");

  const loadOrg = async () => {
    setLoading(true);
    try {
      const res = await getOrgProfile();
      if (res.data) {
        setProfile(res.data);
        setOrgName(res.data.orgName || "");
        setOrgType(res.data.orgType || "Company");
        if (res.data.settings) {
          setRetentionDays(res.data.settings.retention_days || 30);
          setAutoAlerts(res.data.settings.auto_alerts !== false);
          setSensitivity(res.data.settings.sensitivity || "standard");
        }
      }
    } catch (e) {
      console.error("Failed to load org profile:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrg();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateOrgSettings({
        orgName,
        orgType,
        settings: {
          retention_days: retentionDays,
          auto_alerts: autoAlerts,
          sensitivity
        }
      });
      localStorage.setItem("org_name", orgName);
      setNotice("Organization preferences saved successfully.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateCode = async () => {
    if (!window.confirm("Regenerating the join code will invalidate the existing code for future registrations. Proceed?")) return;

    try {
      const res = await regenerateJoinCode();
      if (res.data?.joinCode) {
        setProfile((prev) => ({ ...prev, joinCode: res.data.joinCode }));
        localStorage.setItem("join_code", res.data.joinCode);
        setNotice("New 6-digit access code generated.");
        setTimeout(() => setNotice(""), 3000);
      }
    } catch (err) {
      alert("Failed to regenerate code.");
    }
  };

  const copyCode = () => {
    if (profile?.joinCode) {
      navigator.clipboard.writeText(profile.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#252B36] tracking-tight">
          Organization Preferences & Compliance
        </h1>
        <p className="text-xs text-[#697586] mt-0.5">
          Workspace parameters, access keys, retention schedules, and optical sensor sensitivity
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-[#E8F7F0] border border-[#16A36A]/20 rounded-lg text-xs text-[#16A36A] flex items-center gap-2">
          <FiCheckCircle className="text-sm shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Workspace Identity Card */}
        <div className="bg-white p-5 sm:p-6 border border-[#E5E9F0] rounded-xl shadow-card space-y-4">
          <h2 className="text-sm font-semibold text-[#252B36] border-b border-[#E5E9F0] pb-3">
            Facility Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#252B36] mb-1.5">Organization Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="input-field py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#252B36] mb-1.5">Facility Classification</label>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="input-field py-2 cursor-pointer"
              >
                <option value="Company">Corporate Commercial</option>
                <option value="Enterprise">Manufacturing & Logistics</option>
                <option value="College">Educational Campus</option>
                <option value="Startup">Technology Incubator</option>
                <option value="Other">Public Infrastructure</option>
              </select>
            </div>
          </div>
        </div>

        {/* Join Code Card */}
        <div className="bg-white p-5 sm:p-6 border border-[#E5E9F0] rounded-xl shadow-card">
          <h2 className="text-sm font-semibold text-[#252B36] mb-1">
            Access Key & Join Credentials
          </h2>
          <p className="text-xs text-[#697586] mb-4">
            Authorized operators use this code during initial registration to link their account to this facility.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#F5F7FA] border border-[#E5E9F0]">
            <div>
              <span className="text-[10px] text-[#697586] font-medium block mb-1">Current Join Code</span>
              <span className="font-mono text-xl font-bold text-[#252B36] tracking-widest">
                {profile?.joinCode || "------"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyCode}
                className="btn-secondary text-xs"
              >
                {copied ? <FiCheck className="text-[#16A36A]" /> : <FiCopy />}
                <span>{copied ? "Copied" : "Copy Code"}</span>
              </button>

              <button
                type="button"
                onClick={handleRegenerateCode}
                className="btn-secondary text-xs"
              >
                <FiRefreshCw className="text-xs" />
                <span>Regenerate Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compliance & Optical Parameters */}
        <div className="bg-white p-5 sm:p-6 border border-[#E5E9F0] rounded-xl shadow-card space-y-4">
          <h2 className="text-sm font-semibold text-[#252B36] border-b border-[#E5E9F0] pb-3">
            Optical Sensor & Retention Schedules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#252B36] mb-1.5">
                Footage Retention Schedule (Days)
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value) || 30)}
                className="input-field py-2"
              />
              <span className="text-[11px] text-[#9AA5B5] mt-1 block">
                Standard security compliance default: 30 days
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#252B36] mb-1.5">
                AI Inference Sensitivity Profile
              </label>
              <select
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value)}
                className="input-field py-2 cursor-pointer"
              >
                <option value="standard">Standard (Recommended • Balanced)</option>
                <option value="high">High Precision (Lower threshold)</option>
                <option value="low">Permissive (Reduces alert volume)</option>
              </select>
              <span className="text-[11px] text-[#9AA5B5] mt-1 block">
                Adjusts speed and loitering event threshold sensitivity
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs px-6 py-2.5"
          >
            {saving ? "Saving Changes..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationSettings;
