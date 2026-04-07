# TornLinux Manifesto v1.3.14

## Core Identity
TornLinux is a purpose-built command center operating system for Torn.

## Electron Integrity Rule
The application entrypoint must be syntax-valid before packaging, and runtime launch failures must not be silently swallowed by the session wrapper.

## Version Propagation Integrity Rule
Branded staged assets and the staged application payload must derive their release identity from `VERSION`.
