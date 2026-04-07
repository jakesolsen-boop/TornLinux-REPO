# TornLinux Deployment-Ready Project 1.1.0

This release advances the Command Center to 1.1.0 with a cleaner status model, stronger release hygiene, and safer ISO build guardrails.

## Included in 1.1.0

- Happiness removed from the header contract and UI
- Header prop contract aligned with the renderer call site
- Unified status model upgraded from a flat string to a structured object
- Single status chip added with dynamic icons for okay, hospital, jail, travel, abroad, and offline states
- Countdown display added for timed statuses when Torn provides `until`
- Electron window fallback display path added for easier boot debugging
- Renderer load and process failure logging added
- Preflight build check script added
- Implementation flow updated to require live-build staging before ISO creation

## Required human steps

- install dependencies
- build the renderer
- package the Electron app
- prepare the live-build tree
- run the preflight check
- build the ISO
- boot test on target hardware
