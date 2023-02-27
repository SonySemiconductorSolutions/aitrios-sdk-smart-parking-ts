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
import { useState } from 'react';
import { Outlet } from "react-router-dom";
import './styles.scss';

import SmartParkingSVG from '../../components/shared/svg/SmartParkingSVG';
import OfflineSVG from '../../components/shared/svg/OfflineSVG';
import HelpSVG from '../../components/shared/svg/HelpSVG';

const Layout = props => {

    const [isOffline, setIsOffline] = useState(false);

    return (
        <div className="main__layout">
            <header className="main__header">
                <div className="main__header__content">
                    <div className="main__header__icon">
                        <SmartParkingSVG></SmartParkingSVG>
                    </div>
                    {isOffline && (
                        <div className="offline__content">
                            <div className="offline__icon">
                                <OfflineSVG></OfflineSVG>
                            </div>
                            <div className="offline__text">
                                <span className="offline__text__bold">Offline mode: </span>
                                Polygon adjustments are display only.
                            </div>   
                        </div>
                    )}
                    <div className="help__header__icon">
                        <HelpSVG></HelpSVG>
                    </div>
                </div>
            </header>
            <div className="layout__content">
                <Outlet context={[isOffline, setIsOffline]}/>
            </div>
        </div>
    )
}

export default Layout;
