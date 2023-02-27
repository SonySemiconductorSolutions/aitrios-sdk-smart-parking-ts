/*
 * Copyright 2023 Sony Semiconductor Solutions Corp. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const turf = require('@turf/turf');

const router = express.Router();

const CALClient = require('consoleAccessLibrary').Client;

const { parseFlatBuffer, persistCalibrationData, getCalibrationData } = require('../common/util.js');

const Config = require('../common/config.js').Config;
const ConsoleAccessLibrarySettings = Config.ConsoleAccessLibrarySettings;

const MOCK_DIRECTORY = path.join(__dirname, '../mock');
const MOCK_DEVICE_0_INFERENCES = require(path.join(MOCK_DIRECTORY, 'mockDevice0', 'inferences.json'));
const MOCK_DEVICE_1_INFERENCES = require(path.join(MOCK_DIRECTORY, 'mockDevice1', 'inferences.json'));

let MOCK_DEVICE_0_INDEX = 0;
let MOCK_DEVICE_1_INDEX = 0;

const latestCalibrationData = {};

const consoleGetLatestInferenceResults = async (deviceId) => {
  const client = await CALClient.createInstance(ConsoleAccessLibrarySettings);
  if (!client) {
    throw new Error('Unable to create ConsoleAccessLibrary instance.');
  }

  const numberOfInferenceResults = 1;
  const filter = undefined;
  const raw = 1;
  const inferenceResponse = await client.insight.getInferenceresults(deviceId, numberOfInferenceResults, filter, raw);
  if (inferenceResponse && inferenceResponse.data && inferenceResponse.data[0] && inferenceResponse.data[0].inference_result) {
    const data = inferenceResponse.data[0].inference_result;
    const inferenceData = data.Inferences;
    if (inferenceData && inferenceData.length > 0) {
      const latestData = inferenceData[0];
      const asBase64String = latestData.O;
      try {
        const parsedData = parseFlatBuffer(asBase64String);
        return parsedData;
      } catch (e) {
        console.log(e);
      }
    }
  }

  return {
    Inferences: [
      {}
    ]
  };
};

const calculateCalibrationInferenceIntersections = (deviceId, inferenceResults) => {
  if (latestCalibrationData[deviceId]) {
    const scaleRatio = Config.SMART_PARKING_DEFAULT_FEED_SIZE / Config.SMART_PARKING_CAMERA_RESOLUTION;
    const calibrationData = latestCalibrationData[deviceId];
    const calibrationPolygons = calibrationData.calibrationData;
    const inferenceObjects = Object.values(inferenceResults.Inferences[0]).filter(x => x.P && x.P >= Config.SMART_PARKING_DETECTION_THRESHOLD);
    const inferenceVertices = inferenceObjects.map(i => {
      return [
        { x: i.X * scaleRatio, y: i.Y * scaleRatio },
        { x: i.X * scaleRatio, y: i.y * scaleRatio },
        { x: i.x * scaleRatio, y: i.y * scaleRatio },
        { x: i.x * scaleRatio, y: i.Y * scaleRatio }
      ];
    });
    const turfPolygonsCalibration = calibrationPolygons.map(p => {
      const v = p.vertices;
      return {
        label: p.label,
        polygon: turf.polygon([[
          turf.toWgs84(turf.point([v[0].x, v[0].y])).geometry.coordinates,
          turf.toWgs84(turf.point([v[1].x, v[1].y])).geometry.coordinates,
          turf.toWgs84(turf.point([v[2].x, v[2].y])).geometry.coordinates,
          turf.toWgs84(turf.point([v[3].x, v[3].y])).geometry.coordinates,
          turf.toWgs84(turf.point([v[0].x, v[0].y])).geometry.coordinates
        ]])
      };
    });
    const turfPolygonsDetection = inferenceVertices.map(v => {
      return turf.polygon([[
        turf.toWgs84(turf.point([v[0].x, v[0].y])).geometry.coordinates,
        turf.toWgs84(turf.point([v[1].x, v[1].y])).geometry.coordinates,
        turf.toWgs84(turf.point([v[2].x, v[2].y])).geometry.coordinates,
        turf.toWgs84(turf.point([v[3].x, v[3].y])).geometry.coordinates,
        turf.toWgs84(turf.point([v[0].x, v[0].y])).geometry.coordinates
      ]]);
    });

    const overlapMap = turfPolygonsCalibration.reduce((obj, cal) => {
      const calLabel = cal.label;
      const calPol = cal.polygon;
      const calArea = turf.area(calPol);

      let maxIntersectRatio = 0;
      turfPolygonsDetection.forEach(detPol => {
        const xPolygon = turf.intersect(calPol, detPol);
        if (xPolygon) {
          const xArea = turf.area(xPolygon);
          const overlapRatio = xArea / calArea;
          if (overlapRatio > maxIntersectRatio) {
            maxIntersectRatio = overlapRatio;
          }
        }
      });

      obj[calLabel] = maxIntersectRatio;
      return obj;
    }, {});

    return overlapMap;
  }

  return {};
};

const getParkingCalibrationMockData = async (deviceId) => {
  const mockId = ['mockDevice0', 'mockDevice1'].includes(deviceId) ? deviceId : 'mockDevice1';
  switch (deviceId) {
    case 'mockDevice0':
    case 'mockDevice1': {
      const mockInfoPath = path.join(MOCK_DIRECTORY, mockId, 'calibration.json');
      const readable = fs.createReadStream(mockInfoPath);
      return readable;
    }
    default:
      break;
  }
};

router.post('/calibrate/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;
  if (['mockDevice0', 'mockDevice1'].includes(deviceId)) {
    res.status(200).json([]);
    return;
  }

  const result = await persistCalibrationData(deviceId, req.body);
  latestCalibrationData[deviceId] = result;
  res.status(200).json(result);
});

router.get('/calibrate/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;
  switch (deviceId) {
    case 'mockDevice0':
    case 'mockDevice1': {
      const readStream = getParkingCalibrationMockData(deviceId);
      (await readStream).pipe(res);
      break;
    }
    default: {
      const result = await getCalibrationData(deviceId);
      latestCalibrationData[deviceId] = result;
      res.status(200).json(result);
    }
  }
});

router.get('/latest/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;
  try {
    switch (deviceId) {
      case 'mockDevice0': {
        const mockDevice0Index = MOCK_DEVICE_0_INDEX++ % MOCK_DEVICE_0_INFERENCES.length;
        res.status(200).json(MOCK_DEVICE_0_INFERENCES[mockDevice0Index]);
        break;
      }
      case 'mockDevice1': {
        const mockDevice1Index = MOCK_DEVICE_1_INDEX++ % MOCK_DEVICE_1_INFERENCES.length;
        res.status(200).json(MOCK_DEVICE_1_INFERENCES[mockDevice1Index]);
        break;
      }
      default: {
        const inferenceResults = await consoleGetLatestInferenceResults(deviceId);
        const overlapMap = calculateCalibrationInferenceIntersections(deviceId, inferenceResults);
        res.status(200).json({
          inferences: inferenceResults,
          overlaps: overlapMap
        });
      }
    }
  } catch (err) {
    const response = err.response;
    if (response && response.data) {
      res.status(500).json({
        result: response.data.result,
        code: response.data.code,
        message: response.data.message
      });
      console.error('\x1b[31mstart    GetLatestInferenceData\x1b[0m');
      console.error(response.data);
    } else {
      res.status(500).json({
        result: 'ERROR',
        message: 'Request getLatestInferenceResults failed for unknown reasons.'
      });
      console.error('\x1b[31mRequest getLatestInferenceResults failed for unknown reasons.\x1b[0m');
    }
  }
});

router.get('/mock/:deviceId', async (req, res) => {

});

const resetMockInferenceIndex = (deviceId) => {
  switch (deviceId) {
    case 'mockDevice0':
      MOCK_DEVICE_0_INDEX = 0;
      break;
    case 'mockDevice1':
      MOCK_DEVICE_1_INDEX = 0;
      break;
  }
};
module.exports = router;
router.resetMockInferenceIndex = resetMockInferenceIndex;
