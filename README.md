# Smart Parking

## About this Software
This is a sample of Vision and Sensing Application SDK and Cloud SDK. Please note the following when using it：

- This sample is released with the assumption it will be used for development.
- This sample may contain errors or defects that obstruct regular operation of the device.

Smart Parking consists of an AI model, PPL, Console, and Cloud Application. The User Guide(docs/index.html) describes how to develop and set up these components and start application.

In this User Guide, AI model is trained on the Console UI and preset PPL is used. Vision and Sensing Application SDK also provides the capabilities to develop AI model and PPL by developer. See Vision and Sensing Application SDK for more detail.

Cloud Application utilizes Console access library and deserialization sample from Cloud SDK. See software architecture in User Guide and Cloud SDK for more information

## Contents <!-- omit in toc -->
- Straight to AITRIOS&trade;
- Quick Start
- Get Support
- Trademark
- Major Components

## Straight to AITRIOS&trade;
If all you are interested in is how this application communicates to AITRIOS, first note that the UI components in /web
ultimately make http requests to the Express server running via /server/server.js to communicate to AITRIOS.

Therefore, if all you are interested in is how this application communicates to AITRIOS, the bare minimum to start is to look at the simple Express routes mounted on `/device` -> `/src/server/routes/device.js` and `/data` -> `/src/data/routes/data.js`, respectively.

Both of those files have examples that include creating  `ConsoleAccessLibrary.Config` and `ConsoleAccessLibrary.Client`
objects which are then used to make calls to the ConsoleAccessLibrary SDK.

Refer to `/src/data/routes/device : consoleStartUploadRetrainingData` to see how `startUploadInferenceResult` is called
Refer to `/src/data/routes/data : consoleGetLatestInferenceResults` to see how `getInferenceResults` is called

## Quick Start

1) It is certainly possible to simply clone the project directly from https://github.com/SonySemiconductorSolutions/aitrios-sdk-smart-parking-ts
	- Requires a machine with `node.js` and `npm` installed. Smart Parking was developed using **Node v17.9.0**.
	- In the main project root directory, run the following commands: `npm run install-dependencies` then `npm run build-start`.
2) One can also create a Docker image using the following command inside project root: `docker build -t <name>:<tag> .`
    - Requires that `Docker` is installed on the host machine.
    - Can be run via the following command: `docker run -p <local port>:8080 <imagename>:<tag>`
    - For `<local port>`, choose whichever port is free to listen on your host machine running the image.
3) One can also host both the back and front ends themselves in the cloud.
	- The fastest option would be to deploy a containerized (Docker) instance of the entire application (both back and front ends) via a service like **Azure App Service**.

## User Guide
See Smart Parking User Guide(docs/index.html) which includes
- System requirements
- Installation and setup
- Training Smart Parking
- Using Smart Parking
- Software Architecture

## Get support
- [Contact us](https://developer.aitrios.sony-semicon.com/contact-us/)

## See also
- ["**Developer Site**"](https://developer.aitrios.sony-semicon.com/en)

## Trademark
- ["**Read This First**"](https://developer.aitrios.sony-semicon.com/development-guides/documents/manuals/)

## Updates
If a change to the Console Access Library submodule dependency is required, 
as in the URI of the submodule itself has changed, run:
- git submodule sync
- git submodule update --init --recursive --remote

If a change to the FlatBuffers object schemas need to be updated:
- Place the updated *.ts schema files in server/common
- Compile down to JavaScript (if desired)
- Update require/import statements accordingly

## Versioning

This repository aims to adhere to Semantic Versioning 2.0.0.

## Branch

See the "**Release Note**" from [**Releases**] for this repository.

Each release is generated in the main branch. Pre-releases are generated in the develop branch. Releases will not be provided by other branches.

## Security
Before using Codespaces, please read the Site Policy of GitHub and understand the usage conditions.