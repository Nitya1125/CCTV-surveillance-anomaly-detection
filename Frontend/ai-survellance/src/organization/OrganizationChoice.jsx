import React from "react";
import { useNavigate } from "react-router-dom";
import { FiPlusSquare, FiUserPlus, FiShield, FiArrowRight } from "react-icons/fi";

const OrganizationChoice = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("user_name") || "Operator";

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#2563EB] text-white shadow-subtle mb-4">
          <FiShield className="text-2xl" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#252B36]">
          Welcome, {userName}
        </h2>
        <p className="mt-1 text-sm text-[#697586]">
          Select how you want to connect to the CCTV Surveillance Network
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Option A: Create New Organization */}
          <div
            onClick={() => navigate("/create-organization")}
            className="group cursor-pointer bg-white p-6 sm:p-8 rounded-xl border border-[#E5E9F0] shadow-card hover:border-[#2563EB] hover:shadow-dropdown transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center text-xl mb-5 group-hover:scale-105 transition-transform">
                <FiPlusSquare />
              </div>
              <h3 className="text-base font-semibold text-[#252B36] mb-1.5 group-hover:text-[#2563EB] transition-colors">
                Create New Organization
              </h3>
              <p className="text-xs text-[#697586] leading-relaxed">
                Establish a new security workspace. You will become the organization owner with full administrative authority to configure cameras, zones, and invite operators.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E9F0] flex items-center justify-between text-xs font-semibold text-[#2563EB]">
              <span>Set up workspace</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Option B: Join Existing Organization */}
          <div
            onClick={() => navigate("/join-organization")}
            className="group cursor-pointer bg-white p-6 sm:p-8 rounded-xl border border-[#E5E9F0] shadow-card hover:border-[#2563EB] hover:shadow-dropdown transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#F5F7FA] border border-[#E5E9F0] text-[#252B36] flex items-center justify-center text-xl mb-5 group-hover:scale-105 transition-transform">
                <FiUserPlus />
              </div>
              <h3 className="text-base font-semibold text-[#252B36] mb-1.5 group-hover:text-[#2563EB] transition-colors">
                Join with Invitation Code
              </h3>
              <p className="text-xs text-[#697586] leading-relaxed">
                Already have a 6-digit access code provided by your organization owner? Connect immediately as an operator to monitor assigned camera feeds.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E9F0] flex items-center justify-between text-xs font-semibold text-[#2563EB]">
              <span>Enter join code</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationChoice;
