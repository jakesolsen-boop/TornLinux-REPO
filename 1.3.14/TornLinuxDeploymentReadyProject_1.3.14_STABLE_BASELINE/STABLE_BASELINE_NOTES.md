# TornLinux 1.3.14 Stable Baseline

This package intentionally returns to the last known-good baseline: 1.3.14.

It only bakes in the proven required fixes discovered during manual debugging after 1.3.14:

- deterministic staged app copy in `scripts/prepare-live-build.sh`
- staged app execute permissions baked into build
- stamp-assets invoked via `bash` to prevent execution-bit drift after unzip
- preflight verifies those stable-baseline corrections before build

This package does NOT attempt to carry forward later feature-layer work.
Its purpose is to establish a clean, reproducible baseline that launches Electron automatically.
