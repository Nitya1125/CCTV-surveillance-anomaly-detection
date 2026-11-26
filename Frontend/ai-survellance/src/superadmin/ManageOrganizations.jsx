import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
import { getAllOrganizations, deleteOrganization } from "../services/api";

const ManageOrganizations = () => {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await getAllOrganizations();
      setOrganizations(res.data.organizations);
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeOrganization = async (id) => {
    if (!confirm("Delete this organization? All users will be unlinked.")) return;
    try {
      await deleteOrganization(id);
      setOrganizations(organizations.filter((org) => org._id !== id));
    } catch (err) {
      alert("Failed to delete organization");
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
        <h1 className="text-2xl font-bold">Manage Organizations</h1>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading organizations...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Organization</th>
                <th className="p-4 text-left">Admin</th>
                <th className="p-4 text-left">Total Users</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {organizations.map((org) => (
                <tr key={org._id} className="border-t">
                  <td className="p-4">{org.name}</td>

                  <td className="p-4">{org.admin}</td>

                  <td className="p-4">{org.users}</td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${org.status === "active"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                      }`}>
                      {org.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => removeOrganization(org._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {organizations.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    No organizations registered yet
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

export default ManageOrganizations;
