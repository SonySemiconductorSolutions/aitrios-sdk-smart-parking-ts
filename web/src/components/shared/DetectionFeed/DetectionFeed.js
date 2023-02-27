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

import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';

import './styles.scss';

import { 
    createCircularLabel,
    addPolygonFromLabelAndVertices, 
    GetCanvasAtResoution 
} from '../../../helpers/canvas';

const DEFAULT_FEED_CANVAS_SIZE=480;
const MINIMIZED_FEED_CANVAS_SIZE=200;
const DEVICE_RESOLUTION=320;
const DEFAULT_DETECTION_THRESHOLD=0.3;
const DEFAULT_OVERLAP_THRESHOLD=0.5;

const CIRCLE_FABRIC_CONFIG = {
    radius: 6,
    fill: 'rgba(84, 163, 0, 1)',
    originX: 'center',
    originY: 'center',
    selectable: false,
};

const TEXT_FABRIC_CONFIG = {
    fontSize: 6,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fill: 'white',
    textAlign: 'center',
    originX: 'center',
    originY: 'center',
    selectable: false,
}

const BB_FABRIC_CONFIG = {
    fill: 'rgba(0, 0, 0, 0)',
    strokeWidth: 2,
    stroke: '#F5A122',
    cornerColor: '#0000FF',
    scaleX: 1,
    scaleY: 1,
    objectCaching: false,
    transparentCorners: false,
    selectable: false,
};

// const CALIBRATION_FABRIC_CONFIG = {
//     fill: 'rgba(59, 176, 255, 0.15)',
//     strokeWidth: 1,
//     stroke: 'rgba(59, 176, 255, 0.25)',
//     cornerColor: '#0000FF',
//     scaleX: 1,
//     scaleY: 1,
//     objectCaching: false,
//     transparentCorners: false
// };

const DetectionFeed = (props) => {
    const {
        latestImageURI,
        boundingBoxes,
        overlapMap,
        parkingPolygons,
        parkingVisible,
        boundingVisible,
        occupiedVisible,
        vacantVisible
    } = props;

    const [liveCanvas, setLiveCanvas] = useState('');
    useEffect(() => {
        const _liveCanvas = initLiveCanvas();
        setLiveCanvas(_liveCanvas);
    }, []);

    const [resultsCanvas, setResultsCanvas] = useState('');
    const [resultsLabelMap, setResultsLabelMap] = useState({});
    useEffect(() => {
        const _resultsCanvas = initResultsCanvas();
        setResultsCanvas(_resultsCanvas);
    }, []);

    const [activeCanvas, setActiveCanvas] = useState(0); // 0 - live feed; 1 - results
    useEffect(() => {
        if (liveCanvas && resultsCanvas) {
            switch (activeCanvas) {
                case 0:
                    GetCanvasAtResoution(liveCanvas, DEFAULT_FEED_CANVAS_SIZE);
                    GetCanvasAtResoution(resultsCanvas, MINIMIZED_FEED_CANVAS_SIZE);
                    break;
                case 1:
                default:
                    GetCanvasAtResoution(liveCanvas, MINIMIZED_FEED_CANVAS_SIZE);
                    GetCanvasAtResoution(resultsCanvas, DEFAULT_FEED_CANVAS_SIZE);
                    break;
            };
        }
    }, [activeCanvas]);

    useEffect(() => {
        if (liveCanvas) {
            liveCanvas.setBackgroundImage(latestImageURI, () => {
                liveCanvas.backgroundImage.scaleToWidth(activeCanvas === 0 ? DEFAULT_FEED_CANVAS_SIZE : MINIMIZED_FEED_CANVAS_SIZE);
                liveCanvas.backgroundImage.scaleToHeight(activeCanvas === 0 ? DEFAULT_FEED_CANVAS_SIZE : MINIMIZED_FEED_CANVAS_SIZE);
                liveCanvas.renderAll.bind(liveCanvas);
                liveCanvas.renderAll();
            });
        }
    }, [latestImageURI]);

    useEffect(() => {
        if (liveCanvas) {
            const scaleRatio = (activeCanvas === 0 ? DEFAULT_FEED_CANVAS_SIZE : MINIMIZED_FEED_CANVAS_SIZE)/DEVICE_RESOLUTION;
            liveCanvas.remove(...liveCanvas.getObjects()); // preserves canvas properties
            const filteredBoxes = boundingBoxes.filter(bb => bb.P >= DEFAULT_DETECTION_THRESHOLD);
            filteredBoxes.forEach(fb => { // X,Y & x,y; R/r = 480/320
                const vertices = [
                    {
                        x: fb.X * scaleRatio,
                        y: fb.Y * scaleRatio
                    },
                    {
                        x: fb.x * scaleRatio,
                        y: fb.Y * scaleRatio
                    },
                    {
                        x: fb.x * scaleRatio,
                        y: fb.y * scaleRatio
                    },
                    {
                        x: fb.X * scaleRatio,
                        y: fb.y * scaleRatio
                    }
                ];
                const polygon = addPolygonFromLabelAndVertices('', vertices.slice(), { poly: BB_FABRIC_CONFIG });
                polygon.detectionPolygon = true;
                if (boundingVisible) {
                    liveCanvas.bringToFront(polygon); // implicitly adds to canvas as well
                }
            });

            if (parkingVisible) {
                renderParkingPolygons(parkingPolygons)
            }

            liveCanvas.renderAll();
        }

        if (resultsCanvas && overlapMap) {
            Object.entries(overlapMap).forEach((kvArray) => {
                const [label, overlapPercentage] = kvArray;
                const resultLabel = resultsLabelMap[label];
                if (resultLabel) {
                    const resultsCircle = resultLabel._objects[0];
                    if (resultsCircle) {
                        resultsCircle.set('fill', overlapPercentage < DEFAULT_OVERLAP_THRESHOLD ? 'rgba(84, 163, 0, 1)' : 'rgba(250, 95, 90, 1)');
                    }
                }
                const parkingLabel = parkingPolygons.find(pp => pp.calibrationId === label)
                if (parkingLabel) {
                    const liveCircle = parkingLabel.innerLabel._objects[0];
                    if (liveCircle) {
                        liveCircle.set('fill', overlapPercentage < DEFAULT_OVERLAP_THRESHOLD ? 'rgba(84, 163, 0, 1)' : 'rgba(250, 95, 90, 1)');
                    }
                }
            });
            resultsCanvas.renderAll();
        }

    }, [boundingBoxes]);

    useEffect(() => {
        if (liveCanvas) {
            renderParkingPolygons(parkingPolygons);
            liveCanvas.renderAll();
        }
    }, [liveCanvas, parkingPolygons]);

    useEffect(() => {
        if (liveCanvas) {
            if (parkingVisible) {
                renderParkingPolygons(parkingPolygons);
            } else {
                const parkingPolygons = liveCanvas.getObjects().filter(p => p.calibrationId);
                liveCanvas.remove(...parkingPolygons, ...parkingPolygons.map(p => p.innerLabel));
            }
            liveCanvas.renderAll();
        }
    }, [parkingVisible]);

    useEffect(() => {
        if (liveCanvas) {
            if (boundingVisible) {
            } else {
                const boundingPolygons = liveCanvas.getObjects().filter(b => b.detectionPolygon);
                liveCanvas.remove(boundingPolygons);
            }
            liveCanvas.renderAll();
        }
    }, [boundingVisible]);

    useEffect(() => {
        const vacantPolygons = parkingPolygons.filter(p => {
            const id = p.calibrationId;
            return !overlapMap[id] || overlapMap[id] < DEFAULT_OVERLAP_THRESHOLD;
        });
        const vacantLabels = vacantPolygons.map(vp => vp.innerLabel);

        const vacantResultsLabels = Object.entries(resultsLabelMap).filter((kvArray) => {
            const [label, fabricLabel] = kvArray;
            return !overlapMap[label] || overlapMap[label] < DEFAULT_OVERLAP_THRESHOLD;
        }).map(kvArray => kvArray[1]);

        if (vacantVisible) {
            if (liveCanvas) {
                liveCanvas.add(...vacantLabels);
                resultsCanvas.add(...vacantResultsLabels);
                liveCanvas.renderAll();
                resultsCanvas.renderAll();
            }
        } else {
            if (liveCanvas) {
                liveCanvas.remove(...vacantLabels);
                resultsCanvas.remove(...vacantResultsLabels);
                liveCanvas.renderAll();  
                resultsCanvas.renderAll();
            }
        }
    }, [vacantVisible]);

    useEffect(() => {
        const occupiedLivePolygons = parkingPolygons.filter(p => {
            const id = p.calibrationId;
            return overlapMap[id] && overlapMap[id] >= DEFAULT_OVERLAP_THRESHOLD;
        });
        const occupiedLiveLabels = occupiedLivePolygons.map(olp => olp.innerLabel);

        const occupiedResultsLabels = Object.entries(overlapMap).filter(kvArray => kvArray[1] >= DEFAULT_OVERLAP_THRESHOLD).map((kvArray) => {
            const [label, overlapPercentage] = kvArray;
            return resultsLabelMap[label];
        });

        if (occupiedVisible) {
            if (liveCanvas) {
                liveCanvas.add(...(occupiedLiveLabels.filter(x => x)));
                resultsCanvas.add(...(occupiedResultsLabels.filter(x => x)));
                liveCanvas.renderAll();
                resultsCanvas.renderAll();
            }
        } else {
            if (liveCanvas) {
                liveCanvas.remove(...occupiedLiveLabels);
                resultsCanvas.remove(...occupiedResultsLabels);
                liveCanvas.renderAll();  
                resultsCanvas.renderAll();
            }
        }
    }, [occupiedVisible]);

    const initLiveCanvas = () => {
        const canvas = new fabric.Canvas('canvas_detection', {
            height: DEFAULT_FEED_CANVAS_SIZE,
            width: DEFAULT_FEED_CANVAS_SIZE,
            backgroundColor: null
        });
        canvas.setBackgroundImage(latestImageURI || '/calibrator_test.jpg', () => {
            canvas.backgroundImage.scaleToWidth(DEFAULT_FEED_CANVAS_SIZE);
            canvas.backgroundImage.scaleToHeight(DEFAULT_FEED_CANVAS_SIZE);
            canvas.renderAll.bind(canvas);
            canvas.renderAll();
        });
        return canvas;
    }

    const initResultsCanvas = () => {
        const resultsCanvas = new fabric.Canvas('canvas_results', {
            height: MINIMIZED_FEED_CANVAS_SIZE,
            width: MINIMIZED_FEED_CANVAS_SIZE,
            backgroundColor: null
        });
        resultsCanvas.setBackgroundImage('/SmartParkingCleanSmall.jpg', () => {
            resultsCanvas.backgroundImage.scaleToWidth(MINIMIZED_FEED_CANVAS_SIZE);
            resultsCanvas.backgroundImage.scaleToHeight(MINIMIZED_FEED_CANVAS_SIZE);
            resultsCanvas.renderAll.bind(resultsCanvas);
            resultsCanvas.renderAll();
        });
        
        let labels = {};
        for (let i = 0; i < 10; i++) {
            let labelText = String.fromCharCode(i + 65);
            let fabricLabel = createCircularLabel(labelText, TEXT_FABRIC_CONFIG, CIRCLE_FABRIC_CONFIG,
                {
                    x: 25 + ((i % 5) * 34.5),
                    y: i < 5 ? 38 : 162
                }
            );
            labels[labelText] = fabricLabel;
            resultsCanvas.add(fabricLabel);
        }
        setResultsLabelMap(labels);
        return resultsCanvas;
    }

    const renderParkingPolygons = (polygons) => {
        if (liveCanvas) {
            liveCanvas.remove(...liveCanvas.getObjects().filter(o => o.calibrationId));
            polygons.forEach(p => {
                liveCanvas.add(p);
                // liveCanvas.add(p.innerLabel);
                liveCanvas.sendToBack(p);
                if (p && p.innerLabel && p.innerLabel._objects) {
                    const labelCircle = p.innerLabel._objects[0];
                    if (overlapMap && p.calibrationId) {
                        const overlapPercentage = overlapMap[p.calibrationId];
                        if ((!overlapPercentage || overlapPercentage < DEFAULT_OVERLAP_THRESHOLD) && vacantVisible) {
                            liveCanvas.add(p.innerLabel);
                        } else if ((overlapPercentage && overlapPercentage >= DEFAULT_OVERLAP_THRESHOLD) && occupiedVisible) {
                            labelCircle.set('fill', '#FA5F5A');
                            liveCanvas.add(p.innerLabel);
                        }
                    }
                    
                }
            });
        }
    }
  
    return (
        <div className='DetectionFeed__main'>
            <div className='DetectionFeed__canvasContainer'>
                <div className="DetectionFeed__canvasWrapper --live"  onClick={() => setActiveCanvas(0)}>
                    <canvas id="canvas_detection"/>
                </div>
                <div className="DetectionFeed__canvasWrapper --results" onClick={() => setActiveCanvas(1)}>
                    <canvas id="canvas_results"/>
                </div>
            </div>
        </div>
    )
}

export default DetectionFeed;
