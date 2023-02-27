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

const { JsonDB, Config: JsonConfig } = require('node-json-db');
const { flatbuffers } = require('flatbuffers');
const { SmartCamera } = require('./ObjectdetectionGenerated');

const _getCalibrationData = async (deviceId) => {
  const calibrationDB = new JsonDB(new JsonConfig('calibration', true, false, '/'));
  try {
    const data = await calibrationDB.getData(`/${deviceId}`);
    return data;
  } catch (error) {
    console.error(`Error reading calibration data: ${error}`);
    return null;
  }
};

const _persistCalibrationData = async (deviceId, calibrationData) => {
  const calibrationDB = new JsonDB(new JsonConfig('calibration', true, false, '/'));
  try {
    const payload = {
      id: deviceId,
      DeviceID: deviceId,
      calibrationData
    };
    await calibrationDB.push(`/${deviceId}`, payload);
    console.log(`Updated calibration data for: ${deviceId}`);
    return payload;
  } catch (error) {
    console.error(`Error writing calibration data: ${error}`);
    return {};
  }
};

const _parseFlatBuffer = (base64String) => {
  const decodedData = Buffer.from(base64String, 'base64');

  const resultJson = {
    Inferences: [
      {}
    ]
  };

  const pplOut = SmartCamera.ObjectDetectionTop.getRootAsObjectDetectionTop(new flatbuffers.ByteBuffer(decodedData));
  const readObjData = pplOut.perception();

  if (!readObjData) {
    return resultJson;
  }

  const resNum = readObjData.objectDetectionListLength();
  for (let i = 0; i < resNum; i++) {
    const objList = readObjData.objectDetectionList(i);
    const unionType = objList.boundingBoxType();
    if (unionType === SmartCamera.BoundingBox.BoundingBox2d) {
      const bbox2d = objList.boundingBox(new SmartCamera.BoundingBox2d());
      const res = {
        C: Number(objList.classId()),
        P: Number(objList.score()),
        X: Number(bbox2d.left()),
        Y: Number(bbox2d.top()),
        x: Number(bbox2d.right()),
        y: Number(bbox2d.bottom())
      };
      const inferenceKey = String(i + 1);
      resultJson.Inferences[0][inferenceKey] = res;
    }
  }
  return resultJson;
};

exports.getCalibrationData = _getCalibrationData;
exports.persistCalibrationData = _persistCalibrationData;
exports.parseFlatBuffer = _parseFlatBuffer;
