autowatch = 1;

// Singleton LiveAPI objects for efficiency
var liveSetAPI = new LiveAPI();
liveSetAPI.path = "live_set";

// Track tempo changes using polling (more reliable)
var lastSentTempo = 0;
var tempoCheckTask = null;

// Function to get current tempo and send to React
function getCurrentTempo() {
    var tempo = liveSetAPI.get("tempo");
    // Convert to number to ensure it's not an object
    var tempoNumber = parseFloat(tempo);
    post("Current tempo: " + tempoNumber + " BPM\n");
    outlet(0, ["currentTempo", tempoNumber]);
    lastSentTempo = tempoNumber;
}

// Function to check for tempo changes
function checkTempoChange() {
    var currentTempo = liveSetAPI.get("tempo");
    var currentTempoNumber = parseFloat(currentTempo);
    
    if (currentTempoNumber !== lastSentTempo) {
        post("Tempo changed from " + lastSentTempo + " to " + currentTempoNumber + " BPM\n");
        getCurrentTempo();
    }
}

// Set up tempo checking
function setupTempoChecking() {
    // Create a task to check tempo every 200ms
    tempoCheckTask = new Task(checkTempoChange, this);
    tempoCheckTask.interval = 200;
    tempoCheckTask.repeat();
    post("Tempo checking set up (every 200ms)\n");
    // Send initial tempo immediately
    post("Sending initial tempo to React app...\n");
    getCurrentTempo();
}

// Initialize tempo tracking
var initTask = new Task(function() {
    post("Tempo tracking initialized\n");
    setupTempoChecking();
}, this);
initTask.schedule(1000); // Wait 1 second before starting

// Utility: Find track index by name
function findTrackIndexByName(name) {
    var trackCount = liveSetAPI.getcount("tracks");
    for (var i = 0; i < trackCount; i++) {
        var trackAPI = new LiveAPI();
        trackAPI.path = "live_set tracks " + i;
        var trackName = trackAPI.get("name");
        if (Array.isArray(trackName)) {
            trackName = trackName[trackName.length - 1];
        }
        if (trackName === name) {
            return i;
        }
    }
    return -1;
}

function getTrackNames() {
    post("getTrackNames called\n");
    var trackCount = liveSetAPI.getcount("tracks");
    post("Track count: " + trackCount + "\n");
    var names = [];
    for (var i = 0; i < trackCount; i++) {
        var trackAPI = new LiveAPI();
        trackAPI.path = "live_set tracks " + i;
        var name = trackAPI.get("name");
        if (Array.isArray(name)) {
            name = name[name.length - 1];
        }
        post("Track " + i + " name: " + name + "\n");
        names.push(name);
    }
    post("Sending trackNames: " + names.join(", ") + "\n");
    outlet(0, ["trackNames"].concat(names));
}

function recordBassClip() {
    post("recordBassClip called\n");
    var bassIndex = findTrackIndexByName("Bass");
    if (bassIndex === -1) {
        post("Bass track not found!\n");
        return;
    }
    post("Bass track index: " + bassIndex + "\n");

    // Create specific LiveAPI objects for this operation
    var clipSlot = new LiveAPI();
    clipSlot.path = "live_set tracks " + bassIndex + " clip_slots 2";

    var bassTrack = new LiveAPI();
    bassTrack.path = "live_set tracks " + bassIndex;
    bassTrack.set("arm", 1);
    post("Bass track armed\n");

    // Start recording a 4-bar clip in scene 3
    clipSlot.call("fire");
    post("Recording started in scene 3\n");

    // Schedule to stop recording and start playback after 4 beats
    var task = new Task(function() {
        // Stop recording (clipSlot will now contain the new clip)
        clipSlot.call("stop");
        post("Recording stopped, starting playback\n");
        // Start playback of the new clip
        clipSlot.call("fire");
    }, this);
    // 4 beats = 4 * 60000 / tempo ms (assuming 120bpm = 500ms per beat = 2000ms)
    task.schedule(2000); // TODO: Make this dynamic based on tempo
}

function anything() {
    post("anything called with messagename: " + messagename + "\n");
    switch (messagename) {
        case "getTrackNames":
            getTrackNames();
            break;
        case "recordBassClip":
            recordBassClip();
            break;
        case "getTempo":
            getCurrentTempo();
            break;
        case "sendInitialTempo":
            post("React app connected - sending current tempo\n");
            getCurrentTempo();
            break;
        default:
            post("Unknown message: " + messagename + "\n");
    }
} 