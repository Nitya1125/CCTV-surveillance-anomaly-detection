import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiVideo,
  FiPlay,
  FiTrash2,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiEye,
  FiX,
  FiRefreshCw,
  FiLayers
} from "react-icons/fi";
import { getVideos, deleteVideo, resolveMediaUrl } from "../services/api";

const VideoLibrary = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [notice, setNotice] = useState("");

  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await getVideos();
      if (res.data && res.data.videos) {
        setVideos(res.data.videos);
      }
    } catch (e) {
      console.error("Video loading error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleDelete = async (id, filename) => {
    if (!window.confirm(`Delete ${filename} and all associated detection records?`)) return;

    try {
      await deleteVideo(id);
      setNotice(`Footage ${filename} cleared from vault.`);
      loadVideos();
      setTimeout(() => setNotice(""), 3000);
    } catch (e) {
      console.error("Failed to delete video:", e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#252B36] tracking-tight">
            Footage Archives & AI Telemetry
          </h1>
          <p className="text-sm sm:text-base text-[#697586] mt-1">
            Audit catalog of ingested surveillance video recordings, polygon calibration, and annotated anomaly outputs
          </p>
        </div>

        <Link to="/upload" className="btn-primary text-sm">
          <FiVideo className="text-base" />
          <span>Ingest New Footage</span>
        </Link>
      </div>

      {notice && (
        <div className="p-4 bg-[#E8F7F0] border border-[#16A36A]/20 rounded-xl text-sm font-medium text-[#16A36A] flex items-center gap-2.5">
          <FiCheckCircle className="text-lg shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Video Cards Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid._id}
              className="card-container flex flex-col justify-between overflow-hidden group hover:border-[#2563EB] transition-all bg-white rounded-2xl"
            >
              <div>
                {/* Thumbnail / Header */}
                <div className="relative aspect-video bg-[#0B0F19] flex items-center justify-center border-b border-[#E5E9F0]">
                  <FiVideo className="text-5xl text-slate-500 group-hover:scale-105 transition-transform" />

                  {/* Processing Status Badge */}
                  <div className="absolute top-3 left-3">
                    {vid.processing_status === "processed" ? (
                      <span className="badge-success text-xs">Indexed & Annotated</span>
                    ) : vid.processing_status === "processing" ? (
                      <span className="badge-warning text-xs">Processing</span>
                    ) : (
                      <span className="badge-critical text-xs">Failed</span>
                    )}
                  </div>

                  {/* Play Action Overlay */}
                  {vid.annotated_video_url && (
                    <button
                      onClick={() => setActiveVideo(vid)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      title="Play Annotated Video"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#2563EB] flex items-center justify-center shadow-lg text-2xl">
                        <FiPlay className="ml-1" />
                      </div>
                    </button>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <h3 className="text-sm sm:text-base font-bold text-[#252B36] truncate" title={vid.filename}>
                    {vid.filename}
                  </h3>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-[#697586]">
                    <span className="flex items-center gap-1.5">
                      <FiClock className="text-sm" />
                      {new Date(vid.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-[#DC4545]">
                      {vid.events ? vid.events.length : 0} Anomaly Events
                    </span>
                  </div>

                  {/* Monitored Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(vid.selected_activities || []).map((act, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#F5F7FA] border border-[#E5E9F0] text-[#697586]"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 border-t border-[#E5E9F0] bg-[#F5F7FA]/50 flex items-center justify-between text-sm">
                {vid.annotated_video_url ? (
                  <button
                    onClick={() => setActiveVideo(vid)}
                    className="text-[#2563EB] hover:text-[#1D4ED8] font-bold flex items-center gap-1.5"
                  >
                    <FiEye className="text-base" />
                    <span>Watch Output</span>
                  </button>
                ) : (
                  <span className="text-[#9AA5B5] text-xs">No Output Stream</span>
                )}

                <button
                  onClick={() => handleDelete(vid._id, vid.filename)}
                  className="p-1.5 rounded-lg text-[#9AA5B5] hover:text-[#DC4545] hover:bg-[#FDF2F2] transition"
                  title="Delete Recording"
                >
                  <FiTrash2 className="text-base" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-container p-14 text-center bg-white rounded-2xl">
          <FiVideo className="mx-auto text-5xl text-[#9AA5B5] mb-3 stroke-1" />
          <h3 className="text-base font-bold text-[#252B36]">No Footage Ingested Yet</h3>
          <p className="text-sm text-[#697586] mt-1 mb-5 max-w-sm mx-auto">
            Upload surveillance video recordings to run human detection, object tracking, and restricted zone analysis.
          </p>
          <Link to="/upload" className="btn-primary text-sm">
            <span>Analyze First Video</span>
          </Link>
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setActiveVideo(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-modal border border-[#E5E9F0] overflow-hidden z-10">
            <div className="p-5 border-b border-[#E5E9F0] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#252B36]">{activeVideo.filename}</h3>
                <span className="text-xs text-[#697586]">AI Optical Annotation Preview</span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-2 rounded-lg text-[#697586] hover:bg-[#F5F7FA] transition"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={resolveMediaUrl(activeVideo.annotated_video_url)}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Event Timestamp Bar */}
            {activeVideo.events && activeVideo.events.length > 0 && (
              <div className="p-5 max-h-56 overflow-y-auto border-t border-[#E5E9F0] bg-[#F5F7FA]">
                <h4 className="text-sm font-bold text-[#252B36] mb-3">Detected Anomaly Timeline</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                  {activeVideo.events.map((e, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-[#E5E9F0] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#DC4545]"></span>
                        <span className="font-semibold text-[#252B36] capitalize">
                          {e.event_type?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[#697586]">
                        <span className="font-mono text-xs">#{e.person_id}</span>
                        <span className="px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] font-mono font-semibold text-xs">
                          {e.timestamp_seconds}s
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;
