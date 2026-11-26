import React from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiVideo,
  FiActivity,
  FiLayers,
  FiLock,
  FiArrowRight,
  FiCheckCircle,
  FiCpu
} from "react-icons/fi";

const Landing = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-white text-[#252B36] flex flex-col antialiased">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-[#E5E9F0] px-6 sm:px-12 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold">
            <FiShield />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#252B36]">
            Surveillance System
          </span>
        </div>

        <div className="flex items-center gap-3">
          {token ? (
            <Link to="/dashboard" className="btn-primary text-xs">
              <span>Go to Console</span>
              <FiArrowRight className="text-xs" />
            </Link>
          ) : (
            <>
              <Link to="/" className="btn-secondary text-xs">
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary text-xs">
                <span>Start Free Workspace</span>
                <FiArrowRight className="text-xs" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 sm:px-12 max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-xs font-semibold mb-6 mx-auto">
          <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
          <span>YOLOv8 + DeepSORT Real-Time Computer Vision</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#252B36] leading-tight max-w-3xl mx-auto">
          Autonomous Optical Surveillance & Perimeter Threat Intelligence
        </h1>

        <p className="mt-5 text-sm sm:text-base text-[#697586] max-w-2xl mx-auto leading-relaxed">
          An enterprise-grade surveillance SaaS platform engineered for physical security operations. Ingest multi-camera CCTV feeds, calibrate custom polygonal ROI zones, and detect restricted area breaches, sudden running, and loitering.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup" className="btn-primary text-sm px-6 py-3">
            <span>Deploy Surveillance Workspace</span>
            <FiArrowRight className="text-sm" />
          </Link>
          <Link to="/" className="btn-secondary text-sm px-6 py-3">
            <span>Operator Sign In</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-5 border border-[#E5E9F0] rounded-xl bg-white shadow-subtle hover:border-[#2563EB] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-4">
              <FiLayers className="text-lg" />
            </div>
            <h2 className="text-sm font-semibold text-[#252B36] mb-1.5">Polygonal ROI Calibration</h2>
            <p className="text-xs text-[#697586] leading-relaxed">
              Draw custom multi-point boundary polygons directly over live camera footage to enforce zero-tolerance restricted areas.
            </p>
          </div>

          <div className="p-5 border border-[#E5E9F0] rounded-xl bg-white shadow-subtle hover:border-[#2563EB] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#E8F7F0] text-[#16A36A] flex items-center justify-center mb-4">
              <FiCpu className="text-lg" />
            </div>
            <h2 className="text-sm font-semibold text-[#252B36] mb-1.5">DeepSORT Multi-Target Tracking</h2>
            <p className="text-xs text-[#697586] leading-relaxed">
              Cosine-similarity re-identification maintains distinct person track histories across frame occlusions to compute dwell time and loitering.
            </p>
          </div>

          <div className="p-5 border border-[#E5E9F0] rounded-xl bg-white shadow-subtle hover:border-[#2563EB] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#FEF7ED] text-[#E59A23] flex items-center justify-center mb-4">
              <FiActivity className="text-lg" />
            </div>
            <h2 className="text-sm font-semibold text-[#252B36] mb-1.5">Velocity & Panic Anomaly Rules</h2>
            <p className="text-xs text-[#697586] leading-relaxed">
              Detect sudden acceleration spikes across 10-frame intervals to instantly flag running or stampede hazards in corridors.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-[#E5E9F0] text-center text-xs text-[#697586]">
        Surveillance System • Enterprise CCTV AI Anomaly Detection Platform
      </footer>
    </div>
  );
};

export default Landing;
