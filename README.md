# Microchip Effortless Design Workshop: Prototyping with Sensors [![Build Status](https://travis-ci.org/EffortlessDesignWorkshops/prototyping-with-sensors.svg?branch=feature%2Ftravis-ci)](https://travis-ci.org/EffortlessDesignWorkshops/prototyping-with-sensors)

## Description
This is a tool which will connect to an available Xpress board and display EKG data in a nice graph. This allows for both a quick view of the heart rate data as well as gives a starting place for your own projects.

The current version is able to read data from either a USB connected Xpress Board or from a TCP socket when using something like the [WiFly click board](http://mikroe.com/click/wifly)

_NOTE:_ This application was built strictly for the Microchip Effortless Design Workshop: Prototyping with Sensors, and thus there are some "magic numbers" in the codebase. They _shouldn't_ be hidden too deep in this, but feel free to submit an issue on this repo for questions! 

## What's needed?
### Running the prebuilt binaries
There are some binaries which are prebuilt in the [releases](https://github.com/EffortlessDesignWorkshops/prototyping-with-sensors/releases) section. All you should have to do is install those and run the installed application.

### Rebuilding from source
If you want to make changes to the source, you'll need to install [NodeJS](https://nodejs.org) (this should work on v6.x or v8.x)

## Installation
1. Clone this repository - `git clone`
2. Move into the newly created directory - `cd`
3. Run the install script - `npm install`
4. Run the appllication - `npm start`

```
git clone https://github.com/EffortlessDesignWorkshops/prototyping-with-sensors.git
cd prototyping-with-sensors
npm install
npm start
```

If you get errors about modules not being installed, your NPM instance might be in `production` mode. If this happens run `npm install --only=dev` to install the development dependencies.

## What's used in this?
Things that were used for this
- [NodeJS](https://nodejs.org) - Running the code
- [Electron](https://electron.atom.io/) - Making the native application
- [electron-builder](https://github.com/electron-userland/electron-builder) - Building for release
