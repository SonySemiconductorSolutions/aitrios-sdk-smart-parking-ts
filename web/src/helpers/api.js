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

const API_HOST = process.env.REACT_APP_API_HOST

export const getDeviceInfo = async (deviceId) => {
    return await fetch(`${API_HOST}/device/info/${deviceId}`).then(res => res.json())
}

export const getCalibration = async (deviceId) => {
    const resultJSON = await fetch(`${API_HOST}/data/calibrate/${deviceId}`).then(res => res.json())
    if (resultJSON) {
        return resultJSON.calibrationData;
    }
    return [];
}

export const postStartUploadImage = async (id) => {
    if (id) {
        const resultJSON = await fetch(`${API_HOST}/device/start_upload/${id}`, {
            method: 'POST'
        })
        .catch(err => err.json())
        .then(res => res.json())

        if (resultJSON) {
            switch(resultJSON.result) {
                case "SUCCESS":
                    return resultJSON.outputSubDirectory.split('/').slice(-1)[0];
                case "ERROR":
                    throw resultJSON;
                default:
                    return null;

            }
        } else {
            return null;
        }
    }
}

export const postStopUploadImage = async (id) => {
    if (id) {
        const resultJSON = await fetch(`${API_HOST}/device/stop_upload/${id}`, {
            method: 'POST'
        })
        .catch((err) => {
            console.error(err);
        })
        .then(res => res.json())

        if (resultJSON) {
            return resultJSON.result;
        } 

        return "ERROR";
    }
}

export const getLatestDeviceImage = async (id, subDirectory) => {
    return await fetch(`${API_HOST}/device/image/${id}/${subDirectory}`)
    .then(res => {
        return res.json();
    });
}

export const updateDeviceImage = async (imagePath) => {
    const encodedPath = encodeURIComponent(imagePath);
    return await fetch(`${API_HOST}/device/image/${encodedPath}`)
    .then(res => res.blob());
}

export const updateMockImage = async (deviceId) => {
    return await fetch(`${API_HOST}/device/mock/image/${deviceId}`)
    .then(res => res.json());
}

export const getLatestInferenceData = async (id) => {
    if (id) {
        return await fetch(`${API_HOST}/data/latest/${id}`)
        .then(res => res.json());
    }
}

export const persistCalibrationPolygons = async (deviceId, fabricPolygons) => {
    const polyCoords = fabricPolygons.map(p => {
        let polygonVertices = [];
        if (p.oCoords && p.oCoords.p0) {
            polygonVertices = Object.values(p.oCoords).map(v => {
                return { x: v.x, y: v.y };
            });
        } else { // polygon probably hasnt updated
            polygonVertices = p.points;
        }

        return { label: p.calibrationId, vertices: polygonVertices } // coordinates go ccw from topleft corner
    });

    const stringified = JSON.stringify(polyCoords);
    localStorage.setItem('calibration', stringified);
    return await fetch(`${API_HOST}/data/calibrate/${deviceId}`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: stringified
    }).then(res => res.json());
}

export const polygonsToCoords = (fabricPolygons) => {
    return fabricPolygons.map(p => {
        let polygonVertices = [];
        if (p.oCoords && p.oCoords.p0) {
            polygonVertices = Object.values(p.oCoords).map(v => {
                return { x: v.x, y: v.y };
            });
        } else { // polygon probably hasnt updated
            polygonVertices = p.points;
        }

        return { label: p.calibrationId, vertices: polygonVertices } // coordinates go ccw from topleft corner
    });
}
