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

import CalibrateModeSpace from './CalibrateModeSpace';
import './styles.scss';

const CalibrateModeInfo = props => {
    const { 
        calibrationPolygons,
        setActivePolygon,
        activePolygon,
        deleteCalibrationPolygon
    } = props;

    const onSpaceClick = (polygon) => {
        setActivePolygon(polygon)
    }

    const deleteSelf = (polygon) => {
        if (activePolygon && (activePolygon.calibrationId === polygon.calibrationId)) {
            setActivePolygon(null);
        }
        deleteCalibrationPolygon(polygon);
    }

    return (
        <div className='CalibrateModeInfo__main'>
            <div className='CalibrateModeInfo__description'>
                <div className='CalibrateModeInfo__description--title'>
                    Calibrate
                </div>
                <div className='CalibrateModeInfo__description--text'>
                    Calibration identifies parking spaces so the Smart Parking system can detect occupied and vacant spaces.
                </div>
            </div>
            <div className='CalibrateModeInfo__spaces'>
                <div className='CalibrateModeInfo__spaces--title'>
                    Spaces
                </div>
                <div className='CalibrateModeInfo__spaces--header'>
                    Space
                </div>
                <div className='CalibrateModeInfo__spaces--divider'></div>
                <div className='CalibrateModeInfo__spaces--list'>
                    {calibrationPolygons.map(p => {
                        return (
                            <CalibrateModeSpace key={p.calibrationId} space={p} spaceId={p.calibrationId} active={activePolygon ? p.calibrationId === activePolygon.calibrationId : false} onSpaceClick={() => onSpaceClick(p)} deleteSelf={() => deleteSelf(p)}></CalibrateModeSpace>
                        )
                    })}
                </div>
            </div>
        </div>
    )

}

export default CalibrateModeInfo;
