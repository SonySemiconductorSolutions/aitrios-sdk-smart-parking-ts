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

import React from "react";

const OccupiedSVG = (props) => (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <path d="M0 10C0 4.47715 4.47715 0 10 0V0C15.5228 0 20 4.47715 20 10V10C20 15.5228 15.5228 20 10 20V20C4.47715 20 0 15.5228 0 10V10Z" fill="#FA5F5A"/>
        <path d="M13.4739 5.22393L14.7765 6.52649L11.303 10L14.7765 13.4735L13.4739 14.7761L10.0004 11.3026L6.52691 14.7761L5.22435 13.4735L8.69786 10L5.22435 6.52649L6.52691 5.22393L10.0004 8.69743L13.4739 5.22393Z" fill="white"/>
    </svg>
);

export default OccupiedSVG;
