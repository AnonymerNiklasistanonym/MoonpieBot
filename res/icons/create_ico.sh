#!/usr/bin/env bash

# Prerequisites:
# `imagemagick` 7.1.0 (https://imagemagick.org/index.php)

INPUT_SVG=moonpiebot.svg
OUTPUT_ICO=moonpiebot.ico

# Create `ico` image set file
# https://iconhandbook.co.uk/reference/chart/windows/
# Windows needs: 16x16, 24x24, 32x32, 48x48, 64x64, 128x128
convert -background none "$INPUT_SVG" -define icon:auto-resize=128,64,48,32,16 "$OUTPUT_ICO"
