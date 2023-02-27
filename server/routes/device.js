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
const router = express.Router();

const CALClient = require('consoleAccessLibrary').Client;

const ConsoleAccessLibrarySettings = require('../common/config').Config.ConsoleAccessLibrarySettings;

const MOCK_DIRECTORY = path.join(__dirname, '../mock');
const MOCK_DEVICE_0_IMAGES = require(path.join(MOCK_DIRECTORY, 'mockDevice0', 'images.json'));
const MOCK_DEVICE_1_IMAGES = require(path.join(MOCK_DIRECTORY, 'mockDevice1', 'images.json'));
const resetMockInferenceIndex = require('./data.js').resetMockInferenceIndex;

let MOCK_DEVICE_0_INDEX = 0;
let MOCK_DEVICE_1_INDEX = 0;

/**
 * Uses Console Access Library to retrieve information about a device with an id matching [deviceId].
 *
 * @param deviceId The id to retrieve information for
 * @returns an object containg information about the device.
 */
const consoleGetDeviceInfo = async (deviceId) => {
  const client = await CALClient.createInstance(ConsoleAccessLibrarySettings);
  if (!client) {
    throw new Error('Unable to create ConsoleAccessLibrary instance.');
  }

  const queryParams = {
    deviceName: deviceId
  };
  const res = await client.deviceManagement?.getDevices(queryParams);
  return res.data;
};

/**
 * Uses Console Access Library to request that a device start uploading image inference data to Console
 *
 * @param deviceId The id of the device to request that it starts uploading inference data.
 * @returns an object containing information on whether or not the operation succeeded. Ex: { "result": "SUCCESS" }
 */
const consoleStartUploadRetrainingData = async (deviceId) => {
  switch (deviceId) {
    case 'mockDevice0':
    case 'mockDevice1': {
      const mockData = {
        result: 'SUCCESS',
        outputSubDirectory: 'mock/sub/directory'
      };
      return mockData;
    }
    default: {
      const client = await CALClient.createInstance(ConsoleAccessLibrarySettings);
      if (!client) {
        throw new Error('Unable to create ConsoleAccessLibrary instance.');
      }
      const res = await client.deviceManagement.startUploadInferenceResult(deviceId);
      console.log(res.data);
      return res.data;
    }
  }
};

/**
 * Uses Console Access Library to request that a device stop uploading retraining data to Console
 * @param deviceId The id of the device to request that it stops uploading inference data.
 * @returns an object containing information on whether or not the operation succeeded. Ex: { "result": "SUCCESS" } or { "result": "ERROR", "code": ..., "message": ..., "time": ... }
 */
const consoleStopUploadRetrainingData = async (deviceId) => {
  const client = await CALClient.createInstance(ConsoleAccessLibrarySettings);
  if (!client) {
    throw new Error('Unable to create ConsoleAccessLibrary instance.');
  }

  const res = await client.deviceManagement.stopUploadInferenceResult(deviceId);
  return res.data;
};

const consoleGetLatestImage = async (deviceId, imageSubDirectory) => {
  const client = await CALClient.createInstance(ConsoleAccessLibrarySettings);
  if (!client) {
    throw new Error('Unable to create ConsoleAccessLibrary instance.');
  }

  const query = {
    orderBy: 'DESC',
    numberOfImages: 1,
    skip: 0
  };

  const imageResponse = await client.insight.getImages(deviceId, imageSubDirectory, query.orderBy, query.numberOfImages, query.skip.toString());
  const imageData = imageResponse.data;
  const images = imageData.images;
  if (images && images.length > 0) {
    const latestImage = images[0];
    const base64Img = `data:image/jpg;base64,${latestImage.contents}`;
    return base64Img;
  }

  return null;
};

const getMockDeviceInfo = async (deviceId, req, res) => {
  let mockInfoPath;
  let readable;
  switch (deviceId) {
    case 'mockDevice0':
      mockInfoPath = path.join(MOCK_DIRECTORY, 'mockDevice0', 'info.json');
      readable = fs.createReadStream(mockInfoPath);
      readable.pipe(res);
      break;
    case 'mockDevice1':
      mockInfoPath = path.join(MOCK_DIRECTORY, 'mockDevice1', 'info.json');
      readable = fs.createReadStream(mockInfoPath);
      readable.pipe(res);
      break;
  }
};

const getDeviceInfo = async (deviceId, req, res) => {
  try {
    const data = await consoleGetDeviceInfo(deviceId);
    if (data && data.devices && data.devices.length > 0) {
      const deviceData = data.devices[0];
      console.log(deviceData);
      res.send(deviceData);
    } else {
      res.send(null);
    }
  } catch (err) {
    const response = err.response;
    if (response && response.data) {
      res.status(500).json({
        result: response.data.result,
        code: response.data.code,
        message: response.data.message
      });
      console.error('\x1b[31mstart    GetDeviceInfo\x1b[0m');
      console.error(response.data);
    } else {
      const { message, name } = err;
      res.status(500).json({
        result: 'ERROR',
        message: `Request getDeviceInfo failed for unexpected reasons: ${name}: ${message}`
      });
      console.error(`\x1b[31mRequest getDeviceInfo failed for unexpected reasons: ${name}: ${message}\x1b[0m`);
    }
  }
};

const startUploadRetrainingData = async (deviceId, req, res) => {
  try {
    const response = await consoleStartUploadRetrainingData(deviceId);
    switch (response.result) {
      case 'SUCCESS':
        res.status(200).json(response); // //'00g3ojq480bm6ruwh697/sid-100A50500A2005049064012000000000/image/20230206235048679'
        break;
      case 'ERROR':
        console.error(`\x1b[31mRequest startUploadRetrainingData failed: ${response.message}\x1b[0m`);
        console.error(response);
        res.status(500).json({
          result: response.result,
          code: response.code,
          message: response.message
        });
        break;
      default:
        console.error('\x1b[31mRequest startUploadRetrainingData failed for unknown reasons.\x1b[0m');
        console.error(response);
        res.status(500).json({
          result: 'ERROR'
        });
        break;
    }
  } catch (err) {
    const response = err.response;
    if (response && response.data) {
      res.status(500).json({
        result: response.data.result,
        code: response.data.code,
        message: response.data.message
      });
      console.error('\x1b[31mstart    UploadRetrainingData\x1b[0m');
      console.error(response.data);
    } else {
      res.status(500).json({
        result: 'ERROR',
        message: 'Request startUploadRetrainingData failed for unknown reasons.'
      });
      console.error('\x1b[31mRequest startUploadRetrainingData failed for unknown reasons.\x1b[0m');
    }
  }
};

const stopUploadRetrainingData = async (deviceId, req, res) => {
  console.log('stopUploadRetrainingData');
  if (['mockDevice0', 'mockDevice1'].includes(deviceId)) {
    switch (deviceId) {
      case 'mockDevice0':
        MOCK_DEVICE_0_INDEX = 0;
        resetMockInferenceIndex('mockDevice0');
        break;
      case 'mockDevice1':
        MOCK_DEVICE_1_INDEX = 0;
        resetMockInferenceIndex('mockDevice1');
        break;
    }
    res.status(200).json({
      result: 'SUCCESS'
    });
    return;
  }

  try {
    const response = await consoleStopUploadRetrainingData(deviceId);
    switch (response.result) {
      case 'SUCCESS':
        res.status(200).json(response); // "SUCCESS"
        break;
      case 'ERROR':
        console.error(`\x1b[31mRequest stopUploadRetrainingData failed: ${response.message}\x1b[0m`);
        console.error(response);
        res.status(500).json({
          result: response.result,
          code: response.code,
          message: response.message
        });
        break;
      default:
        console.error('\x1b[31mRequest stopUploadRetrainingData failed for unknown reasons.\x1b[0m');
        console.error(response);
        res.status(500).json({
          result: 'ERROR'
        });
        break;
    }
  } catch (err) {
    const response = err.response;
    if (response && response.data) {
      res.status(500).json({
        result: response.data.result,
        code: response.data.code,
        message: response.data.message
      });
      console.error('\x1b[31mstopUploadRetrainingData\x1b[0m');
      console.error(response.data);
    } else {
      res.status(500).json({
        result: 'ERROR',
        message: 'Request stopUploadRetrainingData failed for unknown reasons.'
      });
      console.error('\x1b[31mRequest stopUploadRetrainingData failed for unknown reasons.\x1b[0m');
    }
  }
};

router.get('/info/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;
  switch (deviceId) {
    case 'mockDevice0':
    case 'mockDevice1':
      getMockDeviceInfo(deviceId, req, res);
      break;
    default:
      getDeviceInfo(deviceId, req, res);
      break;
  }
});

router.post('/start_upload/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;
  startUploadRetrainingData(deviceId, req, res);
});

router.post('/stop_upload/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;
  stopUploadRetrainingData(deviceId, req, res);
});

router.get('/image/:deviceId/:directory', async (req, res) => {
  const deviceId = req.params.deviceId ? req.params.deviceId.toString() : '';
  const imageSubDirectory = req.params.directory ? req.params.directory.toString() : '';
  consoleGetLatestImage(deviceId, imageSubDirectory).then((imageBase64String) => {
    if (imageBase64String) {
      res.status(200).json(imageBase64String);
    } else {
      res.status(404).json('');
    }
  }).catch(err => {
    res.status(500).json(err);
  });
});

router.get('/mock/image/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;
  switch (deviceId) {
    case 'mockDevice0': {
      const mockDevice0Index = MOCK_DEVICE_0_INDEX++ % MOCK_DEVICE_0_IMAGES.length;
      res.status(200).json({
        b64Image: MOCK_DEVICE_0_IMAGES[mockDevice0Index]
      });
      break;
    }
    case 'mockDevice1': {
      const mockDevice1Index = MOCK_DEVICE_1_INDEX++ % MOCK_DEVICE_1_IMAGES.length;
      res.status(200).json({
        b64Image: MOCK_DEVICE_1_IMAGES[mockDevice1Index]
      });
      break;
    }
    default:
      res.status(404).json({
        b64Image: null
      });
      break;
  }
});

module.exports = router;
