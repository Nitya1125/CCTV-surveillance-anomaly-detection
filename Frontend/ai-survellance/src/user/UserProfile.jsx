import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import { getUserProfile } from "../services/api";

const UserProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    organization: "",
    videos: 0,
    suspicious: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/user/dashboard")}
          className="p-2 hover:bg-gray-200 rounded-full"
        >
          <FaArrowLeft />
        </button>

        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <div className="bg-white rounded-xl shadow p-8 max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <FaUserCircle className="text-7xl text-gray-400 mb-3" />

          <h2 className="text-xl font-semibold">{user.name}</h2>

          <p className="text-gray-500">{user.email}</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-500">Organization</span>
            <span className="font-medium">{user.organization}</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-500">Total Videos</span>
            <span className="font-medium">{user.videos}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Suspicious Activities</span>
            <span className="font-medium">{user.suspicious}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
