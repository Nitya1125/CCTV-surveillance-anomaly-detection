import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaUsers,
  FaUserShield,
  FaUserCheck,
  FaUserClock,
  FaArrowLeft,
} from "react-icons/fa";
import { getOrgUsers, removeUser } from "../services/api";

const ManageUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getOrgUsers();
      setUsers(res.data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (id) => {
    if (!confirm("Remove this user from the organization?")) return;
    try {
      await removeUser(id);
      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      alert("Failed to remove user");
    }
  };

  const totalUsers = users.length;
  const admins = users.filter((u) => u.role === "admin").length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const pendingUsers = users.filter((u) => u.status === "pending").length;

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="text-xl"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Manage Organization Users</h1>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-100 p-6 rounded-xl shadow flex items-center justify-between">
          <div>
            <p className="text-blue-700 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-blue-900">{totalUsers}</p>
          </div>
          <FaUsers className="text-3xl text-blue-700" />
        </div>

        <div className="bg-purple-100 p-6 rounded-xl shadow flex items-center justify-between">
          <div>
            <p className="text-purple-700 text-sm">Admins</p>
            <p className="text-3xl font-bold text-purple-900">{admins}</p>
          </div>
          <FaUserShield className="text-3xl text-purple-700" />
        </div>

        <div className="bg-green-100 p-6 rounded-xl shadow flex items-center justify-between">
          <div>
            <p className="text-green-700 text-sm">Active Users</p>
            <p className="text-3xl font-bold text-green-900">{activeUsers}</p>
          </div>
          <FaUserCheck className="text-3xl text-green-700" />
        </div>

        <div className="bg-yellow-100 p-6 rounded-xl shadow flex items-center justify-between">
          <div>
            <p className="text-yellow-700 text-sm">Pending Users</p>
            <p className="text-3xl font-bold text-yellow-900">{pendingUsers}</p>
          </div>
          <FaUserClock className="text-3xl text-yellow-700" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left text-sm">Name</th>
                <th className="p-4 text-left text-sm">Email</th>
                <th className="p-4 text-left text-sm">Role</th>
                <th className="p-4 text-left text-sm">Status</th>
                <th className="p-4 text-left text-sm">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 capitalize">{user.role}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${user.status === "active" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleRemoveUser(user._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    No users in this organization yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
