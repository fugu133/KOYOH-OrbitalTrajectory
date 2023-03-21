(function () {
   "use strict";

   const JulianDate = Cesium.JulianDate;
   const Quaternion = Cesium.Quaternion;
   const Cartesian3 = Cesium.Cartesian3;
   const Transforms = Cesium.Transforms;
   const Matrix3 = Cesium.Matrix3;
   const Matrix4 = Cesium.Matrix4;

   const defaultClockScale = 200;
   const homeCameraView = {
      destination: Cesium.Cartesian3.fromDegrees(136.70510974114885, 36.54389351031144, 25000000)
   }

   // ビューワー作成
   Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4NmY1MzU3MC04OGM4LTQ0YzctOWNjNC03YzIwOTlhODQ2ZDgiLCJpZCI6MTI5MTU3LCJpYXQiOjE2NzkwMzg4NDB9.I18hj604p8pbNdg73hVjDUqpzyf5jzrYVkXleEi4Pp4";
   var viewer = new Cesium.Viewer("cesium", {
      terrainProvider: Cesium.createWorldTerrain(),
      shouldAnimate: false,
      baseLayerPicker: false,
      geocoder: false
   });

   viewer.resolutionScale = window.devicePixelRatio

   // 表示設定
   const scene = viewer.scene;
   const globe = scene.globe;
   scene.camera.flyTo(homeCameraView);
   globe.showGroundAtmosphere = true;
   globe.enableLighting = true;

   var czml = new Cesium.CzmlDataSource();

   // ファイル入力
   const satUrl = "resource/parameter/koyoh_orbit.json";
   fetch(satUrl)
      .then(response => response.json())
      .then(data => {
         const qBlockSize = 5;
         const pBlockSize = 4;
         const epoch = JulianDate.fromIso8601(data.orientation.epoch);
         let qIb = data.orientation.unitQuaternion;
         const pos = data.position.cartographicDegrees;
         const dataLength = data.orientation.unitQuaternion.length / qBlockSize;

         // 慣性座標系から地球固定地球中心座標系への変換
         for (let i = 0; i < dataLength; i++) {
            let qp = i * qBlockSize;
            let pp = i * pBlockSize;
            let t_i = JulianDate.addSeconds(epoch, qIb[qp], new JulianDate());
            let qIb_i = new Quaternion(qIb[qp + 1], qIb[qp + 2], qIb[qp + 3], qIb[qp + 4]);
            // let pos_i = new Cartesian3.fromDegrees(pos[pp+1], pos[pp+2], pos[pp+3]);
            // let qLe_i = Quaternion.fromRotationMatrix(Matrix4.getMatrix3(Transforms.eastNorthUpToFixedFrame(pos_i), new Matrix3())); // ENUからECEF    
            // let qEi_i = Quaternion.fromRotationMatrix(Transforms.computeFixedToIcrfMatrix(t_i)); // ECEFからICRF
            // let qLi_i = Quaternion.multiply(qLe_i, qEi_i, new Quaternion()); // q_vi = q_ve * q_ei 
            // let qLb_i = Quaternion.multiply(qLi_i, qIb_i, new Quaternion());
            // let qLb_i = Quaternion.multiply(Quaternion.inverse(qEi_i, new Quaternion()), qIb_i, new Quaternion());

            let qEi_i = Quaternion.fromRotationMatrix(Transforms.computeIcrfToFixedMatrix(t_i)); // ECEFからICRF
            let qLb_i = Quaternion.multiply(qEi_i, qIb_i, new Quaternion());
            qIb[qp + 1] = qLb_i.x;
            qIb[qp + 2] = qLb_i.y;
            qIb[qp + 3] = qLb_i.z;
            qIb[qp + 4] = qLb_i.w;

            pos[pp + 3] *= 3; // スケールアップ
         }

         var doc = {
            id: "document",
            name: "satelllite",
            version: "1.0",
            clock: {
               interval: "2023-02-15T04:50:00Z/2023-02-16T04:50:00Z",
               currentTime: "2023-02-15T04:50:00Z",
               multiplier: defaultClockScale,
               range: "LOOP_STOP",
               step: "SYSTEM_CLOCK_MULTIPLIER"
            }
         };
         czml.process(doc);
         czml.process(data);
      });

   var satelliteEntity = viewer.dataSources.add(czml);

   var gs = {
      id: "KanazawaUnivGs",
      name: "KOYOH Ground Station",
      billboard: {
         image: "resource/image/Kanazawa_University_logo.png",
         scale: 0.2,
      },
      position: Cesium.Cartesian3.fromDegrees(136.70510974114885, 36.54389351031144)
   };

   viewer.entities.add(gs);

   viewer.trackedEntity = satelliteEntity;

   // ホームボタンの機能変更
   viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
      function (e) {
         e.cancel = true;
         scene.camera.flyTo(homeCameraView);
      }
   );
}());