import React, { useState, useEffect } from "react";
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiMessageSquare,
  FiUser,
  FiRefreshCw,
  FiX,
  FiCheck
} from "react-icons/fi";
import { getEvents, updateEventStatus } from "../services/api";

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [notesInput, setNotesInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notice, setNotice] = useState("");

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const res = await getEvents({ limit: 50, sort: "-createdAt" });
      if (res.data?.events) {
        setIncidents(res.data.events);
      }
    } catch (e) {
      console.error("Incidents fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    if (activeTab === "all") return true;
    if (activeTab === "open") return inc.status === "detected";
    if (activeTab === "investigating") return inc.status === "investigating";
    if (activeTab === "resolved") return inc.status === "resolved";
    return true;
  });

  const handleOpenDetail = (inc) => {
    setSelectedIncident(inc);
    setNotesInput(inc.notes || "");
  };

  const handleSaveNotes = async () => {
    if (!selectedIncident) return;
    setSavingNotes(true);
    try {
      await updateEventStatus(selectedIncident._id, { notes: notesInput });
      setSelectedIncident({ ...selectedIncident, notes: notesInput });
      setNotice("Incident notes saved.");
      loadIncidents();
      setTimeout(() => setNotice(""), 3000);
    } catch (e) {
      console.error("Failed to save notes:", e);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedIncident) return;
    try {
      await updateEventStatus(selectedIncident._id, { status });
      setSelectedIncident({ ...selectedIncident, status });
      setNotice(`Incident updated to ${status}.`);
      loadIncidents();
      setTimeout(() => setNotice(""), 3000);
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#252B36] tracking-tight">
            Security Incident Response & Case Audit
          </h1>
          <p className="text-xs text-[#697586] mt-0.5">
            Manage escalated optical anomalies, assign investigation notes, and close security tickets
          </p>
        </div>

        <button onClick={loadIncidents} disabled={loading} className="btn-secondary text-xs">
          <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Tickets</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-[#E8F7F0] border border-[#16A36A]/20 rounded-lg text-xs text-[#16A36A] flex items-center gap-2">
          <FiCheckCircle className="text-sm shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Workflow Tabs */}
      <div className="flex border-b border-[#E5E9F0] gap-4 text-xs font-semibold">
        {[
          { key: "all", label: "All Incidents", count: incidents.length },
          { key: "open", label: "Open / Detected", count: incidents.filter((i) => i.status === "detected").length },
          { key: "investigating", label: "In Investigation", count: incidents.filter((i) => i.status === "investigating").length },
          { key: "resolved", label: "Closed / Resolved", count: incidents.filter((i) => i.status === "resolved").length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2.5 flex items-center gap-2 transition border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#697586] hover:text-[#252B36]"
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#F5F7FA] border border-[#E5E9F0]">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Incident Cards List */}
      {filteredIncidents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIncidents.map((inc) => (
            <div
              key={inc._id}
              onClick={() => handleOpenDetail(inc)}
              className="card-container p-4 hover:border-[#2563EB] cursor-pointer transition flex flex-col justify-between bg-white group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#9AA5B5]">INC-{inc._id.slice(-6).toUpperCase()}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      inc.risk_level === "high" || inc.risk_level === "critical"
                        ? "bg-[#FDF2F2] text-[#DC4545] border border-[#DC4545]/20"
                        : inc.risk_level === "medium"
                        ? "bg-[#FEF7ED] text-[#E59A23] border border-[#E59A23]/20"
                        : "bg-[#E8F7F0] text-[#16A36A] border border-[#16A36A]/20"
                    }`}
                  >
                    {inc.risk_level} Risk
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[#252B36] group-hover:text-[#2563EB] transition-colors capitalize">
                  {inc.event_type?.replace(/_/g, " ")}
                </h3>

                <p className="text-xs text-[#697586] mt-1 flex items-center gap-1.5">
                  <FiClock className="text-xs shrink-0" />
                  <span>{new Date(inc.createdAt).toLocaleString()}</span>
                </p>

                {inc.notes && (
                  <p className="mt-2 text-xs text-[#697586] bg-[#F5F7FA] p-2 rounded border border-[#E5E9F0] line-clamp-2">
                    {inc.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E9F0] flex items-center justify-between text-xs">
                <span className="text-[#697586]">{inc.camera_name || "Camera 01"}</span>
                <span
                  className={`text-[11px] font-semibold capitalize ${
                    inc.status === "resolved"
                      ? "text-[#16A36A]"
                      : inc.status === "investigating"
                      ? "text-[#2563EB]"
                      : "text-[#DC4545]"
                  }`}
                >
                  {inc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-container p-12 text-center bg-white">
          <FiCheckCircle className="mx-auto text-3xl text-[#16A36A] mb-2" />
          <h3 className="text-xs font-semibold text-[#252B36]">No Incidents in this View</h3>
          <p className="text-xs text-[#697586] mt-0.5">All tickets matching this filter have been handled.</p>
        </div>
      )}

      {/* Incident Detail Drawer Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setSelectedIncident(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-[#E5E9F0] p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E9F0]">
                <div>
                  <span className="text-[10px] font-mono text-[#9AA5B5]">
                    INC-{selectedIncident._id.slice(-6).toUpperCase()}
                  </span>
                  <h3 className="text-base font-bold text-[#252B36] capitalize">
                    {selectedIncident.event_type?.replace(/_/g, " ")}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="p-1.5 rounded-lg text-[#697586] hover:bg-[#F5F7FA]"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#E5E9F0]">
                  <span className="text-[#697586] block text-[10px]">Threat Level</span>
                  <span className="font-semibold text-[#DC4545] capitalize">{selectedIncident.risk_level}</span>
                </div>
                <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#E5E9F0]">
                  <span className="text-[#697586] block text-[10px]">Current Status</span>
                  <span className="font-semibold text-[#252B36] capitalize">{selectedIncident.status}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div>
                <label className="block text-xs font-semibold text-[#252B36] mb-2">Update Incident Workflow</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus("investigating")}
                    className={`p-2 rounded-lg border text-xs font-medium transition ${
                      selectedIncident.status === "investigating"
                        ? "bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]"
                        : "border-[#E5E9F0] text-[#697586] hover:bg-[#F5F7FA]"
                    }`}
                  >
                    Investigate
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("resolved")}
                    className={`p-2 rounded-lg border text-xs font-medium transition ${
                      selectedIncident.status === "resolved"
                        ? "bg-[#E8F7F0] border-[#16A36A] text-[#16A36A]"
                        : "border-[#E5E9F0] text-[#697586] hover:bg-[#F5F7FA]"
                    }`}
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("false_alarm")}
                    className={`p-2 rounded-lg border text-xs font-medium transition ${
                      selectedIncident.status === "false_alarm"
                        ? "bg-[#F5F7FA] border-[#9AA5B5] text-[#252B36]"
                        : "border-[#E5E9F0] text-[#697586] hover:bg-[#F5F7FA]"
                    }`}
                  >
                    False Alarm
                  </button>
                </div>
              </div>

              {/* Investigator Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#252B36] mb-1.5">
                  Security Operator & Investigation Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Record forensic observations, security interventions, or false positive reason..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="input-field text-xs py-2"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="btn-primary text-xs py-1.5"
                  >
                    {savingNotes ? "Saving..." : "Save Case Notes"}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E9F0]">
              <button
                onClick={() => setSelectedIncident(null)}
                className="w-full btn-secondary text-xs"
              >
                Close Case Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
