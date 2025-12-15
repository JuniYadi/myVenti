#!/bin/bash

# Build script that loads .env variables and runs the local build
# This script ensures environment variables from .env are available during the build process

set -e  # Exit on any error

echo "🔧 Loading environment variables from .env file..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Read and export all variables from .env file
# Skip comments and empty lines
while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip empty lines and comments
    if [[ -z "$line" || "$line" == \#* ]]; then
        continue
    fi

    # Export the variable
    export "$line"
    echo "✓ Exported: $line"
done < .env

echo ""
echo "🏗️  Starting Android build with environment variables..."
echo "Build command: npm run build:a:preview"
echo ""

# Run the build command
npm run build:a:preview

echo ""
echo "✅ Build completed successfully!"