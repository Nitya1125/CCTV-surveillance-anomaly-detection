import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes, FaArrowLeft } from "react-icons/fa";
import { getPendingAdmins, approveAdmin, rejectAdmin } from "../services/api";

const ApproveAdmins = () => {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await getPendingAdmins();
      setAdmins(res.data.admins);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveAdmin(id);
      setAdmins(
        admins.map((a) => (a._id === id ? { ...a, status: "active" } : a))
      );
    } catch (err) {
      alert("Failed to approve admin");
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Reject this admin and delete their organization?")) return;
    try {
      await rejectAdmin(id);
      setAdmins(admins.filter((a) => a._id !== id));
    } catch (err) {
      alert("Failed to reject admin");
    }
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/superadmin/dashboard")}
          className="text-lg"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Admin Requests</h1>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading admins...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Admin Name</th>
                <th className="p-4 text-left">Organization</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id} className="border-t">
                  <td className="p-4">{admin.name}</td>

                  <td className="p-4">{admin.organization}</td>

                  <td className="p-4">{admin.email}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${admin.status === "active" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}
                    >
                      {admin.status === "active" ? "Approved" : "Pending"}
                    </span>
                  </td>

                  <td className="p-4 flex gap-3">
                    <button
                      onClick={() => handleApprove(admin._id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FaCheck />
                    </button>

                    <button
                      onClick={() => handleReject(admin._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    No admin requests at this time
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

export default ApproveAdmins;
