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

import PlusSVG from '../svg/PlusSVG';
import TrashSVG from '../svg/TrashSVG';
import './styles.scss';
import ClearSVG from '../svg/ClearSVG';

const DEFAULT_FEED_CANVAS_SIZE=480;

const CalibrationFeed = props => {
    const { 
        deviceId,
        calibrationPolygons,
        setActivePolygon,
        activePolygon,
        latestImageURI,
        addCalibrationPolygon,
        deleteCalibrationPolygon,
        clearCalibrationPolygons,
        persistPolygons,
    } = props;

    const [canvas, setCanvas] = useState(null);
    useEffect(() => {
        const _canvas = initCanvas();
        setCanvas(_canvas);
    }, []);

    // props effects
    useEffect(() => {
        if (canvas) {
            canvas.setBackgroundImage(latestImageURI, () => {
                canvas.backgroundImage.scaleToWidth(DEFAULT_FEED_CANVAS_SIZE);
                canvas.backgroundImage.scaleToHeight(DEFAULT_FEED_CANVAS_SIZE);
                canvas.renderAll.bind(canvas);
                canvas.renderAll();
            });
        }
    }, [latestImageURI]);

    // props effects
    useEffect(() => {
        if (canvas) {
            canvas.remove(...canvas.getObjects());
            calibrationPolygons.forEach(p => {
                eventifyPolygon(p);
                canvas.add(p);
                canvas.add(p.innerLabel);
            });
            if (activePolygon) {
                canvas.setActiveObject(activePolygon);
                canvas.bringToFront(activePolygon);
            }
            canvas.renderAll();
        }
    }, [canvas, calibrationPolygons]);

    // props effects
    useEffect(() => {
        if (canvas) {
            if (activePolygon) {
                canvas.setActiveObject(activePolygon);
                canvas.bringToFront(activePolygon);
            } else {
                canvas.discardActiveObject();            
            }
        }
    }, [activePolygon]);

    const initCanvas = () => {
        const canvas = new fabric.Canvas('canvas', {
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

    useEffect(() => {

    }, [calibrationPolygons]);

    const eventifyPolygon = (polygon) => {
        polygon.on('selected', (e) => {
            onPolygonSelect(polygon);
        });
        polygon.on('deselected', (e) => {
            onPolygonDeselect(polygon);
        });
        polygon.on('mouseover', (e) => {
            onPolygonMouseover(polygon);
        });
        polygon.on('mouseout', (e) => {
            onPolygonMouseout(polygon);
        });
        polygon.on('modified', (e) => {
            persistPolygons(deviceId, calibrationPolygons);
        });
    }

    const onPolygonSelect = (polygon) => {
        if (!polygon) {
            return;
        }

        setActivePolygon(polygon);
        const innerLabel = polygon.innerLabel;
        canvas.setActiveObject(polygon);
        canvas.bringToFront(polygon);
        polygon.edit = true;

        var lastControl = polygon.points.length - 1;
        polygon.cornerStyle = 'circle';
        polygon.cornerColor = 'white';
        polygon.cornerSize = 8;
        polygon.controls = polygon.points.reduce((acc, point, index) => {
            var control = new fabric.Control({
                positionHandler: polygonPositionHandler,
                actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
                actionName: 'modifyPolygon',
                pointIndex: index
            });
            acc[`p${index}`] = control;
            return acc;
        }, {});

        innerLabel.item(0).set('stroke', '#FFFFFF');

        polygon.hasBorders = false;
        canvas.requestRenderAll();
    }

    const onPolygonDeselect = (polygon) => {
        if (!polygon) {
            return;
        }

        const innerLabel = polygon.innerLabel;
        innerLabel.item(0).set('stroke', '#3BB0FF');
        polygon.edit = false;
        canvas.discardActiveObject();
        canvas.renderAll();
    }

    const onPolygonMouseover = (polygon) => {
        if (!polygon) {
            return;
        }

        canvas.bringToFront(polygon);
        polygon.set('stroke', 'rgb(108,195,255)');
        canvas.renderAll();
    }

    const onPolygonMouseout = (e, polygon) => {
        if (!polygon) {
            return;
        }

        polygon.set('stroke', 'rgb(59,176,255)');
        canvas.renderAll();
    }
    
    const onAddPolygonClick = () => {
        const newPolygon = addCalibrationPolygon();
        eventifyPolygon(newPolygon);
        setActivePolygon(newPolygon);
    }

    const onClearPolygonsClick = (e) => {
        setActivePolygon(null);
        clearCalibrationPolygons();
        canvas.remove(...calibrationPolygons, ...calibrationPolygons.map(p => p.innerLabel));
        canvas.renderAll();
    }
    
    const deletePolygon = (polygon) => {
        if (polygon && polygon.calibrationId) {
            setActivePolygon(null);
            deleteCalibrationPolygon(polygon);
            canvas.remove(polygon.innerLabel);
            canvas.remove(polygon);
            canvas.discardActiveObject();
            canvas.renderAll();
        }
    }

    const onDeletePolygonClick = (e) => {
        const activeObj = canvas.getActiveObject();
        deletePolygon(activeObj);
    }
    
    const onCanvasKeyDown = (e) => {
        const key = e.key;
        if (key === 'Backspace') {
            const activeObj = canvas.getActiveObject();
            deletePolygon(activeObj, canvas);
        }
    }

    function polygonPositionHandler(dim, finalMatrix, fabricObject) {
        var x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x);
        var y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
        const polygonCenter = fabricObject.getCenterPoint();
        fabricObject.innerLabel.set({
            left: polygonCenter.x,
            top: polygonCenter.y
        });
        // canvas.renderAll();
        return fabric.util.transformPoint({ x: x, y: y },
        fabric.util.multiplyTransformMatrices(
          fabricObject.canvas.viewportTransform,
          fabricObject.calcTransformMatrix()
        ));
      }

    function actionHandler(eventData, transform, x, y) {
		var polygon = transform.target;
        var currentControl = polygon.controls[polygon.__corner];
		var mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center');
        var polygonBaseSize = polygon._getNonTransformedDimensions();
        var size = polygon._getTransformedDimensions(0, 0);
        var finalPointPosition = {
            x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
            y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
        };
		polygon.points[currentControl.pointIndex] = finalPointPosition;
		return true;
	}

    function anchorWrapper(anchorIndex, fn) {
        return function(eventData, transform, x, y) {
            var fabricObject = transform.target,
                absolutePoint = fabric.util.transformPoint({
                    x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
                    y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
                }, fabricObject.calcTransformMatrix()),
                actionPerformed = fn(eventData, transform, x, y),
                newDim = fabricObject._setPositionDimensions({}),
                polygonBaseSize = fabricObject._getNonTransformedDimensions(),
                newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
                    newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
            fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);  
            return actionPerformed;
        }
    }

    return (        
        <div className='CalibrationFeed__main' tabIndex="-1" onKeyDown={(e) => onCanvasKeyDown(e)}>
            <div className='CalibrationFeed__canvasContainer'>
                <canvas id="canvas"/>
            </div>
            <div className='CalibrationFeed__canvasControls'>
                <div className='CalibrationFeed__canvasControl --add' onClick={onAddPolygonClick}>
                    <div className='CalibrationFeed__canvasControl --icon'><PlusSVG></PlusSVG></div>
                    Add space
                </div>
                <div className='CalibrationFeed__canvasControl --delete' onClick={onDeletePolygonClick}>
                    <div className='CalibrationFeed__canvasControl --icon'><TrashSVG></TrashSVG></div>
                    Delete
                </div>
                <div className='CalibrationFeed__canvasControl --clear' onClick={onClearPolygonsClick}>
                    <div className='CalibrationFeed__canvasControl --icon'><ClearSVG></ClearSVG></div>
                    Clear
                </div>
            </div>
        </div>
    )
}

export default CalibrationFeed;
