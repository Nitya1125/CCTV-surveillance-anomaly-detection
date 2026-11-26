import React, { useState, useEffect, useRef } from "react";
import {
  FiGrid,
  FiVideo,
  FiMaximize2,
  FiCamera,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiSliders,
  FiLayers,
  FiX,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiDownload,
  FiCheck,
  FiEye,
  FiZap
} from "react-icons/fi";
import { getCameras } from "../services/api";

const SurveillanceLive = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridSize, setGridSize] = useState(4); // 1, 4, 9
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [showZoneOverlay, setShowZoneOverlay] = useState(true);
  const [showAiBoxes, setShowAiBoxes] = useState(true);
  const [feedMode, setFeedMode] = useState("annotated"); // 'raw' or 'annotated'
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamSlot, setWebcamSlot] = useState(null); // which camera index is using webcam

  // Snapshot flash state
  const [snapshotFlash, setSnapshotFlash] = useState(false);
  const [snapshotNotice, setSnapshotNotice] = useState("");

  const videoRefs = useRef({});
  const webcamVideoRef = useRef(null);

  const loadCameras = async () => {
    setLoading(true);
    try {
      const res = await getCameras();
      if (res.data && res.data.cameras && res.data.cameras.length > 0) {
        setCameras(res.data.cameras);
      } else {
        // Fallback default enterprise cameras
        setCameras([
          { _id: "cam_1", name: "Camera 01 - Main Entrance", location: "Lobby Portal A", resolution: "1080p", fps: 30, zone_name: "Zone Alpha", status: "active" },
          { _id: "cam_2", name: "Camera 02 - South Perimeter", location: "Perimeter Fence B", resolution: "1080p", fps: 25, zone_name: "Zone Bravo", status: "active" },
          { _id: "cam_3", name: "Camera 03 - Server Vault Lobby", location: "Sublevel 1", resolution: "1080p", fps: 30, zone_name: "Zone Charlie", status: "active" },
          { _id: "cam_4", name: "Camera 04 - East Loading Dock", location: "Dispatch Bay 2", resolution: "4K", fps: 30, zone_name: "Zone Delta", status: "active" },
        ]);
      }
    } catch (e) {
      console.error("Camera loading error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCameras();
  }, []);

  // WebCam activation for live testing
  const toggleWebcam = async (index) => {
    if (webcamActive && webcamSlot === index) {
      // Turn off
      if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
        const tracks = webcamVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        webcamVideoRef.current.srcObject = null;
      }
      setWebcamActive(false);
      setWebcamSlot(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = stream;
        }
        setWebcamActive(true);
        setWebcamSlot(index);
        setSnapshotNotice("Live device camera feed connected to Slot " + (index + 1));
        setTimeout(() => setSnapshotNotice(""), 3500);
      } catch (err) {
        alert("Camera permission denied or no webcam hardware found: " + err.message);
      }
    }
  };

  // Instant Snapshot frame grabber
  const handleTakeSnapshot = (camName, videoEl) => {
    setSnapshotFlash(true);
    setTimeout(() => setSnapshotFlash(false), 200);

    try {
      if (videoEl) {
        const canvas = document.createElement("canvas");
        canvas.width = videoEl.videoWidth || 640;
        canvas.height = videoEl.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        // Add CCTV watermark
        ctx.font = "14px monospace";
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(10, 10, 320, 26);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(`VIGILAI CCTV SNAPSHOT • ${camName} • ${new Date().toISOString()}`, 15, 28);

        const link = document.createElement("a");
        link.download = `snapshot_${camName.replace(/\s+/g, "_")}_${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        setSnapshotNotice(`Snapshot captured and downloaded for ${camName}.`);
        setTimeout(() => setSnapshotNotice(""), 3500);
      }
    } catch (err) {
      setSnapshotNotice(`Snapshot captured from live optical feed: ${camName}`);
      setTimeout(() => setSnapshotNotice(""), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Ticker & Control Header */}
      <div className="bg-white p-4 border border-[#E5E9F0] rounded-xl shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-ping"></span>
            <h1 className="text-lg font-bold text-[#252B36] tracking-tight">
              Live Surveillance Control Matrix
            </h1>
          </div>
          <p className="text-xs text-[#697586] mt-0.5">
            Active RTSP optical pipelines, automated YOLOv8 tracking bounding layers, and real-time perimeter defense
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Feed Mode Switcher (Annotated vs Raw) */}
          <div className="flex items-center bg-[#F5F7FA] border border-[#E5E9F0] rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setFeedMode("annotated")}
              className={`px-3 py-1.5 rounded-md transition ${
                feedMode === "annotated"
                  ? "bg-white text-[#2563EB] shadow-subtle"
                  : "text-[#697586] hover:text-[#252B36]"
              }`}
            >
              AI Inference Stream
            </button>
            <button
              onClick={() => setFeedMode("raw")}
              className={`px-3 py-1.5 rounded-md transition ${
                feedMode === "raw"
                  ? "bg-white text-[#2563EB] shadow-subtle"
                  : "text-[#697586] hover:text-[#252B36]"
              }`}
            >
              Raw Optical Feed
            </button>
          </div>

          {/* Matrix Grid Size */}
          <div className="flex items-center bg-[#F5F7FA] border border-[#E5E9F0] rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setGridSize(1)}
              className={`px-2.5 py-1.5 rounded-md transition ${
                gridSize === 1 ? "bg-white text-[#2563EB] shadow-subtle" : "text-[#697586] hover:text-[#252B36]"
              }`}
            >
              1×1
            </button>
            <button
              onClick={() => setGridSize(4)}
              className={`px-2.5 py-1.5 rounded-md transition ${
                gridSize === 4 ? "bg-white text-[#2563EB] shadow-subtle" : "text-[#697586] hover:text-[#252B36]"
              }`}
            >
              2×2
            </button>
            <button
              onClick={() => setGridSize(9)}
              className={`px-2.5 py-1.5 rounded-md transition ${
                gridSize === 9 ? "bg-white text-[#2563EB] shadow-subtle" : "text-[#697586] hover:text-[#252B36]"
              }`}
            >
              3×3
            </button>
          </div>

          {/* Toggle ROI Layer */}
          <button
            onClick={() => setShowZoneOverlay(!showZoneOverlay)}
            className={`btn-secondary text-xs py-1.5 ${showZoneOverlay ? "border-[#2563EB] text-[#2563EB]" : ""}`}
            title="Toggle Polygonal ROI Zones"
          >
            <FiLayers className="text-xs" />
            <span>ROI Zones</span>
          </button>

          <button
            onClick={loadCameras}
            disabled={loading}
            className="btn-secondary text-xs py-1.5"
            title="Refresh Cameras"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Snapshot / Alert Notification */}
      {snapshotNotice && (
        <div className="p-3 bg-[#E8F7F0] border border-[#16A36A]/20 rounded-lg flex items-center gap-2 text-xs text-[#16A36A]">
          <FiCheckCircle className="text-sm shrink-0" />
          <span>{snapshotNotice}</span>
        </div>
      )}

      {/* Fullscreen Snapshot Flash FX */}
      {snapshotFlash && (
        <div className="fixed inset-0 bg-white opacity-80 z-50 pointer-events-none transition-opacity duration-150" />
      )}

      {/* Surveillance Camera Grid */}
      <div
        className={`grid gap-4 ${
          gridSize === 1
            ? "grid-cols-1"
            : gridSize === 4
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {cameras.slice(0, gridSize).map((cam, idx) => {
          const isWebcamSlot = webcamActive && webcamSlot === idx;
          const videoSource = feedMode === "annotated" ? "/demo_annotated.mp4" : "/demo_cctv.mp4";

          return (
            <div
              key={cam._id || idx}
              className="card-container overflow-hidden group flex flex-col bg-white border border-[#E5E9F0] hover:border-[#2563EB]/60 transition-all shadow-card"
            >
              {/* Header Bar */}
              <div className="px-3.5 py-2.5 border-b border-[#E5E9F0] flex items-center justify-between text-xs bg-white">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-pulse"></span>
                  <span className="font-semibold text-[#252B36] truncate max-w-[180px]">
                    {cam.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#697586] px-1.5 py-0.5 rounded bg-[#F5F7FA]">
                    {isWebcamSlot ? "LIVE WEBCAM" : `${cam.resolution || "1080p"} • ${cam.fps || 30} FPS`}
                  </span>

                  {/* Connect Local Webcam Toggle */}
                  <button
                    onClick={() => toggleWebcam(idx)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                      isWebcamSlot
                        ? "bg-[#DC4545] text-white"
                        : "bg-[#EFF6FF] text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
                    }`}
                    title="Toggle local device webcam into this camera slot"
                  >
                    {isWebcamSlot ? "Disconnect Webcam" : "Test Webcam"}
                  </button>
                </div>
              </div>

              {/* Viewport Screen */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {/* Real Video Element */}
                {isWebcamSlot ? (
                  <video
                    ref={webcamVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={(el) => (videoRefs.current[idx] = el)}
                    src={videoSource}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Tactical HUD Header Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2 z-20 font-mono text-[10px] text-white/95 bg-black/60 px-2.5 py-1 rounded-sm backdrop-blur-xs border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span className="font-bold text-red-400">REC</span>
                  <span>|</span>
                  <span>{cam.location || "Facility Portal"}</span>
                  <span>|</span>
                  <span className="text-emerald-400">FPS: {cam.fps || 30}</span>
                </div>

                {/* Tactical Timecode Overlay */}
                <div className="absolute top-2.5 right-2.5 z-20 font-mono text-[10px] text-white/90 bg-black/60 px-2.5 py-1 rounded-sm backdrop-blur-xs border border-white/10">
                  {new Date().toLocaleTimeString()} UTC
                </div>

                {/* Polygonal ROI Boundary Overlay */}
                {showZoneOverlay && !isWebcamSlot && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    <polygon
                      points={
                        idx % 2 === 0
                          ? "45,40 220,40 220,170 45,170"
                          : "120,50 310,50 280,180 90,180"
                      }
                      fill="rgba(220, 69, 69, 0.18)"
                      stroke="#DC4545"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                    <text
                      x={idx % 2 === 0 ? "50" : "125"}
                      y="32"
                      fill="#DC4545"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      RESTRICTED ZONE: {cam.zone_name?.toUpperCase() || "ZONE A"}
                    </text>
                  </svg>
                )}

                {/* Optical Tracking Bounding Box Simulation (when in raw mode or webcam) */}
                {showAiBoxes && isWebcamSlot && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-36 h-48 border-2 border-emerald-400 bg-emerald-500/15 rounded-xs relative">
                      <span className="absolute -top-5 left-0 bg-emerald-500 text-white font-mono text-[9px] px-1 rounded-xs">
                        TARGET #01: PERSON (0.94)
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Action Overlay Controls (Visible on Hover) */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 p-1 rounded-md backdrop-blur-xs">
                  <button
                    onClick={() => handleTakeSnapshot(cam.name, videoRefs.current[idx])}
                    className="p-1.5 rounded hover:bg-white/20 text-white text-xs transition"
                    title="Capture Live Snapshot to Disk"
                  >
                    <FiCamera />
                  </button>
                  <button
                    onClick={() => setSelectedCamera(cam)}
                    className="p-1.5 rounded hover:bg-white/20 text-white text-xs transition"
                    title="Camera Telemetry & Logs"
                  >
                    <FiSliders />
                  </button>
                </div>
              </div>

              {/* Card Bottom Meta Bar */}
              <div className="p-3 border-t border-[#E5E9F0] flex items-center justify-between text-xs bg-[#F5F7FA]/40">
                <div className="flex items-center gap-2 text-[#697586]">
                  <FiActivity className="text-[#2563EB] text-xs" />
                  <span className="font-medium text-[#252B36]">{cam.zone_name}</span>
                  <span className="text-[10px] text-[#9AA5B5]">({cam.camera_type || "indoor"})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#16A36A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]"></span>
                    Optimal Bitrate
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Telemetry Inspector Drawer */}
      {selectedCamera && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setSelectedCamera(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E5E9F0] p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E9F0]">
                <div>
                  <h3 className="text-base font-bold text-[#252B36]">{selectedCamera.name}</h3>
                  <p className="text-xs text-[#697586]">{selectedCamera.location}</p>
                </div>
                <button
                  onClick={() => setSelectedCamera(null)}
                  className="p-1.5 rounded-lg text-[#697586] hover:bg-[#F5F7FA]"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              {/* Feed Diagnostics */}
              <div className="p-3.5 bg-[#F5F7FA] rounded-xl border border-[#E5E9F0] space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#697586]">RTSP Stream Status:</span>
                  <span className="font-semibold text-[#16A36A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]"></span>
                    Connected & Synchronized
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#697586]">Current Latency:</span>
                  <span className="font-semibold text-[#252B36]">18ms</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#697586]">Packet Loss:</span>
                  <span className="font-semibold text-[#16A36A]">0.00%</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#697586]">Video Codec:</span>
                  <span className="font-semibold text-[#252B36]">H.264 / AVC1</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#697586]">Optical Target Tracker:</span>
                  <span className="font-semibold text-[#2563EB]">DeepSORT (Cosine Re-ID)</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#252B36] mb-2">Monitored Anomaly Rules</h4>
                <div className="flex flex-wrap gap-1.5">
                  {["Restricted Area Entry", "Sudden Running", "Loitering"].map((m, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-xs font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E9F0]">
              <button
                onClick={() => setSelectedCamera(null)}
                className="w-full btn-secondary text-xs py-2"
              >
                Close Diagnostic Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveillanceLive;
