import React, { useState, useEffect } from "react";
import {
  FiBarChart2,
  FiActivity,
  FiShield,
  FiClock,
  FiCheckCircle,
  FiDownload,
  FiRefreshCw,
  FiVideo,
  FiAlertCircle
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { getEventStats, getDashboardStats } from "../services/api";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byType: [],
    bySeverity: [],
    byStatus: {},
    trends: []
  });
  const [dashStats, setDashStats] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventRes, dashRes] = await Promise.allSettled([
        getEventStats(),
        getDashboardStats()
      ]);

      if (eventRes.status === "fulfilled" && eventRes.value.data) {
        setStats(eventRes.value.data);
      }
      if (dashRes.status === "fulfilled" && dashRes.value.data) {
        setDashStats(dashRes.value.data);
      }
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const SEVERITY_COLORS = ["#DC4545", "#E59A23", "#2563EB", "#16A36A"];

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

  const handleDownloadReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      organization: localStorage.getItem("org_name"),
      totalIncidents: stats.total,
      breakdownByType: stats.byType,
      breakdownBySeverity: stats.bySeverity,
      statusWorkflow: stats.byStatus
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", jsonStr);
    dlAnchorElem.setAttribute("download", `security_audit_report_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#252B36] tracking-tight">
            Telemetry & Optical Anomaly Reports
          </h1>
          <p className="text-sm sm:text-base text-[#697586] mt-1">
            Statistical distribution, dwell duration telemetry, and perimeter security performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadReport}
            className="btn-secondary text-sm"
            title="Download JSON Report"
          >
            <FiDownload className="text-base" />
            <span>Download Audit Report</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="btn-secondary text-sm"
            title="Refresh Metrics"
          >
            <FiRefreshCw className={`text-base ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 border border-[#E5E9F0] rounded-2xl shadow-subtle">
          <span className="text-sm font-semibold text-[#697586] block mb-2">Total Ingested Events</span>
          <span className="text-3xl font-extrabold text-[#252B36]">{stats.total || 0}</span>
          <span className="text-xs text-[#16A36A] font-semibold block mt-3">100% indexed in audit log</span>
        </div>

        <div className="bg-white p-6 border border-[#E5E9F0] rounded-2xl shadow-subtle">
          <span className="text-sm font-semibold text-[#697586] block mb-2">Case Resolution Rate</span>
          <span className="text-3xl font-extrabold text-[#16A36A]">
            {stats.total > 0
              ? `${Math.round(((stats.byStatus?.resolved || 0) / stats.total) * 100)}%`
              : "100%"}
          </span>
          <span className="text-xs text-[#697586] font-medium block mt-3">
            {stats.byStatus?.resolved || 0} cases marked closed
          </span>
        </div>

        <div className="bg-white p-6 border border-[#E5E9F0] rounded-2xl shadow-subtle">
          <span className="text-sm font-semibold text-[#697586] block mb-2">Footage Archives</span>
          <span className="text-3xl font-extrabold text-[#2563EB]">{dashStats.totalVideos || 0}</span>
          <span className="text-xs text-[#697586] font-medium block mt-3">Ingested surveillance recordings</span>
        </div>

        <div className="bg-white p-6 border border-[#E5E9F0] rounded-2xl shadow-subtle">
          <span className="text-sm font-semibold text-[#697586] block mb-2">High Severity Ratio</span>
          <span className="text-3xl font-extrabold text-[#DC4545]">
            {stats.total > 0
              ? `${Math.round(((dashStats.criticalAlerts || 0) / stats.total) * 100)}%`
              : "0%"}
          </span>
          <span className="text-xs text-[#DC4545] font-semibold block mt-3">Restricted boundary triggers</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 7-Day Trend */}
        <div className="bg-white p-6 sm:p-7 border border-[#E5E9F0] rounded-2xl shadow-subtle">
          <div className="mb-5">
            <h2 className="text-base font-bold text-[#252B36]">7-Day Anomaly Frequency</h2>
            <p className="text-sm text-[#697586] mt-0.5">Volumetric distribution over the past 7 days</p>
          </div>

          <div className="h-72 w-full">
            {stats.trends && stats.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
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
                    fill="url(#analyticsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#9AA5B5]">
                No trend telemetry available
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Threat Severity Donut */}
        <div className="bg-white p-6 sm:p-7 border border-[#E5E9F0] rounded-2xl shadow-subtle">
          <div className="mb-5">
            <h2 className="text-base font-bold text-[#252B36]">Severity Classification Share</h2>
            <p className="text-sm text-[#697586] mt-0.5">Critical, High, Medium, and Low risk allocation</p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {stats.bySeverity && stats.bySeverity.some((s) => s.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.bySeverity}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.bySeverity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={10}
                    formatter={(val) => <span className="text-sm text-[#697586] font-medium">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-[#9AA5B5] flex flex-col items-center">
                <FiShield className="text-4xl mb-3 stroke-1 text-[#9AA5B5]" />
                <span>Severity distribution populated upon footage analysis</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
