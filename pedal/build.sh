#/bin/sh
em++ -s BINARYEN_ASYNC_COMPILATION=0 -s SINGLE_FILE=1 Processor.cpp -s ENVIRONMENT=worker --post-js=post.js