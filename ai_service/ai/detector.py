try:
    from ultralytics import YOLO
except Exception as e:
    print("⚠️  Failed to import ultralytics / YOLO:", e)
    YOLO = None

model = None

if YOLO is not None:
    try:
        # Let Ultralytics handle downloading / caching the model weights.
        # Using just "yolov8n.pt" ensures it will be fetched automatically
        # instead of expecting a local "models/yolov8n.pt" file that may not exist.
        model = YOLO("yolov8n.pt")
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