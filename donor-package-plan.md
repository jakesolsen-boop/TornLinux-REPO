# TornLinux Donor Package Plan

Target branch: donor/1-5-1-app-support
Base branch: dev

## Goal
Recover the proven 1.5.1 app/electron feature layer on top of the stable 1.3.14 build base without blindly replacing build-layer stability work.

## Stage 1
- regenerate preflight-check.sh as hybrid
- regenerate stamp-assets.sh as hybrid
- merge proven package-list additions

## Stage 2
- import renderer donor block
- import electron main/preload donor block

## Stage 3
- validate build and boot

## Proven package additions
- blueman
- alsa-utils
- bluez
- pipewire
- pipewire-pulse
- wireplumber
- calamares

## Keep from stable
- prepare-live-build.sh
- configure-live-build.sh
- build-iso.sh
- post-build-validate.sh

## Regenerate
- preflight-check.sh
- stamp-assets.sh
