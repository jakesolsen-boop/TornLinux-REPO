# Stability Patch Summary

## Fixed
- Electron runtime now uses CommonJS
- main/preload no longer import TS files at runtime
- renderer no longer imports fs/path/os code
- unified state now comes from main-process IPC
- renderer load path hardened to dist/renderer/index.html
- launcher includes Linux stability flags
- X session fallback logging added

## Human-only work remains
- npm install
- npm run typecheck
- npm run build:renderer
- npm run package:linux
- npm run prepare:live-build
- npm run live-build:config
- npm run live-build:build
