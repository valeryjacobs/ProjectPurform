autowatch = 1;

function getTrackNames() {
    post("getTrackNames called\n");
    var liveApi = new LiveAPI();
    liveApi.path = "live_set";
    var trackCount = liveApi.getcount("tracks");
    post("Track count: " + trackCount + "\n");
    var names = [];
    for (var i = 0; i < trackCount; i++) {
        var track = new LiveAPI();
        track.path = "live_set tracks " + i;
        var name = track.get("name");
        if (Array.isArray(name)) {
            name = name[name.length - 1];
        }
        post("Track " + i + " name: " + name + "\n");
        names.push(name);
    }
    post("Sending yyy trackNames: " + names.join(", ") + "\n");
    outlet(0, ["trackNames"].concat(names));
}

function anything() {
    post("anything called with messagename: " + messagename + "\n");
    if (messagename === "getTrackNames") {
        getTrackNames();
    }
}

function bang() {
    var api = new LiveAPI("live_set");
    var count = api.getcount("tracks");
    post("Track count: " + count + "\n");
    getTrackNames();
}