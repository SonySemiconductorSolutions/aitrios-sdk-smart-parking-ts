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

/** Configuration. */
exports.Config = {
  ConsoleAccessLibrarySettings: {
    baseUrl: process.env.CONSOLE_BASE_URL || '',
    tokenUrl: process.env.CONSOLE_TOKEN_URL || '',
    clientSecret: process.env.CONSOLE_CLIENT_SECRET || '',
    clientId: process.env.CONSOLE_CLIENT_ID || ''
  },
  SMART_PARKING_DETECTION_THRESHOLD: process.env.SMART_PARKING_DETECTION_THRESHOLD || 0.3,
  SMART_PARKING_OVERLAP_THRESHOLD: process.env.SMART_PARKING_OVERLAP_THRESHOLD || 0.5,
  SMART_PARKING_DEFAULT_FEED_SIZE: process.env.SMART_PARKING_DEFAULT_FEED_SIZE || 480,
  SMART_PARKING_CAMERA_RESOLUTION: process.env.SMART_PARKING_CAMERA_RESOLUTION || 320,
  SMART_PARKING_INTERNAL_PORT: process.env.SMART_PARKING_INTERNAL_PORT || 8080
};
