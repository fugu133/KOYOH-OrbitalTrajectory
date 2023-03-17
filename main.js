
"use strict";
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4NmY1MzU3MC04OGM4LTQ0YzctOWNjNC03YzIwOTlhODQ2ZDgiLCJpZCI6MTI5MTU3LCJpYXQiOjE2NzkwMzg4NDB9.I18hj604p8pbNdg73hVjDUqpzyf5jzrYVkXleEi4Pp4";
var viewer = new Cesium.Viewer("cesium", {
   shouldAnimate: true,
});

const scene = viewer.scene;
const globe = scene.globe;

globe.showGroundAtmosphere = true;
globe.enableLighting = true;

viewer.dataSources.add(
   Cesium.CzmlDataSource.load("koyoh_orbit.json")
);

viewer.camera.flyHome(0);

// Sandcastle.addToggleButton(
//    "Ground atmosphere",
//    globe.showGroundAtmosphere,
//    function (checked) {
//       globe.showGroundAtmosphere = checked;
//    }
// );

// Sandcastle.addToggleButton("Lighting", globe.enableLighting, function (
//    checked
// ) {
//    globe.enableLighting = checked;
// });
