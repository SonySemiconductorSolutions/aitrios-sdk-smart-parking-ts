# Smart Parking

## About this Software
This is a sample of Vision and Sensing Application SDK and Cloud SDK. Please note the following when using it：

- This sample is released with the assumption it will be used for development.
- This sample may contain errors or defects that obstruct regular operation of the device.

Smart Parking consists of an AI model, PPL, Console, and Cloud Application. The User Guide(docs/index.html) describes how to develop and set up these components and start application.

In this User Guide, AI model is trained on the Console UI and preset PPL is used. Vision and Sensing Application SDK also provides the capabilities to develop AI model and PPL by developer. See Vision and Sensing Application SDK for more detail.

Cloud Application utilizes Console access library and deserialization sample from Cloud SDK. See software architecture in User Guide and Cloud SDK for more information

## Contents <!-- omit in toc -->
- Quick Start
- Get Support
- Trademark
- Major Components

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

## Trademark
- [Read This First](https://developer.aitrios.sony-semicon.com/development-guides/documents/manuals/)

