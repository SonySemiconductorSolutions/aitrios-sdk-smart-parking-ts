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

import React from 'react';
import { useRef, useEffect } from 'react';
import {
    useParams
  } from "react-router-dom";

import CalibrationFeed from '../../components/shared/CalibrationFeed';
import DetectionFeed from '../../components/shared/DetectionFeed';
import CalibrateModeInfo from '../../components/shared/CalibrateModeInfo';
import DetectModeInfo from '../../components/shared/DetectModeInfo';
import { getDeviceInfo, getCalibration, postStopUploadImage, postStartUploadImage, 
    getLatestDeviceImage, updateDeviceImage, updateMockImage, getLatestInferenceData, persistCalibrationPolygons, polygonsToCoords } from '../../helpers/api';
import './styles.scss';
import { DEFAULT_POLYGON_COORDINATES, addPolygonFromLabelAndVertices } from '../../helpers/canvas';

const DevicePage = props => {
    const { id } = useParams();

    const [calibrationPolygons, setCalibrationPolygons] = React.useState([]);
    const [parkingPolygons, setParkingPolygons] = React.useState([]);
    const [device, setDevice] = React.useState(null);
    const [internalDeviceId, setInternalDeviceId] = React.useState(); // specifically the AITRIOS device ID, not deviceName, which is what we use here
    const [mode, setMode] = React.useState(0); // 0 for calibrate, 1 for detect

    useEffect(() => {
        getDeviceInfo(id)
            .then(result => {
                setDevice(result);
                const { device_id } = result;
                if (device_id) {
                    setInternalDeviceId(device_id);
                }
            });
    }, [id]);

    useEffect(() => {
        if (device) {
            const { connectionState, device_id } = device;
            if (connectionState === 'Connected') {
                startUploadImage(device_id);
            }
        }
    }, [id, device]);

    useEffect(() => {
        getCalibration(internalDeviceId)
        .then(calibrationData => {
            setCalibrationPolygons(
                calibrationData.map(cd => addPolygonFromLabelAndVertices(cd.label, cd.vertices))
            );
            setParkingPolygons(
                calibrationData.map(cd => addPolygonFromLabelAndVertices(cd.label, cd.vertices, {
                    poly: {
                        fill: 'rgba(59, 176, 255, .25)',
                        strokeWidth: 2,
                        stroke: 'rgba(59, 176, 255, 1)',
                        scaleX: 1,
                        scaleY: 1,
                        objectCaching: false,
                        transparentCorners: false,
                        selectable: false,
                    },
                    circle: {
                        radius: 12,
                        fill: '#54A300',
                        originX: 'center',
                        originY: 'center'
                    }
                }))
            )
        });

        const handleTabClose = event => {
            event.preventDefault();
            stopUploadImage(device.device_id)
        };

        window.addEventListener('beforeunload', handleTabClose);
        return () => {
            window.removeEventListener('beforeunload', handleTabClose);
        };
    }, [internalDeviceId]);
    
    useEffect(() => {
        const polyCoords = polygonsToCoords(calibrationPolygons);
        setParkingPolygons(
            polyCoords.map(pc => addPolygonFromLabelAndVertices(pc.label, pc.vertices, {
                poly: {
                    fill: 'rgba(59, 176, 255, .25)',
                    strokeWidth: 2,
                    stroke: 'rgba(59, 176, 255, 1)',
                    scaleX: 1,
                    scaleY: 1,
                    objectCaching: false,
                    transparentCorners: false,
                    selectable: false,
                },
                circle: {
                    radius: 12,
                    fill: '#54A300',
                    originX: 'center',
                    originY: 'center'
                }
            }))
        );

    }, [calibrationPolygons]);

    useEffect(() => {
        if (mode === 0) {
            if (calibrationPolygons) {
                calibrationPolygons.forEach(p => {
                    const labelCircle = p.innerLabel._objects[0];
                    labelCircle.set('fill', 'rgba(0, 120, 212, 0.6)');
                    labelCircle.set('stroke', '#3BB0FF');
                });
            }
        }
    }, [mode]);

    const [mockb64Data, setMockb64Data] = React.useState(0);
    const [latestB64, setLatestB64] = React.useState(null);

    const [detectOccupiedVisible, setDetectOccupiedVisible] = React.useState(true);
    const [detectVacantVisible, setDetectVacantVisible] = React.useState(true);
    const [detectParkingVisible, setDetectParkingVisible] = React.useState(true);
    const [detectBoundingVisible, setDetectBoundingVisible] = React.useState(true);

    const [uploadDirectory, setUploadDirectory] = React.useState(null);
    const [latestImageURI, setLatestImageURI] = React.useState(null);
    const [boundingBoxes, setBoundingBoxes] = React.useState([]);
    const [overlapMap, setOverlapMap] = React.useState({});
    const [secondsSinceLastImage, setSecondsSinceLastImage] = React.useState(Infinity);
    const infinityUnicode = '\u221E';

    const [activeCalibrationPolygon, setActiveCalibrationPolygon] = React.useState(null);

    let inferenceIntervalId = useRef(null);
    let imageTimerIntervalId = useRef(null);

    const inferenceIntervalMs = 2000;
    const inferenceToImageCadence = 4; // For every X inference data requests, send a request for the latest image.
    const imageTimerIntervalMs = 1000;

    // let runningInferenceData = [];
    // let runningImageBase64Data = [];

    const startUploadImage = async (id, retry = false) => {
        await postStartUploadImage(id)
        .then(async (subDir) => {
            // runningInferenceData = [];
            // runningImageBase64Data = [];
            if (subDir) {
                setUploadDirectory(subDir);
                await getLatestImage(id, subDir); // manually get first iamge
                
                let inferenceCount = 0 % inferenceToImageCadence;
                inferenceIntervalId.current = setInterval(async () => {
                    if (inferenceCount === 0) {
                        await getLatestImage(id, subDir);
                    }
                    inferenceCount = (inferenceCount + 1) % inferenceToImageCadence;
                    const inferenceData = await getLatestInferenceData(id);

                    // runningInferenceData = runningInferenceData.concat(inferenceData);

                    const inferences = ['mockDevice0', 'mockDevice1'].includes(id) 
                        ? inferenceData.inferences[0].Inferences[0] : inferenceData.inferences.Inferences[0];
                    const asArray = Object.values(inferences).map(d => {
                        return {
                            P: d.P,
                            X: d.X,
                            Y: d.Y,
                            x: d.x,
                            y: d.y
                        }
                    });
                    setBoundingBoxes(asArray);

                    const overlaps = inferenceData.overlaps;
                    setOverlapMap(overlaps);
                    // console.log(runningInferenceData);

                }, inferenceIntervalMs);

                setSecondsSinceLastImage(0);
                imageTimerIntervalId.current = setInterval(() => {
                    setSecondsSinceLastImage(prev => prev + 1);
                }, imageTimerIntervalMs);
            } else {
                console.error(`START UPLOAD: ERROR`);
            }
        })
        .catch(async (err) => {
            console.error(err);
            if (window.confirm(`Device ${id} could not start uploading inference data and may already be running. Would you like to try stop and retry?`)) {
                const result = await stopUploadImage(device.device_id);
                if (result === 'SUCCESS') {
                    startUploadImage(device.device_id);
                }
            }
        });
    }

    const stopUploadImage = async (deviceId) => {
        const result = await postStopUploadImage(deviceId);
        console.log(`STOP UPLOAD: ${result}`);
        if (result === 'SUCCESS') {
            clearInterval(inferenceIntervalId.current);
            clearInterval(imageTimerIntervalId.current);
            setSecondsSinceLastImage(Infinity);
        } else {
            window.alert(`Device ${id} could not be stopped and may need to be stopped manually in the Console.`);
        }
        return result;
    }

    const getLatestImage = async (id, subDirectory) => {
        if (id && subDirectory) {
            switch (id) {
                case "mockDevice0":
                case "mockDevice1":
                    const b64data = (await updateMockImage(id)).b64Image;
                    setMockb64Data(prev => {
                        if (prev !== b64data) {
                            fetch(b64data)
                            .then(b64response => b64response.blob())
                            .then(blob => {
                                const blobURI = URL.createObjectURL(blob);
                                setLatestImageURI(blobURI);
                                setSecondsSinceLastImage(0);
                            });
                            return b64data;
                        }
                        return prev;
                    });
                    break;
                default:
                    const imageBase64 = await getLatestDeviceImage(id, subDirectory);
                    if (imageBase64) {
                        setLatestB64(prev => {
                            if (prev !== imageBase64) {
                                fetch(imageBase64)
                                .then(b64response => b64response.blob())
                                .then(blob => {
                                    const blobURI = URL.createObjectURL(blob);
                                    setLatestImageURI(blobURI);
                                    setSecondsSinceLastImage(0);
                                });
                                return imageBase64;
                            }
                            return prev;
                        });
                    }
                    break;
            }
        }
    }

    const updateImage = (imagePath) => {
        updateDeviceImage(imagePath)
        .then(blob => {
            // const reader = new FileReader();
            // reader.onloadend = () => {
            //     const base64data = reader.result;                
            //     runningImageBase64Data = runningImageBase64Data.concat(base64data);
            //     console.log(runningImageBase64Data);
            // }
            // reader.readAsDataURL(blob); 
            const blobURI = URL.createObjectURL(blob);
            setLatestImageURI(blobURI);
            setSecondsSinceLastImage(0);
        });
    }

    const onCalibrateClick = () => {
        calibrationPolygons.forEach(p => {
            p.selectable = true;
        });
        setMode(0);
    }

    const onDetectClick = () => {
        calibrationPolygons.forEach(p => {
            p.selectable = false;
            p.off();
        });
        setActiveCalibrationPolygon(null);
        setMode(1);
    }

    const addCalibrationPolygon = (label) => {
        const polygonIndex = calibrationPolygons.length;
        const centerLabel = label || String.fromCharCode(polygonIndex + 65);
        const calibrationPolygon = addPolygonFromLabelAndVertices(centerLabel, DEFAULT_POLYGON_COORDINATES.slice());
        const newCalibrationPolygons = [...calibrationPolygons].concat(calibrationPolygon);
        
        setCalibrationPolygons(newCalibrationPolygons);
        persistCalibrationPolygons(internalDeviceId ?? id, newCalibrationPolygons);
        return calibrationPolygon;
    }

    const deleteCalibrationPolygon = (polygon) => {
        const calibrationId = polygon.calibrationId;
        const newPolygons = [...calibrationPolygons].filter(p => p.calibrationId !== calibrationId);
        newPolygons.forEach((p, i) => {
            p.calibrationId = String.fromCharCode(i + 65);
            p.innerText.set({text: String.fromCharCode(i + 65)});
        });

        setCalibrationPolygons(newPolygons);
        persistCalibrationPolygons(internalDeviceId ?? id, newPolygons);
    }

    const clearCalibrationPolygons = () => {
        const newPolygons = [];
        setCalibrationPolygons(newPolygons);
        persistCalibrationPolygons(internalDeviceId ?? id, newPolygons);
    }

    const persistCalibrationPolygonsWrapper = (deviceId, fabricPolygons) => {
        persistCalibrationPolygons(deviceId, fabricPolygons);
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
        setParkingPolygons(
            polyCoords.map(cd => addPolygonFromLabelAndVertices(cd.label, cd.vertices, {
                poly: {
                    fill: 'rgba(59, 176, 255, .25)',
                    strokeWidth: 2,
                    stroke: 'rgba(59, 176, 255, 1)',
                    scaleX: 1,
                    scaleY: 1,
                    objectCaching: false,
                    transparentCorners: false,
                    selectable: false,
                },
                circle: {
                    radius: 12,
                    fill: '#54A300',
                    originX: 'center',
                    originY: 'center'
                }
            }))
        );
    }

    return (
        <div className='devicePage__main'>
            <div className='devicePage__left'>
                <div className='devicePage__status-header'>
                    <div className='devicePage__status-id'>Device Name: <span className='devicePage__status-id--value'>{id}</span></div>
                    <div className='devicePage__status-dynamic'>
                        <div className='devicePage__status-connectivity'>Status:<span className='devicePage__status-connectivity--value'>{device && device.connectionState ? device.connectionState : "Disconnected"}</span></div>
                        <div className='devicePage__status-imageTimer'>Last Image Update:<span className='devicePage__status-imageTimer--value'>{secondsSinceLastImage === Infinity ? infinityUnicode : `${secondsSinceLastImage} seconds`}</span></div>
                    </div>
                </div>
                {(internalDeviceId) && (
                    <div className='devicePage__feed'>
                        {mode === 0 && (
                            <CalibrationFeed deviceId={internalDeviceId} calibrationPolygons={calibrationPolygons} addCalibrationPolygon={addCalibrationPolygon} deleteCalibrationPolygon={deleteCalibrationPolygon} clearCalibrationPolygons={clearCalibrationPolygons} persistPolygons={persistCalibrationPolygonsWrapper} setActivePolygon={setActiveCalibrationPolygon} activePolygon={activeCalibrationPolygon} latestImageURI={latestImageURI}></CalibrationFeed>
                        )}
                        {mode === 1 && (
                            <DetectionFeed latestImageURI={latestImageURI} boundingBoxes={boundingBoxes} overlapMap={overlapMap} parkingPolygons={parkingPolygons} 
                                parkingVisible={detectParkingVisible} boundingVisible={detectBoundingVisible} occupiedVisible={detectOccupiedVisible} vacantVisible={detectVacantVisible}
                                setParkingVisible={setDetectParkingVisible} setBoundingVisible={setDetectBoundingVisible}
                            ></DetectionFeed>
                        )}
                    </div>
                )}
            </div>
            <div className='devicePage__right'>
                <div className='devicePage__modeToggle'>
                    <div className={`devicePage__modeToggle--Calibrate ${mode === 0 ? '--active' : ''}`} onClick={onCalibrateClick}>Calibrate</div>
                    <div className={`devicePage__modeToggle--Detect ${mode === 1 ? '--active' : ''}`} onClick={onDetectClick}>Detect</div>
                </div>
                <div className='devicePage__modeInfo'>
                    {mode === 0 && (
                        <CalibrateModeInfo calibrationPolygons={calibrationPolygons} setActivePolygon={setActiveCalibrationPolygon} activePolygon={activeCalibrationPolygon} deleteCalibrationPolygon={deleteCalibrationPolygon}></CalibrateModeInfo>
                    )}
                    {mode === 1 && (
                        <DetectModeInfo calibrationPolygons={calibrationPolygons} overlapMap={overlapMap} 
                            parkingVisible={detectParkingVisible} boundingVisible={detectBoundingVisible} occupiedVisible={detectOccupiedVisible} vacantVisible={detectVacantVisible}
                            setParkingVisible={setDetectParkingVisible} setBoundingVisible={setDetectBoundingVisible} setOccupiedVisible={setDetectOccupiedVisible} setVacantVisible={setDetectVacantVisible}>
                        </DetectModeInfo>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DevicePage;
