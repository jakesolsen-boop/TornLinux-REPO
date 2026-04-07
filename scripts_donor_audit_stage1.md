# TornLinux Script and Package Donor Audit — Stage 1

Branch: donor/1-5-1-app-support

## Keep from stable 1.3.14
- scripts/prepare-live-build.sh
- scripts/configure-live-build.sh
- scripts/build-iso.sh
- scripts/post-build-validate.sh

## Borrow from 1.5.1
Add these packages to the stable tornlinux.list.chroot:
- blueman
- alsa-utils
- bluez
- pipewire
- pipewire-pulse
- wireplumber
- calamares

## Regenerate
- scripts/preflight-check.sh
  - keep 1.3.14 safety checks
  - add 1.5.1 checks for preload bridge methods and assets/master
- scripts/stamp-assets.sh
  - use assets/master as source of truth
  - preserve stable staged stamping behavior

## Migrate carefully
- Plymouth tornlinux.script
- Plymouth tornlinux.plymouth

## Notes
The 1.5.1 app/electron feature layer introduces proven dependencies for network status, Bluetooth, audio control, and installer launch. Those require package-layer support but do not justify wholesale replacement of stable build scripts.
