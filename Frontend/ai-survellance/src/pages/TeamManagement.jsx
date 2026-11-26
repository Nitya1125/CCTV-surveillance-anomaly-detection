import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiUserPlus,
  FiCopy,
  FiCheck,
  FiShield,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw
} from "react-icons/fi";
import { getOrgUsers, updateUserRole, removeUser } from "../services/api";

const TeamManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")._id;
  const currentUserRole = localStorage.getItem("role") || "operator";
  const orgName = localStorage.getItem("org_name") || "Security Facility";
  const joinCode = localStorage.getItem("join_code") || "849201";

  const loadTeam = async () => {
    setLoading(true);
    try {
      const res = await getOrgUsers();
      if (res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (e) {
      console.error("Team fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, { role: newRole });
      setNotice(`Member permissions changed to ${newRole}.`);
      loadTeam();
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to modify role");
    }
  };

  const handleRemove = async (userId, name) => {
    if (!window.confirm(`Revoke security console access for ${name}?`)) return;
    try {
      await removeUser(userId);
      setNotice(`${name} removed from organization.`);
      loadTeam();
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#252B36] tracking-tight">
            Team Members & Security Access
          </h1>
          <p className="text-xs text-[#697586] mt-0.5">
            Manage operational roles, assign surveillance privileges, and onboard facility officers
          </p>
        </div>

        <button onClick={loadTeam} disabled={loading} className="btn-secondary text-xs">
          <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Roster</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-[#E8F7F0] border border-[#16A36A]/20 rounded-lg text-xs text-[#16A36A] flex items-center gap-2">
          <FiCheckCircle className="text-sm shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Onboarding Invitation Card */}
      <div className="bg-white p-5 border border-[#E5E9F0] rounded-xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A36A]"></span>
            <h2 className="text-sm font-semibold text-[#252B36]">Workspace Join Code</h2>
          </div>
          <p className="text-xs text-[#697586] mt-1">
            Provide this 6-digit access key to authorized personnel to let them register and join <strong>{orgName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#F5F7FA] border border-[#E5E9F0] rounded-lg font-mono font-bold text-base text-[#252B36] tracking-widest">
            {joinCode}
          </div>
          <button
            onClick={handleCopyCode}
            className="btn-primary text-xs py-2.5"
            title="Copy join code"
          >
            {copied ? <FiCheck className="text-sm" /> : <FiCopy className="text-sm" />}
            <span>{copied ? "Copied" : "Copy Code"}</span>
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-[#E5E9F0] rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#E5E9F0] flex items-center justify-between">
          <h2 className="text-xs font-semibold text-[#252B36]">Active Security Personnel ({users.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FA] text-[#697586] font-semibold border-b border-[#E5E9F0]">
              <tr>
                <th className="py-3 px-4">Officer Name</th>
                <th className="py-3 px-4">Contact Email</th>
                <th className="py-3 px-4">Console Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9F0] text-[#252B36]">
              {users.map((u) => {
                const isSelf = u._id === currentUserId;
                const isOwner = u.role === "owner";
                const canModify = (currentUserRole === "owner" || currentUserRole === "admin") && !isOwner && !isSelf;

                return (
                  <tr key={u._id} className="hover:bg-[#F5F7FA]/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#252B36]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center font-bold text-xs">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span>{u.name}</span>
                          {isSelf && <span className="ml-1.5 text-[10px] text-[#2563EB] font-normal">(You)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#697586] font-mono">{u.email}</td>
                    <td className="py-3.5 px-4">
                      {canModify ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="input-field text-xs py-1 w-28 cursor-pointer"
                        >
                          <option value="admin">Admin</option>
                          <option value="operator">Operator</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isOwner
                              ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                              : "bg-[#F5F7FA] text-[#697586] border border-[#E5E9F0]"
                          }`}
                        >
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="badge-success">Active</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {canModify && (
                        <button
                          onClick={() => handleRemove(u._id, u.name)}
                          className="p-1.5 rounded text-[#9AA5B5] hover:text-[#DC4545] hover:bg-[#FDF2F2] transition"
                          title="Revoke Membership"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
