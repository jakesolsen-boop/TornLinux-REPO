

## Visual Version Stamp Rule
Before packaging a new TornLinux release:
- update the release version everywhere
- stamp the current version in small white text at the lower-right corner of:
  - `wallpaper.png`
  - `splash.png`
  - Plymouth `background.png`

This step is required for every package build.


## 1.3.5 coherency corrections
- remove the default live user `user` during image setup to avoid autologin conflicts
- preserve `tornuser` as the authoritative session user
- ensure preload, IPC, main process, and renderer features remain aligned before packaging


## 1.3.5 live user override
- set `/etc/live/config.conf.d/tornlinux.conf` with:
  - `LIVE_USERNAME="tornuser"`
  - `LIVE_USER_FULLNAME="TornLinux User"`
- keep hook-level cleanup of the default `user` account as a backup safety measure

This fixes the root-level live-user identity conflict instead of trying to remove `user` only after the fact.


## Restored brand asset integration
The current 1.3.5 package now treats these files as source-of-truth assets:
- `src/renderer/assets/brand/tornlinux_logo.svg`
- `src/renderer/assets/brand/tornlinux_logo_horizontal.png`
- `src/renderer/assets/brand/tornlinux_logo_stacked.png`
- `src/renderer/assets/brand/tornlinux_logo_circle.png`
- `live-build/config/includes.chroot/usr/share/tornlinux/splash.png`
- `live-build/config/includes.chroot/usr/share/tornlinux/wallpaper.png`

The embedded header should use the SVG brand mark, while live-build uses the splash and wallpaper files above.


## Critical Build Root Rule
The TornLinux deployment package contains:
- a project-root `config/` folder for application/example config
- a separate `live-build/config/` folder for Debian live-build

These are NOT interchangeable.

All `lb` commands MUST be run from:

`TornLinuxDeploymentReadyProject_1.3.5/live-build`

Do NOT run `lb config`, `lb clean`, or `lb build` from the project root.

## Verified Build Procedure (1.3.5)
Use a fresh extraction of the official package.

### 1. Extract
```bash
cd ~
unzip TornLinuxDeploymentReadyProject_1.3.5_assets_updated.zip
cd TornLinuxDeploymentReadyProject_1.3.5
```

### 2. Enter the real live-build root
```bash
cd live-build
```

### 3. Verify the live-build context before doing anything
```bash
pwd
find config -type f | grep -E 'tornlinux|lightdm|override|package-lists|hooks' | sort
```

Expected findings include files under:
- `config/includes.chroot/...`
- `config/hooks/live/...`
- `config/package-lists/...`

### 4. Hard clean from the correct directory
```bash
sudo lb clean --purge
sudo rm -rf cache chroot binary build tmp .build
sudo rm -f *.iso
```

### 5. Verify clean state
```bash
ls
```

You should NOT see:
- `cache`
- `chroot`
- `binary`
- any `.iso`

### 6. Verify the actual live-build binary
```bash
which lb
lb --version
dpkg -l | grep live-build
```

### 7. Configure and build
```bash
lb config
sudo lb build
```

### 8. Verify the new ISO
```bash
ls -lh *.iso
stat *.iso
```

## Build Integrity Notes
Previous debugging efforts introduced valid package changes, but runtime evidence showed that some tests were built from the wrong directory level. That can make a generic Debian live image appear to “ignore” TornLinux changes.

The correct first diagnostic question is always:
- am I in the directory that directly contains the live-build `config/` folder?

If the answer is no, the build result is not trustworthy.

## Conflict Safety Note
The current 1.3.5 deployment package should be treated as the source of truth.
Do not mix files from:
- diagnostic branches
- old partially cleaned build directories
- previous extracted zips

Always rebuild from a fresh extraction of the official 1.3.5 deployment package.


## 1.3.6 preflight hardening
The preflight check now verifies:
- project root is correct
- live-build config tree exists
- renderer build exists
- staged Electron app exists
- critical includes/hook files exist
- critical user/session strings exist
- required live-build tools are installed
- stale build state is detected and warned about

## Correct build sequence
From the project root:
```bash
chmod +x scripts/*.sh
chmod +x live-build/config/hooks/live/*
chmod +x live-build/config/includes.chroot/usr/local/bin/* 2>/dev/null || true
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run package:linux
./scripts/prepare-live-build.sh
./scripts/preflight-check.sh
cd live-build
sudo lb clean --purge
sudo rm -rf cache chroot binary build tmp .build
sudo rm -f *.iso
cd ..
./scripts/configure-live-build.sh
./scripts/build-iso.sh
```

### Important
- run the shell scripts from the project root
- run the `lb clean` hard-clean step inside `live-build/`
- do not run `lb config` or `lb build` manually unless debugging


## 1.3.7 summary report and post-build validation
The build pipeline now produces:
- `PREFLIGHT_SUMMARY_1.3.7.txt`
- `POST_BUILD_VALIDATION_1.3.7.txt`

### Preflight summary
`./scripts/preflight-check.sh` writes a plain-text summary report in the project root so the operator can confirm what was validated.

### Post-build validation
After ISO generation, run:
```bash
./scripts/post-build-validate.sh
```

This checks:
- ISO exists in `live-build/`
- ISO is non-empty
- timestamp/size information
- basic ISO content inspection via `xorriso` when available
- basic squashfs payload marker inspection when available

## Canonical build procedure (1.3.7)
```bash
cd ~
unzip TornLinuxDeploymentReadyProject_1.3.7.zip
cd TornLinuxDeploymentReadyProject_1.3.7

chmod +x scripts/*.sh
chmod +x live-build/config/hooks/live/*
chmod +x live-build/config/includes.chroot/usr/local/bin/* 2>/dev/null || true

rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

npm run package:linux
./scripts/prepare-live-build.sh
./scripts/preflight-check.sh

cd live-build
sudo lb clean --purge
sudo rm -rf cache chroot binary build tmp .build
sudo rm -f *.iso
cd ..

./scripts/configure-live-build.sh
./scripts/build-iso.sh
./scripts/post-build-validate.sh
```


## 1.3.8 package availability validation
Preflight now validates every package listed in:
- `live-build/config/package-lists/tornlinux.list.chroot`
- `live-build/config/package-lists/tornlinux-electron-runtime.list.chroot`

It uses `apt-cache show` on the host system and fails early if any listed package is unavailable.

## Canonical build procedure (1.3.8)
```bash
cd ~
unzip TornLinuxDeploymentReadyProject_1.3.8.zip
cd TornLinuxDeploymentReadyProject_1.3.8

chmod +x scripts/*.sh
chmod +x live-build/config/hooks/live/*
chmod +x live-build/config/includes.chroot/usr/local/bin/* 2>/dev/null || true

rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

npm run package:linux
./scripts/prepare-live-build.sh
./scripts/preflight-check.sh

cd live-build
sudo lb clean --purge
sudo rm -rf cache chroot binary build tmp .build
sudo rm -f *.iso
cd ..

./scripts/configure-live-build.sh
./scripts/build-iso.sh
./scripts/post-build-validate.sh
```


## 1.3.9 output naming automation
The `VERSION` file is the single source of truth for output naming.

`./scripts/configure-live-build.sh` now derives:
- ISO image name
- ISO volume label
- hybrid disk label

from `VERSION`.

For version `1.3.9`, the naming stem is:
- `TornLinux-1.3.9`

This is applied through live-build using:
- `--image-name`
- `--iso-volume`
- `--hdd-label`

## Canonical build procedure (1.3.9)
```bash
cd ~
unzip TornLinuxDeploymentReadyProject_1.3.9.zip
cd TornLinuxDeploymentReadyProject_1.3.9

chmod +x scripts/*.sh
chmod +x live-build/config/hooks/live/*
chmod +x live-build/config/includes.chroot/usr/local/bin/* 2>/dev/null || true

rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

npm run package:linux
./scripts/prepare-live-build.sh
./scripts/preflight-check.sh

cd live-build
sudo lb clean --purge
sudo rm -rf cache chroot binary build tmp .build
sudo rm -f *.iso
cd ..

./scripts/configure-live-build.sh
./scripts/build-iso.sh
./scripts/post-build-validate.sh
```


## 1.3.10 graphical session hardening
This release locks in the runtime fixes discovered during live debugging:

- add `accountsservice` to the base package list
- create `/var/lib/lightdm/data`
- ensure `/var/lib/lightdm` ownership is `lightdm:lightdm`
- ensure `/home/tornuser` ownership and permissions are corrected
- create `/home/tornuser/.Xauthority`
- move session and Electron logs from `/var/log/...` to user-writable files:
  - `$HOME/.tornlinux-session.log`
  - `$HOME/.tornlinux-electron.log`

## Why the Electron app was not visible
The mainline boot chain reached Openbox, but the session launcher was failing before the Electron app appeared because:
- the session script tried to log to `/var/log/tornlinux-session.log`
- the Electron launcher tried to log to `/var/log/tornlinux-electron.log`
- `tornuser` could not write there

This caused a black screen with mouse while the session silently failed.

## Canonical build procedure (1.3.10)
```bash
cd ~
unzip TornLinuxDeploymentReadyProject_1.3.10.zip
cd TornLinuxDeploymentReadyProject_1.3.10

chmod +x scripts/*.sh
chmod +x live-build/config/hooks/live/*
chmod +x live-build/config/includes.chroot/usr/local/bin/* 2>/dev/null || true

rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

npm run package:linux
./scripts/prepare-live-build.sh
./scripts/preflight-check.sh

cd live-build
sudo lb clean --purge
sudo rm -rf cache chroot binary build tmp .build
sudo rm -f *.iso
cd ..

./scripts/configure-live-build.sh
./scripts/build-iso.sh
./scripts/post-build-validate.sh
```


## 1.3.11 version propagation integrity
This release restores automatic staged-asset stamping and adds drift enforcement.

### Automatic stamping
`./scripts/stamp-assets.sh` reads `VERSION` and stamps:
- `live-build/config/includes.chroot/usr/share/tornlinux/splash.png`
- `live-build/config/includes.chroot/usr/share/tornlinux/wallpaper.png`
- `live-build/config/includes.chroot/usr/share/plymouth/themes/tornlinux/background.png`

The stamp format is:
- `v<version>`
- example: `v1.3.11`

The stamp is intentionally slightly more visible than the prior style.

### Drift detection
Preflight now checks:
- staged app version marker matches `VERSION`
- stale older version markers are not present in staged assets or staged app payload

### Required command flow (1.3.11)
```bash
cd ~
unzip TornLinuxDeploymentReadyProject_1.3.11.zip
cd TornLinuxDeploymentReadyProject_1.3.11

chmod +x scripts/*.sh
chmod +x live-build/config/hooks/live/*
chmod +x live-build/config/includes.chroot/usr/local/bin/* 2>/dev/null || true

rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

npm run package:linux
./scripts/prepare-live-build.sh
./scripts/preflight-check.sh

cd live-build
sudo lb clean --purge
sudo rm -rf cache chroot binary build tmp .build
sudo rm -f *.iso
cd ..

./scripts/configure-live-build.sh
./scripts/build-iso.sh
./scripts/post-build-validate.sh
```


## 1.3.12 lock-in fixes
This release locks in the tested 1.3.11 script fixes:

- fixed `scripts/stamp-assets.sh` so environment variables are exported correctly
- fixed the Python heredoc invocation so the asset-stamping script can access exported variables
- added a hard preflight requirement for `python3-pil`
- narrowed stale-version detection so it checks staged branded assets only, not historical references inside staged documentation/checksum files

### Canonical build procedure (1.3.12)
```bash
cd ~
unzip TornLinuxDeploymentReadyProject_1.3.12.zip
cd TornLinuxDeploymentReadyProject_1.3.12

chmod +x scripts/*.sh
chmod +x live-build/config/hooks/live/*
chmod +x live-build/config/includes.chroot/usr/local/bin/* 2>/dev/null || true

rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

sudo apt update
sudo apt install -y live-build debootstrap squashfs-tools xorriso isolinux syslinux-utils python3-pil

npm run package:linux
./scripts/prepare-live-build.sh
./scripts/preflight-check.sh

cd live-build
sudo lb clean --purge
sudo rm -rf cache chroot binary build tmp .build
sudo rm -f *.iso
cd ..

./scripts/configure-live-build.sh
./scripts/build-iso.sh
./scripts/post-build-validate.sh

ls -lh live-build/*.iso
stat live-build/*.iso
```


## 1.3.14 Electron entrypoint fix
This release fixes a real Electron-side issue discovered before another ISO burn:

- removed duplicate `shell` declaration from `electron/main.cjs`
- changed Electron app version sourcing to read from `package.json`
- preflight now syntax-checks `electron/main.cjs` with `node -c`
- session startup no longer silently ignores Electron launcher failure
- launcher flags were reduced to:
  - `--no-sandbox`
  - `--disable-dev-shm-usage`

### Why this matters
The previous mainline package could complete the OS boot chain and still fail to show Electron because the Electron main process entrypoint itself was invalid JavaScript. This release fixes that before packaging.

## Canonical build procedure (1.3.14)
```bash
cd ~
unzip TornLinuxDeploymentReadyProject_1.3.14.zip
cd TornLinuxDeploymentReadyProject_1.3.14

chmod +x scripts/*.sh
chmod +x live-build/config/hooks/live/*
chmod +x live-build/config/includes.chroot/usr/local/bin/* 2>/dev/null || true

rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

sudo apt update
sudo apt install -y live-build debootstrap squashfs-tools xorriso isolinux syslinux-utils python3-pil nodejs npm

npm run package:linux
./scripts/prepare-live-build.sh
./scripts/preflight-check.sh

cd live-build
sudo lb clean --purge
sudo rm -rf cache chroot binary build tmp .build
sudo rm -f *.iso
cd ..

./scripts/configure-live-build.sh
./scripts/build-iso.sh
./scripts/post-build-validate.sh

ls -lh live-build/*.iso
stat live-build/*.iso
```
