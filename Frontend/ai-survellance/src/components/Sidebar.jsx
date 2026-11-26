import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiVideo,
  FiCamera,
  FiUploadCloud,
  FiAlertTriangle,
  FiShield,
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiUser,
  FiLogOut,
  FiX,
  FiCopy,
  FiCheck,
  FiChevronRight
} from "react-icons/fi";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const orgName = localStorage.getItem("org_name") || "Security Operations";
  const userRole = localStorage.getItem("role") || "operator";
  const joinCode = localStorage.getItem("join_code") || "849201";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navSections = [
    {
      title: "SURVEILLANCE & AI",
      items: [
        { path: "/dashboard", label: "Dashboard", icon: <FiGrid /> },
        { path: "/upload", label: "Video Ingestion & ROI", icon: <FiUploadCloud /> },
        { path: "/videos", label: "Footage Archives", icon: <FiShield /> },
      ],
    },
    {
      title: "SECURITY INCIDENTS",
      items: [
        { path: "/alerts", label: "Alert Feed", icon: <FiAlertTriangle /> },
        { path: "/incidents", label: "Incident Management", icon: <FiShield /> },
        { path: "/analytics", label: "Reports & Trends", icon: <FiBarChart2 /> },
      ],
    },
    {
      title: "ADMINISTRATION",
      items: [
        { path: "/team", label: "Team Members", icon: <FiUsers /> },
        { path: "/settings/organization", label: "Organization", icon: <FiSettings /> },
        { path: "/profile", label: "My Profile", icon: <FiUser /> },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-[#E5E9F0] z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header / Brand */}
        <div>
          <div className="h-16 px-5 border-b border-[#E5E9F0] flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm font-semibold text-base">
                <FiShield className="text-lg" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-[#252B36] tracking-tight">
                  Surveillance System
                </span>
                <span className="text-xs font-medium text-[#697586]">
                  Enterprise CCTV
                </span>
              </div>
            </Link>

            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-[#697586] hover:text-[#252B36] hover:bg-[#F5F7FA]"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Organization Switcher Bar */}
          <div className="px-5 py-3.5 border-b border-[#E5E9F0] bg-[#F5F7FA]/60">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#252B36] truncate max-w-[140px]">
                {orgName}
              </span>
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white border border-[#E5E9F0] text-[#2563EB]">
                {userRole}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3.5 py-5 space-y-6 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navSections.map((section, idx) => (
              <div key={idx}>
                <div className="px-3 mb-2.5 text-xs font-bold tracking-wider text-[#9AA5B5] uppercase">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) toggleSidebar();
                        }}
                        className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? "bg-[#EFF6FF] text-[#2563EB] font-semibold"
                            : "text-[#697586] hover:text-[#252B36] hover:bg-[#F5F7FA]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-lg ${isActive ? "text-[#2563EB]" : "text-[#9AA5B5]"}`}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {isActive && <FiChevronRight className="text-sm text-[#2563EB]" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Org Join Code & Logout */}
        <div className="p-4 border-t border-[#E5E9F0] space-y-3 bg-white">
          <div className="p-3 rounded-lg bg-[#F5F7FA] border border-[#E5E9F0] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-[#697586] font-medium">Join Code</span>
              <span className="text-sm font-mono font-bold text-[#252B36] tracking-wider">{joinCode}</span>
            </div>
            <button
              onClick={handleCopyCode}
              title="Copy Org Join Code"
              className="p-2 rounded-md hover:bg-white text-[#697586] hover:text-[#252B36] transition shadow-xs"
            >
              {copied ? <FiCheck className="text-sm text-[#16A36A]" /> : <FiCopy className="text-sm" />}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-[#DC4545] hover:bg-[#FDF2F2] rounded-lg transition-colors"
          >
            <FiLogOut className="text-base" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
