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

import TrashSVG from '../svg/TrashSVG';
import './styles.scss';

const CalibrateModeSpace = props => {
    const { 
        spaceId,
        onSpaceClick,
        active,
        deleteSelf
    } = props;
    
    const onDeleteClick = () => {
        deleteSelf();
    }

    return (
        <div className={`CalibrateModeInfo__spaces--listItem ${active ? '--active' : ''}`}>
            <div className='CalibrateModeInfo__spaces--listItemLabel' onClick={onSpaceClick}>Space {spaceId}</div>
            <div className='CalibrateModeInfo__spaces--listItemSVG' onClick={onDeleteClick}><TrashSVG fill={active ? '#FFFFFF' : '#0078D4'}></TrashSVG></div>
        </div>
    )

}

export default CalibrateModeSpace;
