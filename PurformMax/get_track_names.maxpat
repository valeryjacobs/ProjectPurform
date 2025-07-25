{
  "patcher": {
    "fileversion": 1,
    "rect": [0, 0, 600, 200],
    "bglocked": 0,
    "defrect": [0, 0, 600, 200],
    "openrect": [0, 0, 0, 0],
    "openinpresentation": 0,
    "default_fontsize": 12.0,
    "default_fontface": 0,
    "default_fontname": "Arial",
    "gridonopen": 0,
    "gridsize": [15.0, 15.0],
    "gridsnaponopen": 0,
    "toolbarvisible": 1,
    "boxanimatetime": 200,
    "imprint": 0,
    "boxes": [
      {
        "box": {
          "id": "node1",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [30.0, 50.0, 120.0, 22.0],
          "text": "node.script test.js"
        }
      },
      {
        "box": {
          "id": "route1",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 2,
          "patching_rect": [180.0, 50.0, 100.0, 22.0],
          "text": "route getTrackNames"
        }
      },
      {
        "box": {
          "id": "js1",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [320.0, 50.0, 120.0, 22.0],
          "text": "js get_track_names.js"
        }
      },
      {
        "box": {
          "id": "back1",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [470.0, 50.0, 120.0, 22.0],
          "text": "node.script test.js"
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": ["node1", 0],
          "destination": ["route1", 0]
        }
      },
      {
        "patchline": {
          "source": ["route1", 1],
          "destination": ["js1", 0]
        }
      },
      {
        "patchline": {
          "source": ["js1", 0],
          "destination": ["back1", 0]
        }
      }
    ]
  }
}