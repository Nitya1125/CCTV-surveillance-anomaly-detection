import cv2
import os
import time
import shutil
import numpy as np

from ai.detector import detect_people
from ai.tracker import track_objects
from ai.event_engine import detect_events

# Determine directory paths relative to this service's root
SERVICE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(SERVICE_ROOT, "uploads")
OUTPUT_FOLDER = os.path.join(SERVICE_ROOT, "outputs")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)


async def process_video(video, zone_coords):

    zone_polygon = np.array(zone_coords, np.int32)

    # Use unique timestamped upload name to prevent race conditions
    safe_filename = f"upload_{int(time.time())}_{video.filename.replace(' ', '_')}"
    video_path = os.path.join(UPLOAD_FOLDER, safe_filename)

    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    cap = cv2.VideoCapture(video_path)

    # Fallbacks for cameras / files that don't expose FPS correctly
    fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
    if fps <= 0:
        fps = 25.0

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    output_filename = f"annotated_{int(time.time())}_{video.filename.replace(' ', '_')}"
    output_path = os.path.join(OUTPUT_FOLDER, output_filename)

    # Ensure we never pass 0 as fps to VideoWriter
    out_fps = max(fps / 3.0, 1.0)

    # Attempt H.264 (avc1) first for seamless HTML5 video player playback in web browsers
    fourcc = cv2.VideoWriter_fourcc(*"avc1")
    out = cv2.VideoWriter(output_path, fourcc, out_fps, (width, height))
    if not out.isOpened():
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(output_path, fourcc, out_fps, (width, height))

    frame_count = 0
    events = []

    try:
        while True:
            ret, frame = cap.read()

            if not ret:
                break

            frame_count += 1

            # Draw zone once per frame
            cv2.polylines(frame, [zone_polygon], True, (0, 0, 255), 2)

            detections = detect_people(frame)

            tracks = track_objects(detections, frame)

            for track in tracks:
                if not hasattr(track, "is_confirmed") or not track.is_confirmed():
                    continue

                track_id = getattr(track, "track_id", 0)

                l, t, r, b = map(int, track.to_ltrb())

                center_x = int((l + r) / 2)
                center_y = int((t + b) / 2)

                center = (center_x, center_y)

                timestamp = frame_count / fps

                detected_events = detect_events(
                    track_id,
                    center,
                    zone_polygon,
                    timestamp
                )

                events.extend(detected_events)

                # Default color and label
                color = (0, 255, 0)
                label = f"ID {track_id}"

                # Change color based on detected event
                for event in detected_events:
                    if event["event_type"] == "restricted_area_entry":
                        color = (0, 0, 255)
                        label = "RESTRICTED AREA"

                    elif event["event_type"] == "sudden_running":
                        color = (0, 165, 255)
                        label = "RUNNING"

                    elif event["event_type"] == "loitering":
                        color = (255, 0, 0)
                        label = "LOITERING"

                # Draw bounding box
                cv2.rectangle(frame, (l, t), (r, b), color, 2)

                # Draw label
                cv2.putText(
                    frame,
                    label,
                    (l, t - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    color,
                    2
                )

            out.write(frame)
    finally:
        cap.release()
        out.release()

        # Safely remove the raw uploaded temporary file
        if os.path.exists(video_path):
            try:
                os.remove(video_path)
            except Exception as e:
                print(f"Warning: could not delete temporary upload {video_path}: {e}")

    # Generate externally accessible video URL:
    # 1. If AI_SERVICE_PUBLIC_URL is configured (e.g. https://cctv-ai.onrender.com), use it.
    # 2. Otherwise default to local: http://127.0.0.1:{PORT}/videos/{output_filename}
    public_base_url = os.environ.get("AI_SERVICE_PUBLIC_URL")
    if public_base_url:
        public_base_url = public_base_url.rstrip("/")
        video_url = f"{public_base_url}/videos/{output_filename}"
    else:
        port = os.environ.get("PORT", "8000")
        video_url = f"http://127.0.0.1:{port}/videos/{output_filename}"

    return {
        "status": "done",
        "events": events,
        "annotated_video_url": video_url
    }
