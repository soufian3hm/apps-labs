#!/bin/bash
set -e
export GENERATE_SOURCEMAP=false
export CI=false
export DISABLE_ESLINT_PLUGIN=true
npm run build

