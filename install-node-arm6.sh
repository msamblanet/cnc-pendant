#!/bin/bash
#
# See https://blog.rodrigograca.com/how-to-install-latest-nodejs-on-raspberry-pi-0-w/
#
# chmod +x ./install-node-arm6.sh
# export NODE_VER=16.13.2
# ./install-node-arm6.sh
#
if ! node --version | grep -q ${NODE_VER}; then
  (cat /proc/cpuinfo | grep -q "Pi Zero") && if [ ! -d node-v${NODE_VER}-linux-armv6l ]; then
    echo "Installing nodejs ${NODE_VER} for armv6 from unofficial builds..."
    curl -O https://unofficial-builds.nodejs.org/download/release/v${NODE_VER}/node-v${NODE_VER}-linux-armv6l.tar.xz
    tar -xf node-v${NODE_VER}-linux-armv6l.tar.xz
  fi
  echo "Adding node to the PATH"
  PATH="~/node-v${NODE_VER}-linux-armv6l/bin:${PATH}"
  echo "Adding path to ~/.bashrc"
  echo "" >> ~/.bashrc
  echo "PATH=~/node-v${NODE_VER}-linux-armv6l/bin:\${PATH}" >> ~/.bashrc
fi
node --version

