#!/usr/bin/env bash

# Prerequisites:
# `inkscape` 1.0+ (https://inkscape.org/)

INPUT_SVG=moonpiebot.svg
OUTPUT_PNG_BASENAME=moonpiebot_

# Declare an array with the png image sizes to export
array=( 128 256 )
for i in "${array[@]}"
do
	# Export each size as a `png` image file
	inkscape "$INPUT_SVG" -o "$OUTPUT_PNG_BASENAME${i}.png" -w "$i" -h "$i"
done
