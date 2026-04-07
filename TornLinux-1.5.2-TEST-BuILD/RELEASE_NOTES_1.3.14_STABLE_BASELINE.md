# TornLinux 1.3.14 Stable Baseline

## Overview
This package returns to the last known-good working line and bakes in only the proven required runtime/build fixes.

## Baked-in fixes
- deterministic packaged app staging with `cp -a "$APP_DIR"/. "$TARGET_DIR"/`
- staged app execute permissions with `chmod -R 755 "$TARGET_DIR"`
- `bash ./scripts/stamp-assets.sh` invocation in prepare step
- preflight guards for the stable-baseline corrections

## Intent
Confirm a reproducible, working baseline before layering later UX and installer features on top.
