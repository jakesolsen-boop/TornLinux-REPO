# TornLinux Deployment-Ready Project 1.5.2

This tree is the current `1.5.2` test build for TornLinux. It carries the active Electron shell, live-build packaging, dual-key Torn and TornStats integration, and the current header and overlay work.

## Current Focus

- Dual API-key setup for Torn and TornStats
- Richer header and TornStats popup overlay
- Electron shell plus live-build ISO pipeline
- Local preview page for layout and flow checks

## Required human steps

- install dependencies
- build the renderer
- package the Electron app
- prepare the live-build tree
- run the preflight check
- build the ISO
- boot test on target hardware
