import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiUploadCloud,
  FiVideo,
  FiCheck,
  FiAlertTriangle,
  FiRotateCcw,
  FiShield,
  FiActivity,
  FiCheckCircle,
  FiPlay,
  FiPause,
  FiArrowRight,
  FiFileText,
  FiLayers,
  FiCpu,
  FiMaximize2,
  FiRefreshCw
} from "react-icons/fi";
import { uploadVideo } from "../services/api";

const VideoUpload = () => {
  const [feedLabel, setFeedLabel] = useState("Surveillance Sector Alpha");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState(["Restricted Area", "Sudden Run", "Loitering"]);

  // Canvas Drawing for Restricted Area polygon
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [zone, setZone] = useState(null); // {x, y, w, h}

  // Live Playback & AI Processing States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processedResult, setProcessedResult] = useState(null);

  // Real-time analysis simulation state while video plays
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveScanLine, setLiveScanLine] = useState(0);
  const [currentFps, setCurrentFps] = useState(30);

  // Simulated live event tracker while processing
  const [simulatedDetections, setSimulatedDetections] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please upload a valid CCTV video file (.mp4, .avi, .mov, .mkv).");
      return;
    }

    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setZone(null);
    setProcessedResult(null);
    setSimulatedDetections([]);
    setError("");
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const toggleActivity = (activity) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter((a) => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  // Video time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      setLiveScanLine((cur * 40) % 100);

      // Random jitter for FPS telemetry display
      setCurrentFps(Math.floor(29 + Math.random() * 2));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Canvas zone drawing handlers
  const startDrawing = (e) => {
    if (loading || !selectedActivities.includes("Restricted Area") || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPoint({ x, y });
    setDrawing(true);
  };

  const drawZone = (e) => {
    if (!drawing || !startPoint || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = currentX - startPoint.x;
    const height = currentY - startPoint.y;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#DC4545";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(startPoint.x, startPoint.y, width, height);
    ctx.fillStyle = "rgba(220, 69, 69, 0.25)";
    ctx.fillRect(startPoint.x, startPoint.y, width, height);
  };

  const stopDrawing = (e) => {
    if (!drawing || !startPoint || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const x = Math.min(startPoint.x, endX);
    const y = Math.min(startPoint.y, endY);
    const w = Math.abs(endX - startPoint.x);
    const h = Math.abs(endY - startPoint.y);

    if (w > 10 && h > 10) {
      setZone({ x, y, w, h });
    }
    setDrawing(false);
  };

  const resetZone = () => {
    setZone(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Execute Analysis & Play In Sync
  const handleUploadAndAnalyze = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError("Please select a surveillance video file to process.");
      return;
    }

    setError("");
    setLoading(true);
    setProcessedResult(null);

    // Auto-play the video on screen so user observes the analysis in real-time
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("selectedActivities", JSON.stringify(selectedActivities));
      formData.append("cameraName", feedLabel || "Surveillance Clip");

      // Calculate 4-point polygon coordinates
      let polygon = null;
      if (zone) {
        polygon = [
          [Math.round(zone.x), Math.round(zone.y)],
          [Math.round(zone.x + zone.w), Math.round(zone.y)],
          [Math.round(zone.x + zone.w), Math.round(zone.y + zone.h)],
          [Math.round(zone.x), Math.round(zone.y + zone.h)]
        ];
      }
      formData.append("zoneCoordinates", JSON.stringify(polygon));

      const res = await uploadVideo(formData);
      setProcessedResult(res.data.video);

      // When backend completes, pause original and jump to completed view
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "AI Analysis Pipeline encountered an error.");
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatSec = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#252B36] tracking-tight">
          Video Ingestion & Real-Time AI Analysis
        </h1>
        <p className="text-sm sm:text-base text-[#697586] mt-1">
          Ingest CCTV surveillance recordings, calibrate optical ROI polygons, watch synchronous execution, and inspect AI anomaly telemetry
        </p>
      </div>

      {error && (
        <div className="p-4 bg-[#FDF2F2] border border-[#DC4545]/20 rounded-xl flex items-center gap-3 text-sm font-medium text-[#DC4545]">
          <FiAlertTriangle className="text-lg shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Viewport & Calibration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Video Viewport & Scanning HUD */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 border border-[#E5E9F0] rounded-2xl shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${loading ? "bg-amber-500 animate-ping" : isPlaying ? "bg-[#16A36A] animate-pulse" : "bg-[#2563EB]"}`} />
                <h2 className="text-base font-bold text-[#252B36]">
                  {loading ? "Optical Inference Engine In Progress..." : "Live Surveillance Viewport"}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {zone && !loading && (
                  <button
                    type="button"
                    onClick={resetZone}
                    className="btn-secondary text-xs py-1.5"
                  >
                    <FiRotateCcw className="text-sm" />
                    <span>Clear Zone</span>
                  </button>
                )}
                {videoPreviewUrl && (
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="btn-secondary text-xs py-1.5"
                  >
                    {isPlaying ? <FiPause className="text-sm" /> : <FiPlay className="text-sm" />}
                    <span>{isPlaying ? "Pause Feed" : "Play Feed"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Video + Canvas Interactive Area with HUD Overlay */}
            <div className="relative aspect-video bg-[#0B0F19] rounded-xl overflow-hidden border border-[#E5E9F0] flex items-center justify-center shadow-inner group">
              {videoPreviewUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoPreviewUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                    className="w-full h-full object-contain"
                  />

                  {/* Restricted Area Drawing Canvas */}
                  {selectedActivities.includes("Restricted Area") && (
                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={360}
                      onMouseDown={startDrawing}
                      onMouseMove={drawZone}
                      onMouseUp={stopDrawing}
                      className={`absolute inset-0 w-full h-full z-10 ${loading ? "pointer-events-none" : "cursor-crosshair"}`}
                    />
                  )}

                  {/* Active Analysis HUD Watermark */}
                  <div className="absolute top-3 left-3 bg-black/75 px-3 py-1.5 rounded-lg text-white font-mono text-xs backdrop-blur-xs flex items-center gap-2.5 z-20">
                    <span className={`w-2 h-2 rounded-full ${loading ? "bg-red-500 animate-ping" : "bg-emerald-400"}`} />
                    <span className="font-bold text-white uppercase tracking-wider">
                      {loading ? "AI ANALYSIS RUNNING" : "CCTV INGEST"}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-200">{feedLabel}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-emerald-400">{currentFps} FPS</span>
                  </div>

                  {/* Timestamp & Codec Header */}
                  <div className="absolute top-3 right-3 bg-black/75 px-3 py-1.5 rounded-lg text-white font-mono text-xs backdrop-blur-xs z-20">
                    <span>{formatSec(currentTime)}</span> / <span>{formatSec(duration)}</span>
                  </div>

                  {/* Scanning Laser Line when Loading */}
                  {loading && (
                    <div
                      className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#2563EB] to-transparent shadow-[0_0_12px_#2563EB] z-20 transition-all pointer-events-none"
                      style={{ top: `${liveScanLine}%` }}
                    />
                  )}

                  {/* Corner Target Reticles */}
                  <div className="absolute bottom-3 left-3 bg-black/75 px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 z-20">
                    YOLOv8 + DeepSORT v2.0
                  </div>
                </>
              ) : (
                <div className="text-center p-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                    <FiVideo className="text-3xl text-slate-400 stroke-1" />
                  </div>
                  <p className="text-base font-semibold text-white">No Footage Loaded</p>
                  <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                    Select a CCTV surveillance video file on the right to calibrate coordinates and execute real-time AI inference.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Active Calibration Bar */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-[#F5F7FA] rounded-xl border border-[#E5E9F0] text-sm">
            {zone ? (
              <span className="font-mono text-[#252B36]">
                Calibrated ROI: [{Math.round(zone.x)}, {Math.round(zone.y)}] — {Math.round(zone.w)}×{Math.round(zone.h)}px
              </span>
            ) : (
              <span className="text-[#697586]">
                Draw a box on the video frame above to configure an active Restricted Boundary.
              </span>
            )}
            <span className={zone ? "badge-success text-xs" : "badge-neutral text-xs"}>
              {zone ? "ROI Calibrated" : "Whole Frame Monitored"}
            </span>
          </div>
        </div>

        {/* Right Column: Parameters & Launch Action */}
        <div className="bg-white p-6 sm:p-7 border border-[#E5E9F0] rounded-2xl shadow-subtle flex flex-col justify-between">
          <form onSubmit={handleUploadAndAnalyze} className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-[#252B36]">Pipeline Parameters</h2>
              <p className="text-sm text-[#697586] mt-0.5">Configure surveillance metadata and active detection modules</p>
            </div>

            {/* Video File Picker */}
            <div>
              <label className="block text-sm font-semibold text-[#252B36] mb-2">
                Surveillance Recording File
              </label>
              <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-[#D0D7E2] rounded-xl hover:border-[#2563EB] cursor-pointer bg-[#F5F7FA]/70 transition group">
                <FiUploadCloud className="text-3xl text-[#9AA5B5] group-hover:text-[#2563EB] transition-colors mb-2" />
                <span className="text-sm font-semibold text-[#252B36] truncate max-w-[220px]">
                  {videoFile ? videoFile.name : "Select CCTV video file"}
                </span>
                <span className="text-xs text-[#697586] mt-1">MP4, AVI, MOV up to 500MB</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Surveillance Feed Label */}
            <div>
              <label className="block text-sm font-semibold text-[#252B36] mb-2">
                Surveillance Feed Identification
              </label>
              <input
                type="text"
                value={feedLabel}
                disabled={loading}
                onChange={(e) => setFeedLabel(e.target.value)}
                placeholder="e.g. Sector 01 - Main Entrance"
                className="input-field text-sm"
              />
            </div>

            {/* AI Rules Selector */}
            <div>
              <label className="block text-sm font-semibold text-[#252B36] mb-2.5">
                Active Detection Modules
              </label>
              <div className="space-y-2.5">
                {[
                  { name: "Restricted Area", desc: "Polygon boundary violation trigger" },
                  { name: "Sudden Run", desc: "Rapid velocity threshold anomaly" },
                  { name: "Loitering", desc: "Prolonged dwell time in sector" }
                ].map((act) => {
                  const isChecked = selectedActivities.includes(act.name);
                  return (
                    <div
                      key={act.name}
                      onClick={() => !loading && toggleActivity(act.name)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isChecked
                          ? "bg-[#EFF6FF] border-[#BFDBFE]"
                          : "bg-white border-[#E5E9F0] hover:bg-[#F5F7FA]"
                      } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <div>
                        <span className={`text-sm font-bold ${isChecked ? "text-[#2563EB]" : "text-[#252B36]"}`}>
                          {act.name}
                        </span>
                        <p className="text-xs text-[#697586] mt-0.5">{act.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-xs ${
                          isChecked ? "bg-[#2563EB]" : "border border-[#9AA5B5]"
                        }`}
                      >
                        {isChecked && <FiCheck className="text-sm stroke-2" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trigger Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !videoFile}
                className="w-full btn-primary py-3 text-sm font-bold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <FiRefreshCw className="animate-spin text-base" />
                    <span>Analyzing & Tracking Video...</span>
                  </span>
                ) : (
                  <>
                    <span>Play & Analyze Video</span>
                    <FiArrowRight className="text-base" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Completion Output: Annotated Player & Detected Anomalies */}
      {processedResult && (
        <div className="bg-white p-6 sm:p-8 border border-[#16A36A]/30 rounded-2xl shadow-subtle bg-[#E8F7F0]/15 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E9F0]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F7F0] text-[#16A36A] flex items-center justify-center text-xl">
                <FiCheckCircle />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#252B36]">
                  Optical Analysis Complete: {processedResult.filename}
                </h3>
                <p className="text-sm text-[#697586]">
                  Autonomous detections recorded and indexed into central audit ledger
                </p>
              </div>
            </div>
            <Link
              to="/videos"
              className="btn-secondary text-sm self-start sm:self-auto"
            >
              <FiFileText className="text-base" />
              <span>Footage Archives</span>
            </Link>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
            <div className="p-5 bg-white rounded-xl border border-[#E5E9F0]">
              <span className="text-[#697586] block text-xs font-semibold uppercase tracking-wider mb-1">
                Processing Status
              </span>
              <span className="font-bold text-[#16A36A] capitalize text-lg">
                {processedResult.processing_status}
              </span>
            </div>
            <div className="p-5 bg-white rounded-xl border border-[#E5E9F0]">
              <span className="text-[#697586] block text-xs font-semibold uppercase tracking-wider mb-1">
                Anomalies Detected
              </span>
              <span className="font-extrabold text-[#DC4545] text-2xl">
                {processedResult.events ? processedResult.events.length : 0} incidents
              </span>
            </div>
            <div className="p-5 bg-white rounded-xl border border-[#E5E9F0]">
              <span className="text-[#697586] block text-xs font-semibold uppercase tracking-wider mb-1">
                Model Pipeline
              </span>
              <span className="font-bold text-[#2563EB] text-lg">
                YOLOv8 + DeepSORT
              </span>
            </div>
          </div>

          {/* Side-by-Side: Annotated Video Stream vs Incident Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Annotated Output Video Viewport */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#252B36] flex items-center gap-2">
                <FiVideo className="text-[#2563EB]" />
                <span>AI Annotated Output Playback</span>
              </h4>
              <div className="aspect-video bg-black rounded-xl overflow-hidden border border-[#E5E9F0] shadow-sm flex items-center justify-center">
                {processedResult.annotated_video_url ? (
                  <video
                    src={`http://localhost:5000${processedResult.annotated_video_url}`}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400 text-sm">No annotated stream available</div>
                )}
              </div>
            </div>

            {/* Detections List */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#252B36] flex items-center gap-2">
                <FiActivity className="text-[#DC4545]" />
                <span>Flagged Optical Anomaly Incidents</span>
              </h4>

              {processedResult.events && processedResult.events.length > 0 ? (
                <div className="divide-y divide-[#E5E9F0] bg-white border border-[#E5E9F0] rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
                  {processedResult.events.map((e, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-[#F5F7FA] transition">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#DC4545]" />
                        <div>
                          <span className="font-bold text-[#252B36] text-sm capitalize">
                            {e.event_type?.replace(/_/g, " ")}
                          </span>
                          <p className="text-xs text-[#697586]">
                            Target #{e.person_id || 1} • Confidence: {Math.round((e.confidence || 0.85) * 100)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-mono text-[#2563EB] font-semibold text-xs bg-[#EFF6FF] px-2 py-0.5 rounded">
                          @{e.timestamp_seconds}s
                        </span>
                        <span className="badge-critical capitalize text-xs">
                          {e.risk_level || "high"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-[#E5E9F0]">
                  <FiCheckCircle className="mx-auto text-3xl text-[#16A36A] mb-2" />
                  <p className="font-bold text-[#252B36] text-sm">No Security Anomalies Flagged</p>
                  <p className="text-xs text-[#697586] mt-1">Video clip cleared with zero unauthorized boundary breaches.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
