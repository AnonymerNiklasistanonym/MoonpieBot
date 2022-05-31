#!/usr/bin/env bash

# Prerequisites:
# `inkscape` 1.2 (https://inkscape.org/)

INPUT_SVG=moonpiebot.svg
OUTPUT_PNG_BASENAME=moonpiebot

# Declare an array with the png image sizes to export
DEFAULT_SIZE=128
array=( $DEFAULT_SIZE )
for i in "${array[@]}"
do
	# Export each size as a `png` image file
	inkscape "$INPUT_SVG" -o "${OUTPUT_PNG_BASENAME}_${i}.png" -w "$i" -h "$i"
done

# Rename the default size
mv "${OUTPUT_PNG_BASENAME}_128.png" "${OUTPUT_PNG_BASENAME}.png"
