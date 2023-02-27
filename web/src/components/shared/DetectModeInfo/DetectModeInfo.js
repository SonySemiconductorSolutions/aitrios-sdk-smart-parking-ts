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
import Switch from "react-switch";

import VacantSVG from '../svg/VacantSVG';
import OccupiedSVG from '../svg/OccupiedSVG';
import './styles.scss';

const DetectModeInfo = props => {
    const { 
        calibrationPolygons,
        overlapMap,
        parkingVisible,
        boundingVisible,
        occupiedVisible,
        vacantVisible,
        setParkingVisible,
        setBoundingVisible,
        setOccupiedVisible,
        setVacantVisible,
    } = props;

    const switchCommons = {
        onColor: "#3BB0FF",
        offColor: "#FFFFFF",
        onHandleColor: "#FFFFFF",
        offHandleColor: "#3BB0FF",
        height: 12,
        width: 24,
        handleDiameter: 8,
        checkedIcon: false,
        uncheckedIcon: false
    };

    return (
        <div className='DetectModeInfo__main'>
            <div className='DetectModeInfo__description'>
                <div className='DetectModeInfo__description--title'>
                    Detect
                </div>
                <div className='DetectModeInfo__description--text'>
                    During detection, the Smart Parking system detects objects to determine if defined spaces are occupied.
                </div>
            </div>
            <div className='DetectModeInfo__spaces--divider'></div>
            <div className='DetectModeInfo__options'>
                <div className='DetectModeInfo__options--title'>
                    Display Options
                </div>
                <div className='DetectModeInfo__options--controls'>
                    <div className={`DetectModeInfo__options--control --occupied ${occupiedVisible ? '--on' : '--off'}`} onClick={() => setOccupiedVisible(!occupiedVisible)}>
                        <Switch {...switchCommons} onChange={() => setOccupiedVisible(!occupiedVisible)} checked={occupiedVisible} />
                        <span className='DetectModeInfo__options--label'>Occupied</span>
                    </div>
                    <div className={`DetectModeInfo__options--control --vacant ${vacantVisible ? '--on' : '--off'}`} onClick={() => setVacantVisible(!vacantVisible)}>
                        <Switch {...switchCommons} onChange={() => setVacantVisible(!vacantVisible)} checked={vacantVisible} />
                        <span className='DetectModeInfo__options--label'>Vacant</span>
                    </div>
                    <div className={`DetectModeInfo__options--control --calibrated ${parkingVisible ? '--on' : '--off'}`} onClick={() => setParkingVisible(!parkingVisible)}>
                        <Switch {...switchCommons} onChange={() => setParkingVisible(!parkingVisible)} checked={parkingVisible} />
                        <span className='DetectModeInfo__options--label'>Defined spaces</span>
                    </div>
                    <div className={`DetectModeInfo__options--control --detected ${boundingVisible ? '--on' : '--off'}`} onClick={() => setBoundingVisible(!boundingVisible)}>
                        <Switch {...switchCommons} onChange={() => setBoundingVisible(!boundingVisible)} checked={boundingVisible} />
                        <span className='DetectModeInfo__options--label'>Detection rectangle</span>
                    </div>
                </div>
            </div>
            <div className='DetectModeInfo__results'>
                <div className='DetectModeInfo__results--title'>
                    Results
                </div>
                <div className='DetectModeInfo__results--table'>
                    <div className='DetectModeInfo__results--tableHeader --id'>Space</div>
                    <div className='DetectModeInfo__results--tableHeader --vacant'>Vacant ({`${overlapMap ? Object.values(overlapMap).filter(o => o < 0.5).length : 10}`})</div>
                    <div className='DetectModeInfo__results--tableHeader --occupied'>Occupied ({`${overlapMap ? Object.values(overlapMap).filter(o => o >= 0.5).length : 10}`})</div>
                    {calibrationPolygons.map(p => {
                        return (
                            <>
                                <div key={`${p.calibrationId}-id`} className='DetectModeInfo__results--tableItem --id'>Space {p.calibrationId}</div>
                                <div key={`${p.calibrationId}-vacant`} className={`DetectModeInfo__results--tableItem --vacant ${overlapMap[p.calibrationId] < 0.5 ? '' : '--hidden'}`}>
                                    <VacantSVG></VacantSVG>
                                </div>
                                <div key={`${p.calibrationId}-occupied`} className={`DetectModeInfo__results--tableItem --occupied ${overlapMap[p.calibrationId] >= 0.5 ? '' : '--hidden'}`}>
                                    <OccupiedSVG></OccupiedSVG>
                                </div>
                            </>
                        )
                    })}
                </div>
            </div>

        </div>
    )

}

export default DetectModeInfo;
