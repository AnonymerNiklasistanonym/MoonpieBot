#!/usr/bin/env bash

# Prerequisites:
# `imagemagick` 6.9 (https://imagemagick.org/index.php)

INPUT_SVG=moonpiebot.svg
OUTPUT_ICO=moonpiebot.ico
OUTPUT_ICO_GRAYSCALE=moonpiebot_greyscale.ico
OUTPUT_ICO_GREEN=moonpiebot_green.ico
OUTPUT_ICO_ORANGE=moonpiebot_orange.ico
OUTPUT_ICO_PURPLE=moonpiebot_purple.ico

# Create `ico` image file
# https://iconhandbook.co.uk/reference/chart/windows/
# Windows needs: 16x16, 24x24, 32x32, 48x48, 64x64, 128x128
convert -background none "$INPUT_SVG" -define icon:auto-resize=128,64,48,32,16 "$OUTPUT_ICO"

# Create grayscaled `ico` image file by converting the normal `ico` image file
convert "$OUTPUT_ICO" -colorspace gray "$OUTPUT_ICO_GRAYSCALE"
# Create colored `ico` image files by converting the normal `ico` image file
convert "$OUTPUT_ICO" -colorspace gray -colorspace rgb +level-colors ,Green "$OUTPUT_ICO_GREEN"
convert "$OUTPUT_ICO" -colorspace gray -colorspace rgb +level-colors ,Orange "$OUTPUT_ICO_ORANGE"
convert "$OUTPUT_ICO" -colorspace gray -colorspace rgb +level-colors ,Purple "$OUTPUT_ICO_PURPLE"
