_state = {
    "lat": None,
    "lon": None,
    "alt": None,
    "speed": None,
    "heading": None,
    "battery": None,
    "armed": False,
    "mode": "UNKNOWN",
}

def update_state(key, value):
    _state[key] = value

def get_state():
    return _state.copy()
