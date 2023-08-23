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

/*
  This demo/tutorial uses Express to bridge the gap between the UI components in /src/web and
  the ConsoleAccessLibrary SDK used to make requests to AITRIOS. If you are unfamiliar with Express
  and just want to see how to use the SDK to make requests to AITRIOS, skip to /src/server/routes/device
  and /src/server/routes/data
*/

require('dotenv').config();
const express = require('express');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const cors = require('cors');

const Config = require('./common/config.js').Config;

const deviceRoutes = require('./routes/device.js');
const dataRoutes = require('./routes/data.js');
const clientRoutes = require('./client.js');

const app = express();
const HOST = '0.0.0.0';
const PORT = Config.SMART_PARKING_INTERNAL_PORT;

app.use(jsonParser);
app.use(cors());
app.use('/', clientRoutes);
app.use('/device', deviceRoutes);
app.use('/data', dataRoutes);

app.listen(PORT, HOST, () => {
  console.log(`SmartParking listening on ${HOST}:${PORT}`);
});
