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

const TrashSVG = (props) => (
    <svg width={10} height={14} viewBox="0 0 10 14" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M3.78917 0.333344C2.97097 0.333344 2.30769 0.996625 2.30769 1.81483L0 2.55557V4.03705H10V2.55557L7.69231 1.81483C7.69231 0.996625 7.02903 0.333344 6.21083 0.333344H3.78917ZM6.92283 1.81483H3.07667C3.07667 1.40572 3.40831 1.07408 3.81741 1.07408H6.18209C6.59119 1.07408 6.92283 1.40572 6.92283 1.81483ZM0.769043 4.77792H9.23058V11.6668C9.23058 12.7714 8.33515 13.6668 7.23058 13.6668H2.76904C1.66447 13.6668 0.769043 12.7714 0.769043 11.6668V4.77792ZM2.30769 4.77799H3.07692V11.4447H2.30769V4.77799ZM5.38462 4.77799H4.61539V11.4447H5.38462V4.77799ZM6.92308 4.77799H7.69231V11.4447H6.92308V4.77799Z" fill={props.fill || "white"}/>
    </svg>
);

export default TrashSVG;
