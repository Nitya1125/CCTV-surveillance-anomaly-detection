import React from "react";
import { Link } from "react-router-dom";
import { FiAlertTriangle, FiArrowLeft } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center items-center p-6 text-center antialiased">
      <div className="w-14 h-14 rounded-2xl bg-[#FEF7ED] border border-[#E59A23]/30 text-[#E59A23] flex items-center justify-center text-2xl mb-4 shadow-subtle">
        <FiAlertTriangle />
      </div>
      <span className="font-mono text-sm font-bold text-[#697586] tracking-wider mb-1">ERROR 404</span>
      <h1 className="text-2xl font-bold text-[#252B36] tracking-tight mb-2">
        Surveillance Route Not Found
      </h1>
      <p className="text-xs text-[#697586] max-w-sm mb-6">
        The security console endpoint you requested does not exist or has been relocated to another optical sector.
      </p>
      <Link to="/dashboard" className="btn-primary text-xs">
        <FiArrowLeft className="text-xs" />
        <span>Return to Console</span>
      </Link>
    </div>
  );
};

export default NotFound;
