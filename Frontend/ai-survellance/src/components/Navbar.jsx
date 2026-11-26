import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiBell,
  FiShield,
  FiUser,
  FiLogOut,
  FiSettings,
  FiCheckCircle,
  FiChevronDown
} from "react-icons/fi";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const userName = localStorage.getItem("user_name") || "Security Officer";
  const userEmail = localStorage.getItem("email") || "operator@surveillance.internal";
  const userRole = localStorage.getItem("role") || "operator";
  const orgName = localStorage.getItem("org_name") || "Security Operations";

  // Get current page title from path
  const getPageTitle = (path) => {
    if (path.includes("/dashboard")) return "Surveillance Overview";
    if (path.includes("/upload")) return "Video Ingestion & ROI Configuration";
    if (path.includes("/videos")) return "Archived Footage & Detections";
    if (path.includes("/alerts")) return "Security Anomaly Alerts";
    if (path.includes("/incidents")) return "Incident Response & Audit";
    if (path.includes("/analytics")) return "Telemetry & Anomaly Reports";
    if (path.includes("/team")) return "Organization Team & Access";
    if (path.includes("/settings")) return "Organization Settings";
    if (path.includes("/profile")) return "Operator Profile";
    return "Surveillance Operations";
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="h-16 bg-white border-b border-[#E5E9F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left section: Hamburger (mobile) + Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-[#697586] hover:text-[#252B36] hover:bg-[#F5F7FA] transition"
        >
          <FiMenu className="text-xl" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-sm text-[#697586]">
            <span className="font-medium text-[#697586]">{orgName}</span>
            <span className="text-[#9AA5B5]">/</span>
            <span className="text-[#252B36] font-semibold">{getPageTitle(location.pathname)}</span>
          </div>
        </div>
      </div>

      {/* Right section: System telemetry status + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Live System Badge (Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F7F0] border border-[#16A36A]/20 text-xs font-semibold text-[#16A36A]">
          <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-pulse"></span>
          <span>AI Engine Ready</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setAlertsOpen(!alertsOpen);
              setProfileOpen(false);
            }}
            className="p-2 rounded-lg text-[#697586] hover:text-[#252B36] hover:bg-[#F5F7FA] transition relative"
            title="Recent Alerts"
          >
            <FiBell className="text-xl" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC4545] border-2 border-white"></span>
          </button>

          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-[#E5E9F0] py-2 z-50">
              <div className="px-4 py-2.5 border-b border-[#E5E9F0] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#252B36]">Security Feed</span>
                <Link
                  to="/alerts"
                  onClick={() => setAlertsOpen(false)}
                  className="text-xs text-[#2563EB] hover:underline font-semibold"
                >
                  View All
                </Link>
              </div>
              <div className="divide-y divide-[#E5E9F0] text-sm">
                <Link
                  to="/alerts"
                  onClick={() => setAlertsOpen(false)}
                  className="block p-3 hover:bg-[#F5F7FA] transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#DC4545] text-xs">Live Alert Feed</span>
                    <span className="text-xs text-[#9AA5B5]">Active</span>
                  </div>
                  <p className="text-[#697586] text-xs">Access centralized incident alerts and telemetry stream.</p>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setAlertsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#F5F7FA] transition"
          >
            <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] font-bold text-xs flex items-center justify-center">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-semibold text-[#252B36] leading-tight">{userName}</span>
              <span className="text-xs font-medium text-[#697586] capitalize">{userRole}</span>
            </div>
            <FiChevronDown className="text-sm text-[#9AA5B5]" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-dropdown border border-[#E5E9F0] py-2 z-50">
              <div className="px-4 py-2.5 border-b border-[#E5E9F0]">
                <p className="text-sm font-semibold text-[#252B36] truncate">{userName}</p>
                <p className="text-xs text-[#697586] truncate">{userEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#252B36] hover:bg-[#F5F7FA] transition"
                >
                  <FiUser className="text-base text-[#697586]" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/settings/organization"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#252B36] hover:bg-[#F5F7FA] transition"
                >
                  <FiSettings className="text-base text-[#697586]" />
                  <span>Organization Settings</span>
                </Link>
              </div>

              <div className="border-t border-[#E5E9F0] pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#DC4545] hover:bg-[#FDF2F2] transition text-left"
                >
                  <FiLogOut className="text-base" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
