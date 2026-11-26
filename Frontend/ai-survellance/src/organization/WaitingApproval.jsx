import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock } from "react-icons/fa";

const API_BASE = "http://localhost:3000/api";

const WaitingApproval = () => {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);

    const checkStatus = async () => {
        setChecking(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/auth/check-status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.user.status === "active" && data.user.role === "admin") {
                // Approved! Update localStorage and go to org-created page
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/organization-created", { state: { code: data.joinCode } });
            }
        } catch (err) {
            console.error("Check status failed:", err);
        } finally {
            setChecking(false);
        }
    };

    // Auto-check every 10 seconds
    useEffect(() => {
        const interval = setInterval(checkStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
            <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full">

                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                        <FaClock className="text-4xl text-yellow-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-3">
                    Waiting for Approval
                </h1>

                <p className="text-gray-500 mb-8">
                    Your organization has been submitted. Please wait for the Super Admin to approve your request before you can access the dashboard.
                </p>

                <div className="flex items-center justify-center gap-2 text-yellow-600 mb-8">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Pending Approval</span>
                </div>

                <button
                    onClick={checkStatus}
                    disabled={checking}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:scale-[1.02] transition mb-3 disabled:opacity-50"
                >
                    {checking ? "Checking..." : "Check Status"}
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition"
                >
                    Logout
                </button>

            </div>
        </div>
    );
};

export default WaitingApproval;
