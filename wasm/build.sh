#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

em++ \
  -s BINARYEN_ASYNC_COMPILATION=0 -s \
  -s SINGLE_FILE=1 \
  --post-js=wam-processor.js \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s 'EXPORTED_RUNTIME_METHODS=["ccall", "cwrap", "setValue"]' \
  -I. -o compiled/PlatverbModule.js ./*.cpp valley/*.cpp
