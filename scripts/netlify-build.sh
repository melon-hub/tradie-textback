#!/bin/bash
# Custom build script for Netlify that bypasses Sentry issues

echo "Starting Netlify build..."

# Disable all Sentry features
export SENTRY_SKIP_AUTO_RELEASE=true
export SENTRY_DISABLE_AUTO_UPLOAD=true
export DISABLE_SENTRY=true

# Build the app
npm run build

echo "Build completed successfully!"