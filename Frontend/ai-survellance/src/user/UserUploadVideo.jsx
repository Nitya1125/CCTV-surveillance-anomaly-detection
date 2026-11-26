import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaArrowLeft } from "react-icons/fa";
import { uploadVideo } from "../services/api";

const UserUploadVideo = () => {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [videoFile, setVideoFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);

  const [zone, setZone] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  const [selectedActivities, setSelectedActivities] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [processedVideo, setProcessedVideo] = useState(null);

  const activities = ["Loitering", "Restricted Area", "Sudden Run"];

  const handleVideo = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Upload valid video file");
      return;
    }

    setVideoFile(file);
    setPreview(URL.createObjectURL(file));
    setZone(null);
    setTimestamp(null);
    setSelectedActivities([]);
    setProcessedVideo(null);
    setError("");
  };

  const toggleActivity = (activity) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter((a) => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  const startDrawing = (e) => {
    if (!selectedActivities.includes("Restricted Area")) return;

    const rect = canvasRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPoint({ x, y });
    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing) return;

    const rect = canvasRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvasRef.current.getContext("2d");

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;

    ctx.strokeRect(
      startPoint.x,
      startPoint.y,
      x - startPoint.x,
      y - startPoint.y
    );
  };

  const stopDrawing = (e) => {
    if (!drawing) return;

    setDrawing(false);

    const rect = canvasRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const coords = [
      [Math.floor(startPoint.x), Math.floor(startPoint.y)],
      [Math.floor(x), Math.floor(startPoint.y)],
      [Math.floor(x), Math.floor(y)],
      [Math.floor(startPoint.x), Math.floor(y)],
    ];

    setZone(coords);

    if (videoRef.current) {
      const seconds = Math.floor(videoRef.current.currentTime);

      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;

      setTimestamp({
        seconds,
        formatted: `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
      });
    }
  };

  const analyzeVideo = async () => {
    if (!videoFile) {
      setError("Upload video first");
      return;
    }

    if (selectedActivities.length === 0) {
      setError("Select at least one activity");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("video", videoFile);
      formData.append("selectedActivities", JSON.stringify(selectedActivities));

      if (zone) {
        formData.append("zoneCoordinates", JSON.stringify(zone));
        formData.append("timestamp", timestamp.seconds);
      }

      const res = await uploadVideo(formData);

      const annotatedUrl = res.data?.video?.annotated_video_url;

      if (annotatedUrl) {
        setProcessedVideo(annotatedUrl);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const uploadAnother = () => {
    setPreview(null);
    setVideoFile(null);
    setZone(null);
    setTimestamp(null);
    setSelectedActivities([]);
    setProcessedVideo(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/user/dashboard")}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <FaArrowLeft />
        </button>

        <h1 className="text-3xl font-bold">AI Surveillance Analysis</h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-6xl mx-auto">
        {!preview && (
          <div className="flex flex-col items-center gap-6 py-10">
            <label className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg cursor-pointer flex items-center gap-2">
              <FaUpload />
              Upload Video
              <input
                type="file"
                hidden
                accept="video/*"
                onChange={handleVideo}
              />
            </label>
          </div>
        )}

        {preview && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Enable <b>Restricted Area</b> to draw zone on video
            </p>

            <div className="relative">
              <video
                ref={videoRef}
                src={preview}
                controls
                className="w-full rounded-lg"
              />

              <canvas
                ref={canvasRef}
                width={900}
                height={500}
                className={`absolute top-0 left-0 w-full h-full ${
                  selectedActivities.includes("Restricted Area")
                    ? "cursor-crosshair"
                    : "pointer-events-none"
                }`}
                onMouseDown={
                  selectedActivities.includes("Restricted Area")
                    ? startDrawing
                    : null
                }
                onMouseMove={
                  selectedActivities.includes("Restricted Area") ? draw : null
                }
                onMouseUp={
                  selectedActivities.includes("Restricted Area")
                    ? stopDrawing
                    : null
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              {activities.map((activity) => (
                <div
                  key={activity}
                  className="bg-gray-50 border rounded-xl p-6 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{activity}</h3>

                    <p className="text-sm text-gray-500">
                      Monitor this activity
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedActivities.includes(activity)}
                    onChange={() => toggleActivity(activity)}
                    className="w-5 h-5"
                  />
                </div>
              ))}
            </div>

            {zone && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-semibold">Zone Coordinates</p>

                <p className="font-mono text-blue-600">
                  {JSON.stringify(zone)}
                </p>

                <p className="mt-2">Timestamp: {timestamp?.formatted}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={analyzeVideo}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg"
              >
                {loading ? "Analyzing..." : "Analyze Video"}
              </button>

              <button
                onClick={uploadAnother}
                className="bg-gray-200 px-6 py-2 rounded-lg"
              >
                Upload Another Video
              </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {processedVideo && (
              <div className="mt-10 bg-gray-50 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">
                  Processed AI Detection Video
                </h2>

                <video controls className="w-full rounded-lg border">
                  <source src={processedVideo} type="video/mp4" />
                </video>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserUploadVideo;
