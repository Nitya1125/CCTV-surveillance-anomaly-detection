import os
import sys

try:
    from ultralytics import YOLO
except Exception as e:
    print("⚠️  Failed to import ultralytics / YOLO:", e)
    YOLO = None

model = None

if YOLO is not None:
    try:
        # Determine reliable absolute path to yolov8n.pt relative to this file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        ai_service_root = os.path.dirname(current_dir)

        # Candidates for model weights:
        # 1. Root of ai_service: ai_service/yolov8n.pt
        # 2. Subfolder models: ai_service/models/yolov8n.pt
        # 3. Fallback: "yolov8n.pt" (auto-download by Ultralytics if needed)
        candidate_paths = [
            os.path.join(ai_service_root, "yolov8n.pt"),
            os.path.join(ai_service_root, "models", "yolov8n.pt"),
        ]

        model_path = "yolov8n.pt"
        for p in candidate_paths:
            if os.path.exists(p):
                model_path = p
                break

        print(f"📦 Loading YOLO weights from: {model_path}")
        model = YOLO(model_path)
    except Exception as e:
        print("⚠️  Failed to load YOLO model:", e)
        model = None


def detect_people(frame):
    # If the model failed to load, gracefully skip detections
    if model is None:
        return []

    results = model(frame)

    detections = []

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])

            if cls == 0 and conf > 0.5:
                x1, y1, x2, y2 = map(int, box.xyxy[0])

                detections.append(
                    ([x1, y1, x2 - x1, y2 - y1], conf, "person")
                )

    return detections
