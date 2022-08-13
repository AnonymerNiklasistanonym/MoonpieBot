#!/usr/bin/env bash

set -e

# Install the following things first:
# - pandoc

echo "---------------------------------------------------------"
echo "Build MAN page [Linux]:  <Bash>"
echo "---------------------------------------------------------"

# Display node/npm version
echo "pandoc:"
pandoc --version

# Get the current directory
CALL_DIR="$PWD"
# Go to the location of this directory even if the script is being run from
# somewhere else
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";
cd "$SCRIPT_DIR"
# Go to the root directory of this repository
cd ..

# Create the man page
mkdir -p "bin"
pandoc "installer/man.md" -s -t man -o "bin/moonpiebot-man.1"

# Go back to the call directory
cd "$CALL_DIR"
