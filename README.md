# CNC Pendant
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This project is a Raspberry Pi node.js for a CNC pendant that connects to the RepRap Firmware (aka Duet) via WiFi and allows basic controls.

## Dev Setup

If developing on Windows, you will need to install VisualStudio for a C++ compiler before you ```npm i```.  See: https://github.com/nodejs/node-gyp#on-windows


## PI Zero W Setup (ARM6)

- Download Raspberry Pi Imager: https://www.raspberrypi.com/software/
- Burn 32-bit lite to a card and insert into pi (configure options as needed)
  - Alt-click on the gear for more advanced options
- Power on and SSH into the Pi
- Configure the pi
  - ```sudo raspi-config``` and do any necessary configuration, reboot
    - To reduce power, disable legacy camera, VNC, SPI, Serial Port, 1-wire, GPIO server
    - To support I2C devices, enable I2C support
    - Set video ram to 16mb (as we are not using video)
    - Disable glamor acceleration
    - Reboot
- Update the pi
  - ```sudo apt update```
  - ```sudo apt install git``` (we may want GIT later to pull code)
  - ```sudo apt full-upgrade```
  - Reboot
- Check for the version of node to install: https://unofficial-builds.nodejs.org/download/release/
- Install node.js
  - Download ```install-node-arm6.sh``` to ```~/``` and ```chmod +x install-node-arm6.sh```
  - ```export NODE_VER=16.13.2``` (replace version as needed)
  - ```./install-node-arm6.sh```
  - Reboot and ensure ```node -v``` and ```npm -v``` work

## Example Usage

## API

## Other Notes

### @msamblanet/node-project-template

This project uses [@msamblanet/node-project-template](https://github.com/msamblanet/node-project-template) to provide boilerplate project content.  See the documentation of that project for details on updating the templated components.
