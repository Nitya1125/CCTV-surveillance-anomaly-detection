import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiShield,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";
import { getUserProfile, updateProfile, changePassword } from "../services/api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [notice, setNotice] = useState({ type: "", text: "" });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getUserProfile();
      if (res.data) {
        setProfile(res.data);
        setName(res.data.name || "");
        setPhone(res.data.phone || "");
      }
    } catch (e) {
      console.error("Failed to load user profile:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile({ name, phone });
      localStorage.setItem("user_name", name);
      setNotice({ type: "success", text: "Operator profile updated successfully." });
      setTimeout(() => setNotice({ type: "", text: "" }), 3000);
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setNotice({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice({ type: "success", text: "Security credentials updated successfully." });
      setTimeout(() => setNotice({ type: "", text: "" }), 3000);
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "Password update failed." });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#252B36] tracking-tight">
          Operator Profile & Security Credentials
        </h1>
        <p className="text-xs text-[#697586] mt-0.5">
          Manage your personal console credentials, contact telemetry and active sessions
        </p>
      </div>

      {notice.text && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            notice.type === "success"
              ? "bg-[#E8F7F0] border-[#16A36A]/20 text-[#16A36A]"
              : "bg-[#FDF2F2] border-[#DC4545]/20 text-[#DC4545]"
          }`}
        >
          {notice.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white p-5 sm:p-6 border border-[#E5E9F0] rounded-xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center font-bold text-xl">
            {profile?.name ? profile.name.slice(0, 2).toUpperCase() : "OP"}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#252B36]">{profile?.name}</h2>
            <p className="text-xs text-[#697586]">@{profile?.username} • {profile?.organization || "Facility"}</p>
          </div>
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
            Role: {profile?.role || "Operator"}
          </span>
        </div>
      </div>

      {/* Edit Details & Password Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Personal Details */}
        <div className="bg-white p-5 border border-[#E5E9F0] rounded-xl shadow-card">
          <h3 className="text-sm font-semibold text-[#252B36] border-b border-[#E5E9F0] pb-3 mb-4">
            Operator Information
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#252B36] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#252B36] mb-1">Registered Email</label>
              <input
                type="email"
                disabled
                value={profile?.email || ""}
                className="input-field py-2 bg-[#F5F7FA] text-[#697586] cursor-not-allowed"
              />
              <span className="text-[10px] text-[#9AA5B5] mt-1 block">Email is locked to primary identifier</span>
            </div>

            <div>
              <label className="block font-semibold text-[#252B36] mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field py-2"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="btn-primary text-xs w-full py-2"
              >
                {profileSaving ? "Saving..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Password Security */}
        <div className="bg-white p-5 border border-[#E5E9F0] rounded-xl shadow-card">
          <h3 className="text-sm font-semibold text-[#252B36] border-b border-[#E5E9F0] pb-3 mb-4">
            Change Password
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#252B36] mb-1">Current Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#252B36] mb-1">New Password</label>
              <input
                type="password"
                required
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#252B36] mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field py-2"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="btn-primary text-xs w-full py-2"
              >
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
