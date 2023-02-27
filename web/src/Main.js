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
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import './Main.scss';

import Layout from './pages/Layout';
import HomePage from './pages/HomePage';
import DevicePage from './pages/DevicePage';



// RegEx
const validRe = /[-_.(\\)a-zA-Z]/g;
const notValidChar = /[!@#$%^&*+=|/~`"\s]/g;


class Main extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			deviceId: '',
			deviceIdReady: false,
		};

		this.componentDidMount = this.componentDidMount.bind(this);
		this.handleAppClose = this.handleAppClose.bind(this);
	}

	componentDidMount() {}

	handleAppClose() {}

	render() {
		const state = { ...this.state };

		// Check if Device ID is valid
		const isDeviceIdValid = (device) => {
			return (
				device.match(validRe) &&
				device.length >= 1 &&
				device.length <= 100 &&
				!device.match(notValidChar)
			);
		};
		return (
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<Layout />}>
						<Route index element={<HomePage />} />
						<Route path='home' element={<HomePage />} />
						<Route path='device' element={<HomePage />} />

						<Route
							path='device/:id'
							loader={({ request, params }) => {
								console.log(params);
								let deviceId = state.deviceId;
								if (!isDeviceIdValid(deviceId)) {
									throw new ErrorEvent('Not Found');
								}
							}}
							element={<DevicePage />}
							errorElement={<HomePage />}
						/>

					</Route>
				</Routes>
			</BrowserRouter>
		);
	}
}

export default Main;
