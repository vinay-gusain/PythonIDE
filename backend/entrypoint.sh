#!/bin/bash

# Create a temporary directory for user code
mkdir -p /tmp/code
cd /tmp/code

# Set up Python environment
export PYTHONPATH=/tmp/code

# Start Python REPL with unbuffered output
exec python3 -u 