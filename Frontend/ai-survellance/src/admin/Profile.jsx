import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCopy } from "react-icons/fa";
import { getOrgProfile, changePassword } from "../services/api";

const AdminProfile = () => {
  const navigate = useNavigate();

  const [orgData, setOrgData] = useState({
    orgName: "",
    joinCode: "",
    totalUsers: 0,
    totalVideos: 0,
    suspicious: 0
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrgProfile();
  }, []);

  const fetchOrgProfile = async () => {
    try {
      const res = await getOrgProfile();
      setOrgData(res.data);
    } catch (err) {
      console.error("Failed to fetch org profile:", err);
    }
  };

  const checkPassword = () => {
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }
    setVerified(true);
    setError("");
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setVerified(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(orgData.joinCode);
    alert("Join code copied");
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="text-xl"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Organization Profile</h1>
      </div>

      <div className="bg-white rounded-xl shadow p-8 mb-8">
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-gray-500 text-sm">Organization</p>
            <p className="text-lg font-semibold">{orgData.orgName}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Join Code</p>
            <div className="flex items-center gap-3">
              <p className="text-lg font-semibold">{orgData.joinCode}</p>
              <button onClick={copyCode} className="text-gray-600">
                <FaCopy />
              </button>
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-lg font-semibold">{orgData.totalUsers}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Videos</p>
            <p className="text-lg font-semibold">{orgData.totalVideos}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Suspicious Activities</p>
            <p className="text-lg font-semibold">{orgData.suspicious}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!verified && (
          <div className="space-y-4 max-w-md">
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
            <button
              onClick={checkPassword}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg"
            >
              Verify Password
            </button>
          </div>
        )}
        {verified && (
          <div className="space-y-4 max-w-md">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
            <button
              onClick={updatePassword}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg"
            >
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminProfile;