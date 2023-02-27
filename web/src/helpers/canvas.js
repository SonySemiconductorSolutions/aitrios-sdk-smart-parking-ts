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

import { fabric } from 'fabric';

export const DEFAULT_POLYGON_COORDINATES = [
    {
        x: 50,
        y: 50
    },
    {
        x: 50,
        y: 100
    },
    {
        x: 100,
        y: 100
    },
    {
        x: 100,
        y: 50
    }
];

/* Label is a string, vertices is an array of {x: Number, y: Number} processed counter clockwise */
/* config is an object that looks like { poly: {}, circle: {}, text: {} } */
export const addPolygonFromLabelAndVertices = (label, vertices, config) => {
    const polyConfig = (config ? config.poly : null) || {
        fill: 'rgba(59, 176, 255, 0.25)',
        strokeWidth: 2,
        stroke: '#3BB0FF',
        cornerColor: '#0000FF',
        scaleX: 1,
        scaleY: 1,
        objectCaching: false,
        transparentCorners: false,
    };
    const circleConfig = (config ? config.circle : null) || {
        radius: 12,
        fill: 'rgba(0, 120, 212, 0.6)',
        strokeWidth: 2,
        stroke: '#3BB0FF',
        originX: 'center',
        originY: 'center'
    };
    const textConfig = (config ? config.text : null) || { 
        fontSize: 12,
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
        fill: 'white',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        selectable: false,
    };

    let polygon = new fabric.Polygon(vertices.slice(), polyConfig);
    const polygonCenter = polygon.getCenterPoint();

    const polygonLabelCircle = new fabric.Circle(circleConfig);

    if (label) {
        const polygonText = new fabric.Text(label, textConfig);
        const polygonLabel = new fabric.Group([ polygonLabelCircle, polygonText], {
            left: polygonCenter.x,
            top: polygonCenter.y,
            originX: 'center',
            originY: 'center',
            selectable: false,
        });
    
        polygon.innerText = polygonText;
        polygon.innerLabel = polygonLabel;
        polygon.calibrationId = label;
    }


    return polygon;
}

export const createCircularLabel = (text, textConfig, circleConfig, coordinates) => {
    const fCircle = new fabric.Circle(circleConfig);
    const fText = new fabric.Text(text, textConfig);
    const fLabel = new fabric.Group([fCircle, fText], {
        left: coordinates.x,
        top: coordinates.y,
        originX: 'center',
        originY: 'center',
        selectable: false
    });

    return fLabel;
}

export const GetCanvasAtResoution = (canvas, newWidth) => {
    if (canvas.width !== newWidth) {
        var widthRatio = newWidth / canvas.width;
        var objects = canvas.getObjects();
        for (var i in objects) {
            objects[i].scaleX = objects[i].scaleX * widthRatio;
            objects[i].scaleY = objects[i].scaleY * widthRatio;
            objects[i].left = objects[i].left * widthRatio;
            objects[i].top = objects[i].top * widthRatio;
            objects[i].setCoords();
        }
        var obj = canvas.backgroundImage;
        if(obj){
            obj.scaleX = obj.scaleX * widthRatio;
            obj.scaleY = obj.scaleY * widthRatio;
        }

        canvas.discardActiveObject();
        canvas.setWidth(canvas.getWidth() * widthRatio);
        canvas.setHeight(canvas.getHeight() * widthRatio);
        canvas.renderAll();
        canvas.calcOffset();
    }           
}
