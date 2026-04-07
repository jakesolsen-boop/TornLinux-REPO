# TornLinux 1.5.1

## Overview
Immediate correction patch locking in two previously manual rebuild fixes.

## Changes in 1.5.1
- preload bridge now exposes `launchNetworkSettings`
- preload bridge now exposes `getNetworkStatus`
- prepare-live-build now applies `chmod -R 755 "$TARGET_DIR"` after staging
