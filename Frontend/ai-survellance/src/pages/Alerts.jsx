import React, { useState, useEffect } from "react";
import {
  FiAlertTriangle,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiTrash2,
  FiDownload,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import { getEvents, updateEventStatus, deleteEvent } from "../services/api";

const Alerts = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [notice, setNotice] = useState("");

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await getEvents({
        page,
        limit: 12,
        search,
        event_type: filterType,
        risk_level: filterSeverity,
        status: filterStatus
      });

      if (res.data) {
        setEvents(res.data.events || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (e) {
      console.error("Alerts fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [page, filterType, filterSeverity, filterStatus]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateEventStatus(id, { status: newStatus });
      setNotice(`Incident status updated to ${newStatus}.`);
      loadAlerts();
      setTimeout(() => setNotice(""), 3000);
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this security alert record?")) return;
    try {
      await deleteEvent(id);
      setNotice("Alert record removed.");
      loadAlerts();
      setTimeout(() => setNotice(""), 3000);
    } catch (e) {
      console.error("Failed to delete alert:", e);
    }
  };

  const getSeverityBadge = (level) => {
    switch (level?.toLowerCase()) {
      case "critical":
        return <span className="badge-critical capitalize">Critical</span>;
      case "high":
        return <span className="badge-critical capitalize">High</span>;
      case "medium":
        return <span className="badge-warning capitalize">Medium</span>;
      default:
        return <span className="badge-success capitalize">Low</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "resolved":
        return <span className="badge-success">Resolved</span>;
      case "investigating":
        return <span className="badge-warning">Investigating</span>;
      case "false_alarm":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">False Alarm</span>;
      default:
        return <span className="badge-critical">Detected</span>;
    }
  };

  const handleExportCSV = () => {
    if (events.length === 0) return;
    const headers = ["Timestamp", "Camera", "Event Type", "Severity", "Target ID", "Status"];
    const rows = events.map((e) => [
      new Date(e.createdAt).toISOString(),
      `"${e.camera_name}"`,
      `"${e.event_type}"`,
      e.risk_level,
      e.person_id,
      e.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `surveillance_system_alerts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#252B36] tracking-tight">
            Security Anomaly Alerts Feed
          </h1>
          <p className="text-sm sm:text-base text-[#697586] mt-1">
            Real-time optical anomaly detection audit log across facility boundaries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="btn-secondary text-sm"
            title="Export CSV"
          >
            <FiDownload className="text-base" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={loadAlerts}
            disabled={loading}
            className="btn-secondary text-sm"
            title="Refresh"
          >
            <FiRefreshCw className={`text-base ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-4 bg-[#E8F7F0] border border-[#16A36A]/20 rounded-xl text-sm font-medium text-[#16A36A] flex items-center gap-2.5">
          <FiCheckCircle className="text-lg shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 border border-[#E5E9F0] rounded-2xl shadow-subtle flex flex-col md:flex-row gap-4 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadAlerts();
          }}
          className="relative w-full md:w-72"
        >
          <input
            type="text"
            placeholder="Search alerts or camera..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 text-sm"
          />
          <FiSearch className="absolute left-3.5 top-3 text-[#9AA5B5] text-base" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter Event Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field text-sm w-full sm:w-44 cursor-pointer"
          >
            <option value="all">All Anomaly Types</option>
            <option value="restricted_area_entry">Restricted Area</option>
            <option value="sudden_running">Sudden Run</option>
            <option value="loitering">Loitering</option>
          </select>

          {/* Filter Severity */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="input-field text-sm w-full sm:w-36 cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical / High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field text-sm w-full sm:w-36 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="detected">Detected</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="false_alarm">False Alarm</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl shadow-subtle overflow-hidden">
        {events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7FA] text-[#697586] font-semibold border-b border-[#E5E9F0]">
                <tr>
                  <th className="py-4 px-5">Event Classification</th>
                  <th className="py-4 px-5">Surveillance Feed</th>
                  <th className="py-4 px-5">Severity</th>
                  <th className="py-4 px-5">Track ID & Time</th>
                  <th className="py-4 px-5">Workflow Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9F0] text-[#252B36]">
                {events.map((evt) => (
                  <tr key={evt._id} className="hover:bg-[#F5F7FA]/70 transition-colors">
                    <td className="py-4 px-5 font-bold text-[#252B36]">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#DC4545]"></span>
                        <span className="capitalize">{evt.event_type?.replace(/_/g, " ")}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-[#697586] font-medium">{evt.camera_name || "Surveillance Clip"}</td>
                    <td className="py-4 px-5">{getSeverityBadge(evt.risk_level)}</td>
                    <td className="py-4 px-5 text-[#697586]">
                      <span className="font-mono text-[#252B36] font-bold">#{evt.person_id || 1}</span>
                      <span className="text-xs text-[#9AA5B5] ml-2">
                        @ {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-4 px-5">{getStatusBadge(evt.status)}</td>
                    <td className="py-4 px-5 text-right space-x-2">
                      {evt.status !== "resolved" && (
                        <button
                          onClick={() => handleStatusChange(evt._id, "resolved")}
                          className="px-3 py-1.5 rounded-lg bg-[#E8F7F0] text-[#16A36A] hover:bg-[#16A36A] hover:text-white transition font-semibold text-xs"
                          title="Resolve Alert"
                        >
                          Resolve
                        </button>
                      )}
                      {evt.status === "detected" && (
                        <button
                          onClick={() => handleStatusChange(evt._id, "investigating")}
                          className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition font-semibold text-xs"
                          title="Investigate"
                        >
                          Investigate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(evt._id)}
                        className="p-2 rounded-lg text-[#9AA5B5] hover:text-[#DC4545] hover:bg-[#FDF2F2] transition"
                        title="Delete Alert Record"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-14 text-center">
            <FiCheckCircle className="mx-auto text-4xl text-[#16A36A] mb-3" />
            <h3 className="text-base font-bold text-[#252B36]">No Alerts Matching Filters</h3>
            <p className="text-sm text-[#697586] mt-1">Try relaxing your filter parameters or search terms.</p>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E5E9F0] flex items-center justify-between text-sm text-[#697586] bg-[#F5F7FA]/50">
            <span>
              Showing page <strong className="text-[#252B36]">{page}</strong> of <strong className="text-[#252B36]">{totalPages}</strong> ({total} total alerts)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-[#E5E9F0] bg-white disabled:opacity-40 hover:bg-[#F5F7FA] transition"
              >
                <FiChevronLeft className="text-base" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-[#E5E9F0] bg-white disabled:opacity-40 hover:bg-[#F5F7FA] transition"
              >
                <FiChevronRight className="text-base" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
