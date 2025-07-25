autowatch = 1;

// Utility: Find track index by name
function findTrackIndexByName(name) {
    var liveApi = new LiveAPI();
    liveApi.path = "live_set";
    var trackCount = liveApi.getcount("tracks");
    for (var i = 0; i < trackCount; i++) {
        var track = new LiveAPI();
        track.path = "live_set tracks " + i;
        var trackName = track.get("name");
        if (Array.isArray(trackName)) {
            trackName = trackName[trackName.length - 1];
        }
        if (trackName === name) {
            return i;
        }
    }
    return -1;
}

// Main handler for the message
function recordBassClip() {
    post("recordBassClip called\n");
    var bassIndex = findTrackIndexByName("Bass");
    if (bassIndex === -1) {
        post("Bass track not found!\n");
        return;
    }
    post("Bass track index: " + bassIndex + "\n");

    // Move Bass track to scene 3 (scene index 2)
    var clipSlot = new LiveAPI();
    clipSlot.path = "live_set tracks " + bassIndex + " clip_slots 2";

    // Arm the Bass track
    var bassTrack = new LiveAPI();
    bassTrack.path = "live_set tracks " + bassIndex;
    bassTrack.set("arm", 1);
    post("Bass track armed\n");

    // Start recording a 4-bar clip in scene 3
    clipSlot.call("fire");
    post("Recording started in scene 3\n");

    // Schedule to stop recording and start playback after 4 beats (1 bar) * 4 = 4 beats
    // This assumes 4/4 time and 1 beat = 1 quarter note
    // Max's Task object can be used for scheduling
    var task = new Task(function() {
        // Stop recording (clipSlot will now contain the new clip)
        clipSlot.call("stop");
        post("Recording stopped, starting playback\n");
        // Start playback of the new clip
        clipSlot.call("fire");
    }, this);
    // 4 beats = 4 * 60000 / tempo ms (assuming 120bpm = 500ms per beat = 2000ms)
    // For now, use 2000ms as a placeholder for 4 beats at 120bpm
    task.schedule(2000); // TODO: Make this dynamic based on tempo
}

function anything() {
    if (messagename === "recordBassClip") {
        recordBassClip();
    }
} 