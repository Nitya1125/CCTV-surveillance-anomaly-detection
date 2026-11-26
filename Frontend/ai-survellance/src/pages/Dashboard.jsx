import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiActivity,
  FiArrowUpRight,
  FiRefreshCw,
  FiVideo,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiPlay,
  FiZap,
  FiLayers,
  FiEye,
  FiUserCheck,
  FiTrendingUp,
  FiFileText
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { getDashboardStats, getEventStats } from "../services/api";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalIncidents: 0,
    criticalAlerts: 0,
    totalUsers: 0,
    eventsByType: [],
    recentEvents: [],
    recentVideos: []
  });
  const [trends, setTrends] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, eventRes] = await Promise.allSettled([
        getDashboardStats(),
        getEventStats()
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value.data) {
        setStats((prev) => ({
          ...prev,
          ...dashRes.value.data
        }));
      }

      if (eventRes.status === "fulfilled" && eventRes.value.data) {
        if (eventRes.value.data.trends) {
          setTrends(eventRes.value.data.trends);
        }
      }
    } catch (e) {
      console.error("Dashboard data fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSeverityBadge = (level) => {
    switch (level?.toLowerCase()) {
      case "critical":
      case "high":
        return <span className="badge-critical capitalize">{level}</span>;
      case "medium":
        return <span className="badge-warning capitalize">{level}</span>;
      default:
        return <span className="badge-success capitalize">{level || "Low"}</span>;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-[#E5E9F0] rounded-xl shadow-lg text-sm">
          <p className="font-semibold text-[#252B36] mb-1.5">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="flex items-center gap-2 text-[#697586]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="font-medium">{entry.name}: </span>
              <span className="font-bold text-[#252B36]">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const latestVideo = stats.recentVideos && stats.recentVideos.length > 0 ? stats.recentVideos[0] : null;

  return (
    <div className="space-y-8">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#252B36] tracking-tight">
            Surveillance Command Console
          </h1>
          <p className="text-sm sm:text-base text-[#697586] mt-1">
            Real-time optical anomaly detection, ROI polygon defense, and human tracking intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="btn-secondary text-sm"
            title="Refresh Telemetry"
          >
            <FiRefreshCw className={`text-base ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Telemetry</span>
          </button>

          <Link to="/upload" className="btn-primary text-sm">
            <FiVideo className="text-base" />
            <span>Ingest CCTV Footage</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid with Distinct Editorial Styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Processed Videos */}
        <div className="bg-white p-6 border border-[#E5E9F0] border-t-4 border-t-[#2563EB] rounded-2xl shadow-subtle hover:border-[#D0D7E2] transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-[#697586]">Archived Footage</span>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <FiVideo className="text-lg" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#252B36]">{stats.totalVideos}</span>
            <span className="text-sm font-medium text-[#697586]">recordings analyzed</span>
          </div>
          <div className="mt-3.5 flex items-center gap-2 text-sm text-[#16A36A]">
            <FiCheckCircle className="text-base shrink-0" />
            <span className="font-medium">YOLOv8 + DeepSORT indexed</span>
          </div>
        </div>

        {/* Card 2: Total Security Events */}
        <div className="bg-white p-6 border border-[#E5E9F0] border-t-4 border-t-[#697586] rounded-2xl shadow-subtle hover:border-[#D0D7E2] transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-[#697586]">Logged Anomalies</span>
            <div className="w-10 h-10 rounded-xl bg-[#F5F7FA] text-[#252B36] flex items-center justify-center">
              <FiActivity className="text-lg" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#252B36]">{stats.totalIncidents}</span>
            <span className="text-sm font-medium text-[#697586]">incidents total</span>
          </div>
          <div className="mt-3.5 flex items-center gap-2 text-sm text-[#697586]">
            <FiLayers className="text-base shrink-0" />
            <span>Monitored across ROI zones</span>
          </div>
        </div>

        {/* Card 3: High-Risk Alerts */}
        <div className="bg-white p-6 border border-[#E5E9F0] border-t-4 border-t-[#DC4545] rounded-2xl shadow-subtle hover:border-[#D0D7E2] transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-[#697586]">High-Risk Alerts</span>
            <div className="w-10 h-10 rounded-xl bg-[#FDF2F2] text-[#DC4545] flex items-center justify-center">
              <FiAlertCircle className="text-lg" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#DC4545]">{stats.criticalAlerts}</span>
            <span className="text-sm font-medium text-[#697586]">require review</span>
          </div>
          <div className="mt-3.5 flex items-center gap-2 text-sm text-[#DC4545]">
            <span className="w-2 h-2 rounded-full bg-[#DC4545] shrink-0"></span>
            <span className="font-semibold">Restricted zone breaches</span>
          </div>
        </div>

        {/* Card 4: Organization Operators */}
        <div className="bg-white p-6 border border-[#E5E9F0] border-t-4 border-t-[#16A36A] rounded-2xl shadow-subtle hover:border-[#D0D7E2] transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-[#697586]">Active Team</span>
            <div className="w-10 h-10 rounded-xl bg-[#E8F7F0] text-[#16A36A] flex items-center justify-center">
              <FiUserCheck className="text-lg" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#252B36]">{stats.totalUsers}</span>
            <span className="text-sm font-medium text-[#697586]">authorized operators</span>
          </div>
          <div className="mt-3.5 flex items-center gap-2 text-sm text-[#16A36A]">
            <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-pulse"></span>
            <span className="font-medium">RBAC access enforced</span>
          </div>
        </div>
      </div>

      {/* Spotlight: Latest Ingested CCTV Footage Showcase */}
      <div className="bg-white p-6 sm:p-7 border border-[#E5E9F0] rounded-2xl shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
              <h2 className="text-lg font-bold text-[#252B36]">Latest Analyzed CCTV Ingestion</h2>
            </div>
            <p className="text-sm text-[#697586] mt-1">
              Direct optical replay of the most recently evaluated footage with AI annotation
            </p>
          </div>

          {latestVideo && (
            <Link to="/videos" className="btn-secondary text-sm">
              <FiEye className="text-base" />
              <span>Inspect All Archives</span>
            </Link>
          )}
        </div>

        {latestVideo ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Video Playback Container */}
            <div className="lg:col-span-2 relative aspect-video bg-black rounded-xl overflow-hidden border border-[#E5E9F0] shadow-sm flex items-center justify-center">
              {latestVideo.annotated_video_url ? (
                <video
                  src={`http://localhost:5000${latestVideo.annotated_video_url}`}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <FiVideo className="text-4xl mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Processed video stream rendering</p>
                </div>
              )}

              {/* Watermark HUD */}
              <div className="absolute top-3 left-3 bg-black/70 px-3 py-1.5 rounded-lg text-white font-mono text-xs backdrop-blur-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-white">{latestVideo.camera_name || "Surveillance Feed"}</span>
                <span>•</span>
                <span className="text-slate-300 capitalize">{latestVideo.processing_status}</span>
              </div>
            </div>

            {/* Video Metadata & Anomaly Quick Summary */}
            <div className="space-y-4 p-5 rounded-xl bg-[#F5F7FA] border border-[#E5E9F0]">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#697586] uppercase tracking-wider">Feed Identification</span>
                <h3 className="text-base font-bold text-[#252B36]">{latestVideo.camera_name || "Camera Ingestion"}</h3>
                <p className="text-xs text-[#697586]">
                  Uploaded {latestVideo.createdAt ? new Date(latestVideo.createdAt).toLocaleString() : "Recently"}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E5E9F0] space-y-2">
                <span className="text-xs font-bold text-[#697586] uppercase tracking-wider">Detected Anomalies</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-[#252B36]">
                    {latestVideo.events?.length || 0}
                  </span>
                  <span className="text-xs text-[#697586]">security events flagged in this clip</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E9F0]">
                <Link
                  to="/alerts"
                  className="btn-primary w-full text-center text-sm"
                >
                  <span>Review Associated Alerts</span>
                  <FiArrowUpRight className="text-base" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-14 px-6 text-center rounded-xl bg-[#F5F7FA]/70 border border-dashed border-[#D0D7E2]">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E9F0] text-[#2563EB] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FiVideo className="text-2xl" />
            </div>
            <h3 className="text-base font-bold text-[#252B36]">No CCTV Footage Ingested Yet</h3>
            <p className="text-sm text-[#697586] mt-1.5 max-w-md mx-auto">
              Upload your security CCTV video files to calibrate polygon zones and run deep neural threat detection.
            </p>
            <div className="mt-5">
              <Link to="/upload" className="btn-primary text-sm">
                <FiVideo className="text-base" />
                <span>Upload First Video Recording</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: 7-Day Trend */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 border border-[#E5E9F0] rounded-2xl shadow-subtle">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-[#252B36]">7-Day Incident Trendline</h2>
              <p className="text-sm text-[#697586]">Daily detection volume captured by AI anomaly pipeline</p>
            </div>
            <Link to="/analytics" className="text-sm text-[#2563EB] hover:underline flex items-center gap-1 font-semibold">
              <span>Full Analytics</span>
              <FiArrowUpRight />
            </Link>
          </div>

          <div className="h-72 w-full">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incidentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9F0" />
                  <XAxis dataKey="date" stroke="#9AA5B5" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9AA5B5" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="incidents"
                    name="Incidents"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#incidentGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#9AA5B5] text-sm">
                <FiTrendingUp className="text-4xl mb-3 stroke-1 text-[#9AA5B5]" />
                <span className="font-medium">No trend history available yet</span>
                <span className="text-xs text-[#9AA5B5] mt-1">Trends will populate as footage is analyzed</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Threat Distribution Breakdown */}
        <div className="bg-white p-6 sm:p-7 border border-[#E5E9F0] rounded-2xl shadow-subtle flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[#252B36]">Anomaly Classification</h2>
            <p className="text-sm text-[#697586] mb-5">Distribution by AI detection rules</p>
          </div>

          <div className="h-56 w-full">
            {stats.eventsByType && stats.eventsByType.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.eventsByType} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9F0" />
                  <XAxis dataKey="name" stroke="#9AA5B5" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9AA5B5" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Detections" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#9AA5B5] text-sm">
                <FiShield className="text-4xl mb-3 stroke-1 text-[#9AA5B5]" />
                <span className="font-medium">Zero classified threats</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E5E9F0] grid grid-cols-3 text-center text-sm">
            <div>
              <span className="block text-[#697586] text-xs font-medium">Restricted Area</span>
              <span className="font-bold text-[#DC4545] text-base">
                {stats.eventsByType?.find((e) => e.name === "Restricted Area")?.value || 0}
              </span>
            </div>
            <div>
              <span className="block text-[#697586] text-xs font-medium">Sudden Run</span>
              <span className="font-bold text-[#E59A23] text-base">
                {stats.eventsByType?.find((e) => e.name === "Sudden Running")?.value || 0}
              </span>
            </div>
            <div>
              <span className="block text-[#697586] text-xs font-medium">Loitering</span>
              <span className="font-bold text-[#2563EB] text-base">
                {stats.eventsByType?.find((e) => e.name === "Loitering")?.value || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts Feed Table */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl shadow-subtle overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#E5E9F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#252B36]">Active Security Alert Feed</h2>
            <p className="text-sm text-[#697586]">Autonomous incidents flagged across monitored surveillance clips</p>
          </div>
          <Link to="/alerts" className="btn-secondary text-sm">
            <span>View All Alerts</span>
            <FiArrowUpRight className="text-base" />
          </Link>
        </div>

        {stats.recentEvents && stats.recentEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7FA] text-[#697586] font-semibold border-b border-[#E5E9F0]">
                <tr>
                  <th className="py-3.5 px-5">Event Classification</th>
                  <th className="py-3.5 px-5">Surveillance Feed</th>
                  <th className="py-3.5 px-5">Threat Level</th>
                  <th className="py-3.5 px-5">Track Target ID</th>
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9F0] text-[#252B36]">
                {stats.recentEvents.map((evt, idx) => (
                  <tr key={evt._id || idx} className="hover:bg-[#F5F7FA]/70 transition-colors">
                    <td className="py-4 px-5 font-semibold flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DC4545]"></span>
                      <span className="capitalize">{evt.event_type?.replace(/_/g, " ")}</span>
                    </td>
                    <td className="py-4 px-5 text-[#697586] font-medium">{evt.camera_name || "Surveillance Clip"}</td>
                    <td className="py-4 px-5">{getSeverityBadge(evt.risk_level)}</td>
                    <td className="py-4 px-5 font-mono text-[#697586]">#{evt.person_id || "1"}</td>
                    <td className="py-4 px-5 text-[#697586]">
                      {evt.createdAt ? new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        to="/alerts"
                        className="text-[#2563EB] hover:text-[#1D4ED8] font-bold text-sm inline-flex items-center gap-1"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FiCheckCircle className="mx-auto text-4xl text-[#16A36A] mb-3" />
            <h3 className="text-base font-bold text-[#252B36]">All Zones Clear</h3>
            <p className="text-sm text-[#697586] mt-1 max-w-sm mx-auto">
              No unauthorized breaches or anomalies detected in the current monitoring cycle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
