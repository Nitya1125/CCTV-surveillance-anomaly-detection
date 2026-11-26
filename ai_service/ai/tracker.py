try:
    from deep_sort_realtime.deepsort_tracker import DeepSort
except Exception as e:
    print("⚠️  Failed to import DeepSort tracker:", e)
    DeepSort = None

_tracker = None

if DeepSort is not None:
    try:
        _tracker = DeepSort(
            max_age=50,
            n_init=3,
            max_cosine_distance=0.4
        )
    except Exception as e:
        print("⚠️  Failed to initialize DeepSort tracker:", e)
        _tracker = None


class _DummyTrack:
    def __init__(self, ltrb, track_id):
        self._ltrb = ltrb
        self.track_id = track_id

    def is_confirmed(self):
        return True

    def to_ltrb(self):
        return self._ltrb


def track_objects(detections, frame):
    """
    detections: list of (bbox, conf, label) where bbox = [x, y, w, h]
    """
    if _tracker is not None:
        return _tracker.update_tracks(detections, frame=frame)

    # Fallback: create simple dummy tracks without real tracking
    tracks = []
    for idx, (bbox, conf, label) in enumerate(detections):
        x, y, w, h = bbox
        # convert [x, y, w, h] -> [l, t, r, b] for compatibility
        ltrb = [x, y, x + w, y + h]
        tracks.append(_DummyTrack(ltrb, idx + 1))

    return tracks