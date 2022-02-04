#!/bin/bash

# LED outputs
raspi-gpio set 17,27 op pd dl

# Button inputs
raspi-gpio set 0,5,6,13 ip pu

# Rotary encoders
raspi-gpio set 14,15,23,24,25,8 ip pu
