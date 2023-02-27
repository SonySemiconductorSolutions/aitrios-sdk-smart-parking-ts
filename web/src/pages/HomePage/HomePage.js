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
import { Link } from 'react-router-dom';

import './styles.scss';

const validRe = /[-_.(\\)a-zA-Z0-9]/g;
const notValidChar = /[!@#$%^&*+=|/~`"\s]/g;

class HomePage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			deviceName: '',
			errorMsg: 'Please enter valid device name',
			deviceNameIsValid: false,
		};

		this.handleDeviceNameChange = this.handleDeviceNameChange.bind(this);
		this.handleDeviceNamePaste = this.handleDeviceNamePaste.bind(this);

		this.validateDeviceName = this.validateDeviceName.bind(this);
	}

	// Check if Device ID is valid

	validateDeviceName(name) {
		return (
			name.length >= 1 &&
			name.length <= 100 &&
			name.match(validRe) &&
			!name.match(notValidChar)
		);

	}

	handleDeviceNameChange(changeEvent) {
		const newValue = changeEvent.target.value;
		this.setState({
			deviceName: newValue,
			deviceNameIsValid: this.validateDeviceName(newValue),
		});
	}

	handleDeviceNamePaste(pasteEvent) {
		pasteEvent.preventDefault();
		const newValue = pasteEvent.clipboardData.getData('Text');
		if (newValue) {
			this.setState({
				deviceName: `${this.state.deviceName}${newValue}`,
				deviceNameIsValid: this.validateDeviceName(newValue),
			});
		}
	}

	render() {
		const state = { ...this.state };
		let inputStyle = {};

		// Valid ID

		if (state.deviceNameIsValid) {

			inputStyle = {
				borderWidth: '0 0 1px 0',
				borderColor: '#3CE5A4',
			};
		}

		// Invalid ID & Device Id is still there

		if (!state.deviceNameIsValid && state.deviceName.length > 0) {

			inputStyle = {
				borderWidth: '0 0 1px 0',
				borderColor: '#F26A66',
			};
		}

		return (
			<div className='home__main'>
				<div className='home__deviceNameInput'>
					<div className='home__deviceNameInput__label'>
						Enter device name
					</div>
					<div className='home__deviceNameInput__control'>
						<input
							className='home__deviceNameInput__input'
							type='text'
							style={inputStyle}
							value={state.deviceName}
							placeholder='Enter device name'
							onChange={this.handleDeviceNameChange}
							onPasteCapture={this.handleDeviceNamePaste}
						/>
						{state.deviceNameIsValid ? (
							<Link
								to={`/device/${state.deviceName}`}
								className='home__deviceNameInput__link'
							>
								OK
							</Link>
						) : !state.deviceName.match(notValidChar) ? (
							<Link
								to={'/home'}
								className='home__deviceNameInput__link__disabled'
							>
								OK
							</Link>
						) : (
							<Link
								to={'/home'}
								className='home__deviceNameInput__link__disabled'
							>
								OK
							</Link>
						)}
						{!state.deviceNameIsValid && state.deviceName.length > 0 ? (
							<span className='error'>{state.errorMsg}</span>
						) : null}
					</div>
				</div>
			</div>
		);
	}
}

export default HomePage;
